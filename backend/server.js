// ==============================================================================
// Server Entry Point (backend/server.js)
// Campus Club Management System - Express Backend Server
// ==============================================================================

const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from workspace root .env or backend .env
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const connectDB = require('./config/db');
const clubRoutes = require('./routes/clubRoutes');
const membershipRoutes = require('./routes/membershipRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// -----------------------------------------------------------------------------
// Middleware Configuration
// -----------------------------------------------------------------------------

// Body parser middleware: parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files (HTML, CSS, JS) directly from Express
// This eliminates CORS issues and lets students access the app at a single local URL
app.use(express.static(path.join(__dirname, '../frontend')));

// -----------------------------------------------------------------------------
// REST API Routes
// -----------------------------------------------------------------------------
app.use('/api/clubs', clubRoutes);
app.use('/api/memberships', membershipRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Campus Club Management System API'
  });
});

// Catch-all for undefined API routes (404 JSON)
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint "${req.originalUrl}" not found.`
  });
});

// Fallback: For any other unmatched routes, serve index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// -----------------------------------------------------------------------------
// Start Server and Connect Database
// -----------------------------------------------------------------------------
let server = null;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    server = app.listen(PORT, () => {
      console.log('====================================================');
      console.log(' Campus Club Management System - Server Running');
      console.log('====================================================');
      console.log(` Local Application URL : http://localhost:${PORT}`);
      console.log(` REST API Base URL     : http://localhost:${PORT}/api/clubs`);
      console.log(` Health Check Endpoint : http://localhost:${PORT}/api/health`);
      console.log('====================================================');
    });
  } catch (err) {
    console.error('Failed to start server due to database connection error.');
    console.error('The server will still attempt to listen so frontend can display connection guidance.');
    server = app.listen(PORT, () => {
      console.log(`Server started in offline-database mode on http://localhost:${PORT}`);
    });
  }
};

// Start if executed directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
