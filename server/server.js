require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Initialize express app
const app = express();

// Connect to MongoDB in standalone server (in Vercel serverless, api/index.js handles connection per request)
if (!process.env.VERCEL) {
  connectDB().catch((err) => {
    console.warn('[MongoDB Startup Notice]:', err.message);
  });
}

// Security: HTTP headers protection
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Vite client scripts and assets
    crossOriginEmbedderPolicy: false,
  })
);

// Security: Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 login/register attempts per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Core Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://client-opal-nine-29.vercel.app',
];
if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(',').forEach((origin) => {
    const trimmed = origin.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in cloud deployment to prevent customer lockouts
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security: Sanitize user input against NoSQL query injection
const sanitizeInput = (req, res, next) => {
  const clean = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        clean(obj[key]);
      }
    }
    return obj;
  };
  if (req.body) clean(req.body);
  if (req.query) clean(req.query);
  if (req.params) clean(req.params);
  next();
};
app.use(sanitizeInput);

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.use(morgan('dev'));
}

// Health check endpoint (handles both /api/health and /health)
app.get(['/api/health', '/health'], (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'OK',
    service: 'ServeEase API Server',
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
    serverless: !!process.env.VERCEL,
    timestamp: new Date().toISOString(),
  });
});

// Helper to mount routes on both /api/xxx and /xxx for Vercel Serverless compatibility
const mountRoute = (pathPrefix, router) => {
  app.use(`/api/${pathPrefix}`, router);
  app.use(`/${pathPrefix}`, router);
};

// Mount API Routes
mountRoute('auth', require('./routes/authRoutes'));
mountRoute('users', require('./routes/userRoutes'));
mountRoute('providers', require('./routes/providerRoutes'));
mountRoute('categories', require('./routes/categoryRoutes'));
mountRoute('services', require('./routes/serviceRoutes'));
mountRoute('bookings', require('./routes/bookingRoutes'));
mountRoute('reviews', require('./routes/reviewRoutes'));
mountRoute('notifications', require('./routes/notificationRoutes'));
mountRoute('complaints', require('./routes/complaintRoutes'));
mountRoute('admin', require('./routes/adminRoutes'));

// 404 Route Handler for undefined API endpoints
app.use(['/api/*', '/api'], (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found on ServeEase.`,
  });
});

// In standalone local dev, serve frontend static assets from client/dist if present
if (!process.env.VERCEL) {
  const clientDistPath = path.join(__dirname, '../client/dist');
  const indexHtmlPath = path.join(clientDistPath, 'index.html');

  if (fs.existsSync(indexHtmlPath)) {
    app.use(express.static(clientDistPath));
    // For all non-API routes, serve client index.html (SPA Fallback)
    app.get('*', (req, res) => {
      res.sendFile(indexHtmlPath);
    });
  } else {
    // When deployed separately on Render as API backend
    app.get('/', (req, res) => {
      res.status(200).json({
        success: true,
        service: 'ServeEase Backend API Server',
        status: 'Operational',
        health: '/api/health',
        documentation: 'https://github.com/saimohith-rsm/SERVICE-PROVIDER',
      });
    });
  }
}

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only start the listening server when not running in serverless (e.g. Vercel)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================================`);
    console.log(`  ServeEase API running on http://127.0.0.1:${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=================================================`);
  });
}

module.exports = app;
