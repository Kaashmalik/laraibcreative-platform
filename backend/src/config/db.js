// backend/src/config/db.js
// ==========================================
// MONGODB DATABASE CONNECTION CONFIGURATION
// ==========================================
// Production-ready MongoDB connection with retry logic,
// connection pooling, and comprehensive error handling
// ==========================================

const mongoose = require('mongoose');

// MongoDB connection options for production
const options = {
  // Connection pool size
  maxPoolSize: 10,
  minPoolSize: 2,
  
  // Timeout settings
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  
  // Monitoring and performance
  family: 4, // Use IPv4, skip trying IPv6
  
  // Retry settings
  retryWrites: true,
  retryReads: true,
  
  // Compression
  compressors: ['zlib'],
  
  // Security
  w: 'majority', // Write concern: acknowledged by majority of replica set
  
  // Auto-index
  autoIndex: process.env.NODE_ENV !== 'production', // Disable in production for performance
};

// Connection state tracking
let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY = 5000; // 5 seconds

/**
 * Connect to MongoDB with retry logic
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  // If already connected, return
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('✅ MongoDB: Using existing connection');
    return;
  }

  try {
    connectionAttempts++;
    
    // Check if MONGODB_URI exists
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log(`🔄 MongoDB: Connection attempt ${connectionAttempts}/${MAX_RETRY_ATTEMPTS}...`);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, options);
    
    isConnected = true;
    connectionAttempts = 0; // Reset on successful connection
    
    console.log('✅ MongoDB: Connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    
    isConnected = false;
    
    // Retry logic
    if (connectionAttempts < MAX_RETRY_ATTEMPTS) {
      console.log(`⏳ Retrying connection in ${RETRY_DELAY / 1000} seconds...`);
      setTimeout(connectDB, RETRY_DELAY);
    } else {
      console.error('💥 MongoDB: Maximum retry attempts reached. Exiting...');
      process.exit(1);
    }
  }
};

/**
 * Disconnect from MongoDB gracefully
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    if (isConnected) {
      await mongoose.connection.close();
      isConnected = false;
      console.log('✅ MongoDB: Disconnected successfully');
    }
  } catch (error) {
    console.error('❌ MongoDB Disconnect Error:', error.message);
    throw error;
  }
};

/**
 * Get connection status
 * @returns {Object} Connection status information
 */
const getConnectionStatus = () => {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    readyStateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState],
    host: mongoose.connection.host,
    name: mongoose.connection.name,
  };
};

// ==========================================
// EVENT LISTENERS FOR MONITORING
// ==========================================

// Connected
mongoose.connection.on('connected', () => {
  console.log('📡 MongoDB: Connection established');
});

// Error
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB Error:', err.message);
  isConnected = false;
});

// Disconnected
mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB: Connection disconnected');
  isConnected = false;
});

// Reconnected
mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB: Connection reestablished');
  isConnected = true;
});

// MongoDB server disconnected
mongoose.connection.on('close', () => {
  console.log('🔒 MongoDB: Connection closed');
  isConnected = false;
});

// ==========================================
// GRACEFUL SHUTDOWN HANDLERS
// ==========================================

// Handle application termination gracefully
const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️  Received ${signal}. Closing MongoDB connection...`);
  
  try {
    await disconnectDB();
    console.log('✅ MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error.message);
    process.exit(1);
  }
};

// Listen for termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  connectDB,
  disconnectDB,
  getConnectionStatus,
  mongoose,
};