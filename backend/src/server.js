//D:\Laraib Creative\laraibcreative\backend\src\server.js
// ============================================
// CRITICAL: Environment validation FIRST
// ============================================
require('./src/config/validateEnv')();

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

// Security middleware
const {
  applySecurityMiddleware,
  securityErrorHandler,
  bodyParserLimits
} = require('./src/middleware/security.middleware');
const { sanitizeInput } = require('./src/middleware/sanitize.middleware');
const { generalLimiter } = require('./src/middleware/rateLimiter');

// Load all models in correct order
const models = require('./src/models');

const app = express();

// ============================================
// SECURITY MIDDLEWARE (APPLY FIRST)
// ============================================
applySecurityMiddleware(app);

// Body parser with size limits
app.use(express.json(bodyParserLimits.json));
app.use(express.urlencoded(bodyParserLimits.urlencoded));
app.use(cookieParser());

// Input sanitization (after body parser)
app.use(sanitizeInput());

// Rate limiting (after security middleware)
app.use('/api', generalLimiter);

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
// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// Security error handler (before general error handler)
app.use(securityErrorHandler);

// General error handler
app.use((err, req, res, next) => {
  // Log error details (but don't expose to client)
  console.error('[Error]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    message: isDevelopment ? err.message : 'An error occurred. Please try again later.',
    ...(isDevelopment && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});