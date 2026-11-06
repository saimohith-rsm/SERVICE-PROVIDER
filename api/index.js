// Vercel Serverless Function entry point for ServeEase API
const app = require('../server/server');
const connectDB = require('../server/config/db');

module.exports = async (req, res) => {
  // Allow health check endpoint to respond immediately so reachability can always be verified
  if (req.url && (req.url.startsWith('/api/health') || req.url.startsWith('/health'))) {
    return app(req, res);
  }

  // Attempt database connection without crashing serverless cold starts
  try {
    await connectDB();
  } catch (error) {
    console.warn('[Vercel Serverless Database Warning]:', error.message);
  }
  return app(req, res);
};

