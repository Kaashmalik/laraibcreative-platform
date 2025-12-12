// D:\Laraib Creative\laraibcreative\backend\server.js
// =================================================================
// LARAIB CREATIVE - BACKEND SERVER
// Complete production-ready server with error handling
// =================================================================

require('dotenv').config();
require('express-async-errors'); // Handle async errors automatically

// DNS Fix for MongoDB Atlas on Windows (Only use in local development)
if (process.platform === 'win32') {
  try {
    require('./dns-fix');
  } catch (err) {
    // Ignore if file doesn't exist
  }
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Validate environment variables
const { validateEnv } = require('./src/config/validateEnv');
validateEnv();

// =================================================================
// GLOBAL ERROR HANDLERS
// =================================================================
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION at:', promise);
  console.error('Reason:', reason);
});

// =================================================================
// INITIALIZE EXPRESS APP
// =================================================================
const app = express();

// Trust proxy (important for rate limiting behind proxies)
app.set('trust proxy', 1);

// =================================================================
// SECURITY MIDDLEWARE
// =================================================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Allow external resources
}));

// =================================================================
// CORS CONFIGURATION
// =================================================================
// Allow-list browser origins, but do not require an Origin header.
// Many production probes (health checks, webhooks, server-to-server) omit it.
const corsOptions = {
  origin: function (origin, callback) {
    const isProduction = process.env.NODE_ENV === 'production';

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL,
      'https://laraibcreative.com',
      'https://www.laraibcreative.com',
      'https://laraibcreative.studio',
      'https://www.laraibcreative.studio'
    ].filter(Boolean);

    // If no Origin header (e.g., curl, Postman, uptime checks), allow it.
    if (!origin) {
      return callback(null, true);
    }

    // Browser request with Origin header: enforce allow-list in production.
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (isProduction) {
      console.warn(`⚠️  CORS: Blocked request from unauthorized origin: ${origin}`);
      return callback(new Error(`CORS: Origin ${origin} is not allowed`));
    }

    // In development allow all origins for easier testing
    return callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
  maxAge: 86400 // 24 hours - cache preflight requests
};

app.use(cors(corsOptions));
// Handle preflight across the board
app.options('*', cors(corsOptions));

// =================================================================
// BODY PARSING MIDDLEWARE
// =================================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser()); // Parse cookies for JWT tokens

// =================================================================
// SANITIZE DATA
// =================================================================
app.use(mongoSanitize());

// =================================================================
// COMPRESSION
// =================================================================
app.use(compression());

// =================================================================
// LOGGING MIDDLEWARE
// =================================================================
// Import comprehensive logging middleware
const { 
  httpLogger, 
  apiMetricsLogger, 
  rateLimitLogger, 
  authLogger,
  errorLogger 
} = require('./src/middleware/logger.middleware');

// Import monitoring middleware
const {
  monitoringMiddleware,
  adminMonitoringMiddleware,
  healthCheckMiddleware
} = require('./src/middleware/monitoring.middleware');

// Use comprehensive logger middleware for production monitoring
if (process.env.NODE_ENV === 'production') {
  // Production: Use optimized logger with monitoring
  app.use(healthCheckMiddleware);
  app.use(monitoringMiddleware);
  app.use(httpLogger);
  app.use(apiMetricsLogger);
  app.use(rateLimitLogger);
  app.use(authLogger);
  app.use(adminMonitoringMiddleware);
  
  // Also keep morgan for access logs
  const logsDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  const accessLogStream = fs.createWriteStream(
    path.join(logsDir, 'access.log'),
    { flags: 'a' }
  );
  app.use(morgan('combined', { stream: accessLogStream }));
} else {
  // Development: Use detailed logger
  app.use(morgan('dev'));
  app.use(monitoringMiddleware);
  app.use(httpLogger);
  app.use(apiMetricsLogger);
  app.use(adminMonitoringMiddleware);
}

// =================================================================
// RATE LIMITING
// =================================================================
// Production-optimized rate limits
const isProduction = process.env.NODE_ENV === 'production';

// General API rate limiter - more lenient in production for legitimate traffic
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 200 : 100, // Higher limit in production
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/health',
  // Custom handler for rate limit exceeded
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes',
      timestamp: new Date().toISOString()
    });
  }
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Strict limit for auth endpoints
  message: {
    success: false,
    error: 'Too many login attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts. Please try again after 15 minutes.',
      retryAfter: '15 minutes',
      timestamp: new Date().toISOString()
    });
  }
});

// Rate limiter for file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isProduction ? 20 : 10, // More lenient in production
  message: {
    success: false,
    error: 'Too many file uploads. Please try again later.',
    retryAfter: '1 hour'
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many file uploads from this IP. Please try again after 1 hour.',
      retryAfter: '1 hour',
      timestamp: new Date().toISOString()
    });
  }
});

// Apply rate limiters
app.use('/api/', limiter);
app.use('/api/v1/upload', uploadLimiter);

// =================================================================
// STATIC FILES
// =================================================================
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}
app.use('/uploads', express.static(uploadsDir));

