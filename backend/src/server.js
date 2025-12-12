//D:\Laraib Creative\laraibcreative\backend\src\server.js
// ============================================
// CRITICAL: Load environment variables FIRST
// ============================================
require('dotenv').config();

// ============================================
// CRITICAL: Environment validation SECOND
// ============================================
const { validateEnv } = require('./config/validateEnv');
validateEnv();

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const http = require('http');
const databaseManager = require('./config/database');
const logger = require('./utils/logger');

// Security middleware
const {
  applySecurityMiddleware,
  securityErrorHandler,
  bodyParserLimits
} = require('./middleware/security.middleware');
const { sanitizeInput } = require('./middleware/sanitize.middleware');
const { generalLimiter } = require('./middleware/rateLimiter');

// Performance middleware
const { defaultCompression } = require('./middleware/compression.middleware');
const { requestContextMiddleware, performanceMetricsMiddleware, updateUserContext } = require('./middleware/requestContext.middleware');
const { defaultTimeout, aiTimeout, uploadTimeout } = require('./middleware/timeout.middleware');

// Load all models in correct order
const models = require('./models');

const app = express();
let server = null;
let isShuttingDown = false;

// ============================================
// SECURITY MIDDLEWARE (APPLY FIRST)
// ============================================
applySecurityMiddleware(app);

// ============================================
// REQUEST CONTEXT & TRACKING
// ============================================
app.use(requestContextMiddleware);

// ============================================
// RESPONSE COMPRESSION
// ============================================
app.use(defaultCompression);

// ============================================
// BODY PARSING WITH SIZE LIMITS
// ============================================
app.use(express.json(bodyParserLimits.json));
app.use(express.urlencoded(bodyParserLimits.urlencoded));
app.use(cookieParser());

// Input sanitization (after body parser)
app.use(sanitizeInput());

// ============================================
// PERFORMANCE METRICS
// ============================================
app.use(performanceMetricsMiddleware({
  slowThreshold: 1000, // 1 second
  verySlowThreshold: 5000, // 5 seconds
  collectMemory: process.env.NODE_ENV !== 'production',
}));

// ============================================
// RATE LIMITING
// ============================================
app.use('/api', generalLimiter);

// ============================================
// DEFAULT TIMEOUT (before routes)
// ============================================
app.use('/api', defaultTimeout);

// Startup verification
const { runStartupVerification, quickHealthCheck } = require('./config/startupVerification');
const { rateLimiterService } = require('./services/rateLimiterService');

