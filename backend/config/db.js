// ==============================================================================
// Database Configuration (backend/config/db.js)
// Connects the Node.js / Express backend to MongoDB using the Mongoose ODM
// ==============================================================================

const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * Reads MONGO_URI from environment variables or falls back to local instance
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_club_db';

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host} (DB: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Could not connect to MongoDB: ${error.message}`);
    console.error(`[Database Help] Ensure your MongoDB service is running (e.g. mongod or MongoDB Windows Service).`);
    // Rethrow error so server can handle or exit appropriately
    throw error;
  }
};

module.exports = connectDB;
