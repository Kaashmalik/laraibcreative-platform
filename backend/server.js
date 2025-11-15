// D:\Laraib Creative\laraibcreative\backend\server.js
// =================================================================
// LARAIB CREATIVE - BACKEND SERVER
// Complete production-ready server with error handling
// =================================================================

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

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
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL,
      'https://laraibcreative.com',
      'https://www.laraibcreative.com'
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in development
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// =================================================================
// BODY PARSING MIDDLEWARE
// =================================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Create logs directory if it doesn't exist
  const logsDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  const accessLogStream = fs.createWriteStream(
    path.join(logsDir, 'access.log'),
    { flags: 'a' }
  );
  app.use(morgan('combined', { stream: accessLogStream }));
}

// =================================================================
// RATE LIMITING
// =================================================================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

app.use('/api/', limiter);

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
// HEALTH CHECK ENDPOINT
// =================================================================
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    message: 'LaraibCreative API is running',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
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

// Load all routes
console.log('\n📦 Loading routes...');
loadRoute('./src/routes/auth.routes.js', '/api/auth') && app.use('/api/auth/login', authLimiter) && app.use('/api/auth/register', authLimiter);
loadRoute('./src/routes/product.routes.js', '/api/products');
loadRoute('./src/routes/order.routes.js', '/api/orders');
loadRoute('./src/routes/customer.routes.js', '/api/customers');
loadRoute('./src/routes/category.routes.js', '/api/categories');
loadRoute('./src/routes/review.routes.js', '/api/reviews');
loadRoute('./src/routes/blog.routes.js', '/api/blog');
loadRoute('./src/routes/upload.routes.js', '/api/upload');
loadRoute('./src/routes/measurement.routes.js', '/api/measurements');
loadRoute('./src/routes/analytics.routes.js', '/api/analytics');
loadRoute('./src/routes/settings.routes.js', '/api/settings');

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
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error('Stack:', err.stack);

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
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 30000, // 30 seconds
        socketTimeoutMS: 45000, // 45 seconds
        family: 4 // Force IPv4
      });
      
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