// ============================================
// DATABASE INITIALIZATION (TiDB + MongoDB)
// ============================================
async function initializeDatabases() {
  try {
    logger.info('🔧 Initializing databases...');
    
    // Initialize DatabaseManager (handles both TiDB and MongoDB)
    await databaseManager.initialize();
    
    // Create indexes on startup
    await models.ensureIndexes();
    
    // Seed default settings (only on first run)
    await models.Settings.seedDefaults();
    
    logger.info('✅ All databases ready!');
    
  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// ============================================
// SERVICES INITIALIZATION
// ============================================
async function initializeServices() {
  try {
    // Initialize rate limiter (uses in-memory by default, Redis if configured)
    await rateLimiterService.initialize();
    
    // Run startup verification for external services
    await runStartupVerification({
      exitOnCriticalFailure: process.env.NODE_ENV === 'production',
      verifyCloudinaryConnection: true
    });
    
  } catch (error) {
    logger.warn('⚠️ Services initialization warning:', error.message);
    // Don't exit - let the app try to run
  }
}

// ============================================
// ROUTE CONFIGURATION
// ============================================
function configureRoutes() {
  // Import routes
  const routes = require('./routes');
  const uploadRoutes = require('./routes/upload.routes');
  const healthRoutes = require('./routes/health.routes');
  
  // Health check routes (no auth required)
  app.use('/api/health', healthRoutes);
  
  // Apply specific timeouts for different route types
  app.use('/api/admin/ai', aiTimeout);
  app.use('/api/upload', uploadTimeout);
  
  // Main API routes
  app.use('/api', routes);
  app.use('/api/upload', uploadRoutes);
  
  // Update user context after auth middleware runs
  app.use(updateUserContext);
}

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================
function configureErrorHandling() {
  // Security error handler (before general error handler)
  app.use(securityErrorHandler);

  // 404 handler
  app.use((req, res, next) => {
    if (!res.headersSent) {
      res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`,
        code: 'ROUTE_NOT_FOUND',
      });
    }
  });

  // General error handler
  app.use((err, req, res, next) => {
    // Don't log if shutting down
    if (!isShuttingDown) {
      logger.error('[Error]', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
        requestId: req.requestId,
        ip: req.ip
      });
    }
    
    // Handle timeout errors
    if (req.timedout) {
      if (!res.headersSent) {
        return res.status(408).json({
          success: false,
          message: 'Request timeout',
          code: 'REQUEST_TIMEOUT',
        });
      }
      return;
    }
    
    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!res.headersSent) {
      res.status(err.status || err.statusCode || 500).json({
        success: false,
        message: isDevelopment ? err.message : 'An error occurred. Please try again later.',
        code: err.code || 'INTERNAL_ERROR',
        requestId: req.requestId,
        ...(isDevelopment && { stack: err.stack })
      });
    }
  });
}

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
async function gracefulShutdown(signal) {
  if (isShuttingDown) {
    logger.warn(`${signal} received again, forcing exit...`);
    process.exit(1);
  }
  
  isShuttingDown = true;
  logger.info(`🔄 ${signal} received, starting graceful shutdown...`);
  
  // Stop accepting new connections
  if (server) {
    server.close((err) => {
      if (err) {
        logger.error('Error closing server:', err);
      } else {
        logger.info('✅ HTTP server closed');
      }
    });
  }
  
  // Set a hard timeout for shutdown
  const shutdownTimeout = setTimeout(() => {
    logger.error('⏱️ Shutdown timeout exceeded, forcing exit');
    process.exit(1);
  }, 30000); // 30 seconds max
  
  try {
    // Close database connections
    logger.info('Closing database connections...');
    
    await Promise.all([
      databaseManager.shutdown(),
      mongoose.connection.close(),
    ]);
    
    logger.info('✅ Database connections closed');
    
    // Close rate limiter connections
    if (rateLimiterService && rateLimiterService.shutdown) {
      await rateLimiterService.shutdown();
      logger.info('✅ Rate limiter closed');
    }
    
    clearTimeout(shutdownTimeout);
    logger.info('✅ Graceful shutdown complete');
    process.exit(0);
    
  } catch (error) {
    logger.error('Error during shutdown:', error);
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
}

// ============================================
// UNCAUGHT ERROR HANDLERS
// ============================================
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', {
    message: error.message,
    stack: error.stack,
  });
  
  // Attempt graceful shutdown on uncaught exception
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  
  // Log but don't exit for unhandled rejections
  // They're often recoverable
});

// ============================================
// SIGNAL HANDLERS
// ============================================
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ============================================
// START SERVER
// ============================================
async function startServer() {
  try {
    await initializeDatabases();
    await initializeServices();
    
    // Configure routes
    configureRoutes();
    
    // Configure error handling (must be last)
    configureErrorHandling();
    
    // Create HTTP server
    const PORT = process.env.PORT || 5000;
    server = http.createServer(app);
    
    // Configure server timeouts
    server.timeout = 120000; // 2 minutes
    server.keepAliveTimeout = 65000; // Slightly higher than ALB default
    server.headersTimeout = 66000; // Slightly higher than keepAliveTimeout
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
        process.exit(1);
      }
      logger.error('Server error:', error);
    });
    
    // Start listening
    server.listen(PORT, () => {
      const dbStatus = databaseManager.getStatus();
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 Database Mode: ${dbStatus.activeService} ${dbStatus.fallbackMode ? '(Fallback)' : ''}`);
      logger.info(`🔗 Health Check: GET /api/health`);
      logger.info(`📈 Detailed Health: GET /api/health/detailed`);
      logger.info(`📊 Metrics: GET /api/health/metrics`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      
      // Console output for development
      if (process.env.NODE_ENV !== 'production') {
        console.log(`\n🚀 Server running at http://localhost:${PORT}`);
        console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
      }
    });
    
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Export for testing
module.exports = { app, server };
