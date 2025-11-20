/**
 * Test Server Setup
 * Creates Express app for testing without auto-connecting to database
 * Database connection is handled by test setup files
 */

const express = require('express');
const cors = require('cors');

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Import routes
const routes = require('../../routes');
app.use('/api', routes);

const uploadRoutes = require('../../routes/upload.routes');
app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Test server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

module.exports = app;