// =================================================================
// HEALTH CHECK ENDPOINT (Enhanced for Monitoring)
// =================================================================
app.get('/health', async (req, res) => {
  const healthStatus = {
    success: true,
    status: 'OK',
    message: 'LaraibCreative API is running',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    checks: {
      database: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host || 'N/A',
        name: mongoose.connection.name || 'N/A'
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100) + '%',
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB'
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        cpuUsage: process.cpuUsage()
      }
    }
  };

  // Check if database is connected
  const dbConnected = mongoose.connection.readyState === 1;
  
  // If database is not connected, return 503 (Service Unavailable)
  if (!dbConnected) {
    healthStatus.status = 'DEGRADED';
    healthStatus.message = 'API is running but database is not connected';
    return res.status(503).json(healthStatus);
  }

  // All checks passed
  res.status(200).json(healthStatus);
});

// Detailed health check endpoint with monitoring data
app.get('/health/detailed', async (req, res) => {
  const healthStatus = {
    success: true,
    status: 'OK',
    message: 'LaraibCreative API - Detailed Health Check',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    checks: {
      database: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host || 'N/A',
        name: mongoose.connection.name || 'N/A',
        collections: mongoose.connection.collections ? Object.keys(mongoose.connection.collections).length : 0
      },
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
        external: Math.round(process.memoryUsage().external / 1024 / 1024) + ' MB',
        percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100) + '%'
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        cpuUsage: process.cpuUsage(),
        pid: process.pid
      },
      monitoring: {
        logLevel: process.env.LOG_LEVEL || 'info',
        monitoringEnabled: true
      }
    }
  };

  // Check if database is connected
  const dbConnected = mongoose.connection.readyState === 1;
  
  // If database is not connected, return 503 (Service Unavailable)
  if (!dbConnected) {
    healthStatus.status = 'DEGRADED';
    healthStatus.message = 'API is running but database is not connected';
    return res.status(503).json(healthStatus);
  }

  // All checks passed
  res.status(200).json(healthStatus);
});

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to LaraibCreative API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      docs: '/api-docs'
    }
  });
});

// =================================================================
// SAFE ROUTE LOADING WITH ERROR HANDLING
// =================================================================
const loadRoute = (path, routePath) => {
  try {
    if (fs.existsSync(path)) {
      const route = require(path);
      app.use(routePath, route);
      console.log(`✅ Loaded route: ${routePath}`);
      return true;
    } else {
      console.log(`⚠️  Route file not found: ${path}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error loading route ${routePath}:`, error.message);
    return false;
  }
};

// Load all routes using centralized route index
console.log('\n📦 Loading routes...');
try {
  const apiRoutes = require('./src/routes/index');
  app.use('/api', apiRoutes);
  // Apply rate limiting to auth routes
  app.use('/api/v1/auth/login', authLimiter);
  app.use('/api/v1/auth/admin-login', authLimiter);
  app.use('/api/v1/auth/register', authLimiter);
  console.log('✅ All routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
  // Fallback to individual route loading
  console.log('⚠️  Falling back to individual route loading...');
  loadRoute('./src/routes/auth.routes.js', '/api/v1/auth') && app.use('/api/v1/auth/login', authLimiter) && app.use('/api/v1/auth/admin-login', authLimiter) && app.use('/api/v1/auth/register', authLimiter);
  loadRoute('./src/routes/product.routes.js', '/api/v1/products');
  loadRoute('./src/routes/order.routes.js', '/api/v1/orders');
  loadRoute('./src/routes/customer.routes.js', '/api/v1/customers');
  loadRoute('./src/routes/category.routes.js', '/api/v1/categories');
  loadRoute('./src/routes/review.routes.js', '/api/v1/reviews');
  loadRoute('./src/routes/blog.routes.js', '/api/v1/blogs');
  loadRoute('./src/routes/upload.routes.js', '/api/v1/upload');
  loadRoute('./src/routes/measurement.routes.js', '/api/v1/measurements');
  loadRoute('./src/routes/analytics.routes.js', '/api/v1/analytics');
  loadRoute('./src/routes/settings.routes.js', '/api/v1/settings');
}

// =================================================================
// 404 HANDLER
// =================================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
    availableRoutes: [
      '/health',
      '/api/auth',
      '/api/products',
      '/api/orders',
      '/api/customers',
      '/api/categories'
    ]
  });
});

// =================================================================
// GLOBAL ERROR HANDLER
// =================================================================
// Use error logger middleware before error handler
app.use(errorLogger);

