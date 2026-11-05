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
    const mongoUri = process.env.MONGO_URI || (process.env.VERCEL ? null : 'mongodb://127.0.0.1:27018/serveease');
    if (!mongoUri) {
      throw new Error(
        'MONGO_URI is missing on Vercel! Please add your MongoDB Atlas connection string to Vercel Settings -> Environment Variables.'
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
    // Only exit in standalone local dev, not serverless
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
