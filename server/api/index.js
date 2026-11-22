import app from '../src/app.js';
import connectDB from '../src/config/db.js';

let connecting;

// Vercel runs this function per request, so connect to MongoDB once and reuse the connection
export default async function handler(req, res) {
  try {
    connecting ||= connectDB();
    await connecting;
  } catch (err) {
    connecting = null;
    console.error('DB connection failed:', err.message);
    return res.status(500).json({ message: 'Database connection failed' });
  }
  return app(req, res);
}
