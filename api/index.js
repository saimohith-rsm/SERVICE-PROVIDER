// Vercel Serverless Function entry point for ServeEase API
const app = require('../server/server');
const connectDB = require('../server/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (error) {
    console.error('[Vercel Serverless Database Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Database connection failed. Please ensure MONGO_URI is configured in Vercel Project Settings.',
    });
  }
  return app(req, res);
};

