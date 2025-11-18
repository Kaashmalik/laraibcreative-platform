// ==========================================
// LARAIB CREATIVE BACKEND SERVER
// ==========================================
// Production-ready Express server with all routes,
// middleware, error handling, and security configured
// ==========================================

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const expressMongoSanitize = require('express-mongo-sanitize');
require('express-async-errors');

// Load environment variables
dotenv.config();

// Import configurations
const { connectDB } = require('./config/db');
const { validateEnv } = require('./config/validateEnv');
const { HTTP_STATUS } = require('./config/constants');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const rateLimiter = require('./middleware/rateLimiter');

// Import routes
const apiRoutes = require('./routes/index');

// ==========================================
// VALIDATE ENVIRONMENT VARIABLES
// ==========================================
validateEnv();

// ==========================================
// INITIALIZE EXPRESS APP
// ==========================================
const app = express();

// ==========================================
// TRUST PROXY (for production behind reverse proxy)
// ==========================================
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================

// Helmet for security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:', 'http:'],
        connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'https://laraibcreative.studio',
      'https://www.laraibcreative.studio',
      'https://laraibcreative.com',
      'https://www.laraibcreative.com',
    ];

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// ==========================================
// BODY PARSING MIDDLEWARE
// ==========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==========================================
// DATA SANITIZATION
// ==========================================
// Prevent NoSQL injection attacks
app.use(expressMongoSanitize());

// ==========================================
// COMPRESSION
// ==========================================
app.use(compression());

// ==========================================
// LOGGING MIDDLEWARE
// ==========================================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// ==========================================
// RATE LIMITING
// ==========================================
app.use('/api/', rateLimiter);

// ==========================================
// HEALTH CHECK ENDPOINT
// ==========================================
app.get('/health', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

// ==========================================
// ROOT ENDPOINT
// ==========================================
app.get('/', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    message: 'Welcome to LaraibCreative API',
    version: 'v1',
    documentation: '/api/v1',
    health: '/health',
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// API ROUTES
// ==========================================
app.use('/api', apiRoutes);

// ==========================================
// 404 HANDLER
// ==========================================
app.use('*', (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND',
    },
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// ERROR HANDLING MIDDLEWARE (must be last)
// ==========================================
app.use(errorHandler);

// ==========================================
// GRACEFUL SHUTDOWN HANDLERS
// ==========================================
const gracefulShutdown = async (signal) => {
  logger.info(`\n⚠️  Received ${signal}. Starting graceful shutdown...`);

  try {
    // Close server
    server.close(() => {
      logger.info('✅ HTTP server closed');
    });

    // Close database connection
    const { disconnectDB } = require('./config/db');
    await disconnectDB();

    logger.info('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

let server;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start HTTP server
    server = app.listen(PORT, () => {
      logger.info('==========================================');
      logger.info('🚀 LaraibCreative Backend Server');
      logger.info('==========================================');
      logger.info(`✅ Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${NODE_ENV}`);
      logger.info(`📡 API Base URL: http://localhost:${PORT}/api`);
      logger.info(`💚 Health Check: http://localhost:${PORT}/health`);
      logger.info('==========================================');
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        logger.error('❌ Server error:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
