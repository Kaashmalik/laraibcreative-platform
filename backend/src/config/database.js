// ==========================================
// DATABASE CONFIGURATION - MONGODB PRIMARY
// ==========================================
// MongoDB is the primary database for all data
// ==========================================

const mongoose = require('mongoose');

class DatabaseManager {
  constructor() {
    this.mongodbConnected = false;
  }

  /**
   * Initialize MongoDB connection
   */
  async initialize() {
    console.log('🔧 Database Mode: MongoDB (Primary)');
    
    try {
      await this._initializeMongoDB();
      await this._testConnections();
      console.log('🚀 Database initialization complete');
      return true;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize MongoDB connection
   */
  async _initializeMongoDB() {
    const { connectDB } = require('./db');
    await connectDB();
    this.mongodbConnected = true;
    console.log('✅ MongoDB: Connected successfully');
  }

  /**
   * Test database connections
   */
  async _testConnections() {
    if (this.mongodbConnected) {
      try {
        await mongoose.connection.db.admin().ping();
        console.log('✅ MongoDB: Test query successful');
      } catch (error) {
        console.error('❌ MongoDB: Test query failed:', error);
        throw error;
      }
    }
  }

  /**
   * Get product service (MongoDB)
   */
  getProductService() {
    if (this.mongodbConnected) {
      const Product = require('../models/Product');
      return Product;
    } else {
      throw new Error('MongoDB not connected');
    }
  }

  /**
   * Get category service (MongoDB)
   */
  getCategoryService() {
    if (this.mongodbConnected) {
      const Category = require('../models/Category');
      return Category;
    } else {
      throw new Error('MongoDB not connected');
    }
  }

  /**
   * Get current database status
   */
  getStatus() {
    return {
      mode: 'MongoDB',
      connections: {
        mongodb: this.mongodbConnected
      },
      activeService: 'MongoDB'
    };
  }

  /**
   * Health check for monitoring
   */
  async healthCheck() {
    const status = this.getStatus();
    const health = {
      database: status.activeService,
      healthy: false,
      connections: status.connections,
      timestamp: new Date().toISOString()
    };

    try {
      if (status.connections.mongodb) {
        await mongoose.connection.db.admin().ping();
        health.healthy = true;
      }
    } catch (error) {
      health.error = error.message;
    }

    return health;
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('🔄 Shutting down database connections...');
    
    if (this.mongodbConnected) {
      try {
        await mongoose.connection.close();
        console.log('✅ MongoDB: Connection closed');
      } catch (error) {
        console.error('❌ MongoDB shutdown error:', error.message);
      }
    }
  }
}

// Singleton instance
const databaseManager = new DatabaseManager();

module.exports = databaseManager;