app.use((err, req, res, next) => {
  // Error is already logged by errorLogger middleware
  // Additional console logging for development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err.message);
    console.error('Stack:', err.stack);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// =================================================================
// DATABASE CONNECTION WITH RETRY LOGIC
// =================================================================
const connectDB = async (retries = 5) => {
  // Extract cluster info from URI for display
  const uri = process.env.MONGODB_URI;
  let clusterInfo = 'MongoDB Atlas';
  let dbName = 'laraibcreative';
  
  try {
    const uriMatch = uri.match(/(@.*\.mongodb\.net)/);
    if (uriMatch) {
      clusterInfo = uriMatch[1].substring(1); // Remove @ symbol
    }
    const dbMatch = uri.match(/\/([^/?]+)(\?|$)/);
    if (dbMatch && dbMatch[1]) {
      dbName = dbMatch[1];
    }
  } catch (e) {
    // Ignore parsing errors
  }
  
  console.log('\n🔌 Connecting to MongoDB...');
  console.log(`📍 Cluster: ${clusterInfo}`);
  console.log(`💾 Database: ${dbName}`);
  
  for (let i = 0; i < retries; i++) {
    try {
      const connectOptions = {
        serverSelectionTimeoutMS: 60000, // 60 seconds for slow DNS
        socketTimeoutMS: 75000, // 75 seconds
        connectTimeoutMS: 60000, // 60 seconds initial connection
        maxPoolSize: 10,
        minPoolSize: 2,
        retryWrites: true,
        retryReads: true
      };

      // Only force IPv4 on Windows to fix local DNS issues
      if (process.platform === 'win32') {
        connectOptions.family = 4;
      }

      await mongoose.connect(process.env.MONGODB_URI, connectOptions);
      
      console.log('✅ MongoDB connected successfully');
      console.log(`📊 Connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
      console.log(`🗄️  Database name: ${mongoose.connection.name}`);
      return;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${i + 1}/${retries} failed:`);
      console.error(`   Error: ${error.message}`);
      
      if (error.message.includes('ETIMEOUT') || error.message.includes('ENOTFOUND') || error.message.includes('queryTxt')) {
        console.log('   💡 Possible causes:');
        console.log('      1. MongoDB Atlas cluster is paused (auto-resumes in 30-60s)');
        console.log('      2. Network/Firewall blocking connection (check VPN/Proxy)');
        console.log('      3. IP not whitelisted in MongoDB Atlas (add 0.0.0.0/0)');
        console.log('      4. DNS resolution issue (check internet connection)');
        console.log('      5. Invalid connection string or password encoding');
      }
      
      if (error.message.includes('Authentication failed')) {
        console.log('   💡 Authentication issue:');
        console.log('      1. Check username and password in .env file');
        console.log('      2. Verify password special characters are URL encoded');
        console.log('      3. Confirm database user exists in MongoDB Atlas');
      }
      
      if (i < retries - 1) {
        const waitTime = Math.min(1000 * Math.pow(2, i), 10000);
        console.log(`   ⏳ Retrying in ${waitTime / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        console.error('\n❌ Failed to connect to MongoDB after all retries');
        console.error('   Server will continue running but database operations will fail');
        console.error('\n   🔧 TROUBLESHOOTING STEPS:');
        console.error('   1. Go to MongoDB Atlas → Network Access');
        console.error('      Add IP: 0.0.0.0/0 (Allow from Anywhere)');
        console.error('   2. Go to Database Access → Verify user exists');
        console.error('   3. Check if cluster is PAUSED (it will auto-resume)');
        console.error('   4. Verify internet connection and disable VPN if active');
        console.error('   5. Try connecting from MongoDB Compass with same URI\n');
        // Don't exit - let server run for health checks
      }
    }
  }
};

// =================================================================
// MONGODB EVENT HANDLERS
// =================================================================
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB');
});

// =================================================================
// GRACEFUL SHUTDOWN - FIXED VERSION
// =================================================================
let server; // Declare server variable at module level

const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️  ${signal} signal received: starting graceful shutdown`);
  
  // Check if server exists before trying to close
  if (!server) {
    console.log('⚠️  Server not initialized, closing database only');
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close(false);
        console.log('✅ MongoDB connection closed');
      }
    } catch (err) {
      console.error('❌ Error closing MongoDB:', err.message);
    }
    process.exit(0);
    return;
  }
  
  // Stop accepting new requests
  server.close(async () => {
    console.log('✅ HTTP server closed');
    
    // Close database connection
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close(false);
        console.log('✅ MongoDB connection closed');
      }
    } catch (err) {
      console.error('❌ Error closing MongoDB:', err.message);
    }
    
    console.log('👋 Process terminated gracefully');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// =================================================================
// START SERVER
// =================================================================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 LARAIB CREATIVE - BACKEND SERVER');
  console.log('='.repeat(60));
  console.log(`📅 Started at: ${new Date().toISOString()}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 Node Version: ${process.version}`);
  console.log('='.repeat(60) + '\n');

  // Connect to database
  await connectDB();

  // Initialize cache (Redis or in-memory)
  try {
    const { initCache } = require('./src/utils/cache');
    await initCache();
  } catch (err) {
    console.warn('⚠️ Cache initialization failed, using defaults:', err.message);
  }

  // Start HTTP server
  server = app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`🌐 Local: http://localhost:${PORT}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    console.log(`📡 API Base: http://localhost:${PORT}/api`);
    console.log('='.repeat(60) + '\n');
    
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️  WARNING: Database not connected. Some features may not work.');
      console.log('   The server will keep retrying to connect in the background.\n');
    }
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
      console.error('   Try: npx kill-port ' + PORT);
      process.exit(1);
    } else {
      console.error('❌ Server error:', error.message);
      process.exit(1);
    }
  });
};

// Start the server
startServer().catch(err => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});

module.exports = app;