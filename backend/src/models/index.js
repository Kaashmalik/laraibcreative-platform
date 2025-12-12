const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Load models in dependency order
const User = require('./User');
const Settings = require('./Settings');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');

// Optional models - load if they exist
let Review, Blog;
try {
  Review = require('./Review');
} catch (e) {
  Review = null;
}
try {
  Blog = require('./Blog');
} catch (e) {
  Blog = null;
}

logger.info('✓ All models loaded successfully');

module.exports = {
  User,
  Category,
  Product,
  Order,
  Settings,
  Review,
  Blog,
  
  /**
   * Ensure all database indexes are created
   * Includes both schema indexes and compound indexes for performance
   */
  ensureIndexes: async function() {
    logger.info('Creating database indexes...');
    const models = [User, Category, Product, Order, Settings];
    
    // Add optional models if loaded
    if (Review) models.push(Review);
    if (Blog) models.push(Blog);
    
    // Create schema-defined indexes
    for (const Model of models) {
      try {
        await Model.createIndexes();
        logger.info(`  ✓ ${Model.modelName} indexes created`);
      } catch (error) {
        // Handle index conflicts - skip if index already exists with different options
        if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
          logger.warn(`  ⚠ ${Model.modelName} has conflicting indexes (skipped)`);
        } else {
          logger.error(`  ✗ ${Model.modelName} index creation failed:`, error.message);
        }
      }
    }
    
    // Create compound indexes for performance
    try {
      const { createAllIndexes } = require('../utils/databaseIndexes');
      await createAllIndexes();
    } catch (error) {
      logger.warn('Compound index creation skipped:', error.message);
    }
    
    logger.info('✓ Index initialization complete');
  },
  
  /**
   * Get all model names
   */
  getModelNames: function() {
    return Object.keys(mongoose.models);
  },
  
  /**
   * Get model by name
   */
  getModel: function(name) {
    return mongoose.models[name];
  },
};