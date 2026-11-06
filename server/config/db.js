const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const mongoUri = process.env.MONGO_URI || (process.env.NODE_ENV === 'production' || process.env.VERCEL ? null : 'mongodb://127.0.0.1:27018/serveease');
    if (!mongoUri) {
      throw new Error(
        'MONGO_URI is missing in production! Please configure your MongoDB Atlas connection string in Render / Cloud environment variables.'
      );
    }

    cached.promise = mongoose.connect(mongoUri).then((m) => {
      console.log(`[Database] MongoDB Connected: ${m.connection.host}/${m.connection.name}`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error(`[Database Error] ${error.message}`);
    // Only exit in local development if explicitly requested, not in cloud/production environments
    if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
