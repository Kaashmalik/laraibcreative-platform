//D:\Laraib Creative\laraibcreative\backend\src\server.js
// ============================================
// CRITICAL: Environment validation FIRST
// ============================================
require('./src/config/validateEnv')();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Load all models in correct order
const models = require('./src/models');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ Connected to MongoDB');
  
  // Create indexes on startup
  await models.ensureIndexes();
  
  // Seed default settings (only on first run)
  await models.Settings.seedDefaults();
  
  console.log('✅ Database ready!');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Import routes
const routes = require('./src/routes');
app.use('/api', routes);
const uploadRoutes = require('./src/routes/upload.routes');
app.use('/api/upload', uploadRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});