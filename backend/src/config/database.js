// ==========================================
// DATABASE CONFIGURATION - FEATURE FLAG SYSTEM
// ==========================================
// Handles MongoDB vs TiDB switching with fallback
// ==========================================

const mongoose = require('mongoose');
const { initTiDB } = require('./tidb');
const productService = require('../services/productService');
const categoryService = require('../services/categoryService');

class DatabaseManager {
  constructor() {
    this.useTiDB = process.env.USE_TIDB === 'true';
    this.tidbConnected = false;
    this.mongodbConnected = false;
    this.fallbackMode = false;
  }

  /**
   * Initialize database connections based on feature flag
   */
  async initialize() {
    console.log(`🔧 Database Mode: ${this.useTiDB ? 'TiDB + Supabase' : 'MongoDB'}`);
    
    try {
      if (this.useTiDB) {
        // Initialize TiDB connection
        console.log('🔧 Attempting TiDB initialization...');
        console.log('📋 TiDB Environment Check:');
        console.log(`   TIDB_HOST: ${process.env.TIDB_HOST ? '✅ Set' : '❌ Missing'}`);
        console.log(`   TIDB_USER: ${process.env.TIDB_USER ? '✅ Set' : '❌ Missing'}`);
        console.log(`   TIDB_PASSWORD: ${process.env.TIDB_PASSWORD ? '✅ Set' : '❌ Missing'}`);
        console.log(`   TIDB_DATABASE: ${process.env.TIDB_DATABASE || 'laraibcreative'}`);
        console.log(`   TIDB_PORT: ${process.env.TIDB_PORT || '4000'}`);
        
        try {
          const tidbPool = await initTiDB();
          if (tidbPool) {
            this.tidbConnected = true;
            console.log('✅ TiDB: Connected successfully');
          } else {
            console.warn('⚠️ TiDB: initTiDB() returned null, falling back to MongoDB');
            this.fallbackMode = true;
            this.useTiDB = false;
            await this._initializeMongoDB();
          }
        } catch (tidbError) {
          console.error('❌ TiDB Connection Error Details:');
          console.error('   Error Code:', tidbError.code);
          console.error('   Error Message:', tidbError.message);
          console.error('   Error Stack:', tidbError.stack);
          console.warn('⚠️ TiDB: Connection failed, falling back to MongoDB');
          this.fallbackMode = true;
          this.useTiDB = false;
          await this._initializeMongoDB();
        }
      } else {
        console.log('📋 TiDB is disabled (USE_TIDB != true)');
        await this._initializeMongoDB();
      }

      // Test database operations
      await this._testConnections();
      
      console.log('🚀 Database initialization complete');
      return true;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      
      // Emergency fallback
      if (this.useTiDB && !this.fallbackMode) {
        console.log('🔄 Emergency fallback to MongoDB...');
        this.fallbackMode = true;
        this.useTiDB = false;
        return await this.initialize();
      }
      
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
   * Test database connections with simple queries
   */
  async _testConnections() {
    if (this.useTiDB && this.tidbConnected) {
      try {
        const { execute } = require('./tidb');
        await execute('SELECT 1 as test');
        console.log('✅ TiDB: Test query successful');
      } catch (error) {
        console.error('❌ TiDB: Test query failed:', error);
        throw error;
      }
    }

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
   * Get product service based on current database
   */
  getProductService() {
    if (this.useTiDB && this.tidbConnected) {
      return productService;
    } else if (this.mongodbConnected) {
      const Product = require('../models/Product');
      return Product;
    } else {
      throw new Error('No database connection available');
    }
  }

  /**
   * Get category service based on current database
   */
  getCategoryService() {
    if (this.useTiDB && this.tidbConnected) {
      return categoryService;
    } else if (this.mongodbConnected) {
      const Category = require('../models/Category');
      return Category;
    } else {
      throw new Error('No database connection available');
    }
  }

  /**
   * Execute database operation with automatic fallback
   */
  async executeWithFallback(operation, fallbackOperation, context = 'operation') {
    try {
      if (this.useTiDB && this.tidbConnected) {
        const result = await operation();
        return result;
      } else {
        throw new Error('TiDB not available');
      }
    } catch (error) {
      if (this.useTiDB && !this.fallbackMode) {
        console.warn(`⚠️ TiDB ${context} failed, attempting fallback to MongoDB:`, error.message);
        
        try {
          if (!this.mongodbConnected) {
            await this._initializeMongoDB();
          }
          this.fallbackMode = true;
          const result = await fallbackOperation();
          console.log(`✅ MongoDB fallback successful for ${context}`);
          return result;
        } catch (fallbackError) {
          console.error(`❌ MongoDB fallback failed for ${context}:`, fallbackError.message);
          throw new Error(`Both TiDB and MongoDB failed for ${context}: ${error.message} | ${fallbackError.message}`);
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Get current database status
   */
  getStatus() {
    return {
      mode: this.useTiDB ? 'TiDB' : 'MongoDB',
      fallbackMode: this.fallbackMode,
      connections: {
        tidb: this.tidbConnected,
        mongodb: this.mongodbConnected
      },
      activeService: this.useTiDB && this.tidbConnected ? 'TiDB' : 'MongoDB'
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
      fallback: status.fallbackMode,
      connections: status.connections,
      timestamp: new Date().toISOString()
    };

    try {
      if (status.connections.tidb && this.useTiDB) {
        const { execute } = require('./tidb');
        await execute('SELECT 1');
        health.healthy = true;
      } else if (status.connections.mongodb) {
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
    
    if (this.tidbConnected) {
      try {
        const { closeTiDB } = require('./tidb');
        await closeTiDB();
        console.log('✅ TiDB: Connection closed');
      } catch (error) {
        console.error('❌ TiDB shutdown error:', error.message);
      }
    }

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
