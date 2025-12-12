/**
 * Database Indexes Utility
 * Manages compound indexes for optimal query performance
 * 
 * Run periodically or on startup to ensure indexes are up to date
 */

const mongoose = require('mongoose');
const logger = require('./logger');

/**
 * Define all compound indexes for each collection
 * These are in addition to indexes defined in schemas
 */
const COMPOUND_INDEXES = {
  products: [
    // Common product listing queries
    { fields: { category: 1, isActive: 1, createdAt: -1 }, options: { name: 'idx_category_active_created' } },
    { fields: { category: 1, isActive: 1, 'pricing.basePrice': 1 }, options: { name: 'idx_category_active_price' } },
    { fields: { isFeatured: 1, isActive: 1, createdAt: -1 }, options: { name: 'idx_featured_active_created' } },
    { fields: { isNewArrival: 1, isActive: 1, createdAt: -1 }, options: { name: 'idx_newarrival_active_created' } },
    { fields: { isBestSeller: 1, isActive: 1, 'pricing.basePrice': 1 }, options: { name: 'idx_bestseller_active_price' } },
    { fields: { tags: 1, isActive: 1 }, options: { name: 'idx_tags_active' } },
    { fields: { 'fabric.type': 1, category: 1, isActive: 1 }, options: { name: 'idx_fabric_category_active' } },
    { fields: { occasion: 1, category: 1, isActive: 1 }, options: { name: 'idx_occasion_category_active' } },
    // Admin product management
    { fields: { status: 1, createdAt: -1 }, options: { name: 'idx_status_created' } },
    { fields: { isDeleted: 1, status: 1 }, options: { name: 'idx_deleted_status' } },
    // Search optimization (text index)
    { fields: { title: 'text', description: 'text', tags: 'text' }, options: { name: 'idx_text_search', weights: { title: 10, tags: 5, description: 1 } } },
  ],
  
  orders: [
    // Customer order history
    { fields: { customer: 1, status: 1, createdAt: -1 }, options: { name: 'idx_customer_status_created' } },
    { fields: { customer: 1, createdAt: -1 }, options: { name: 'idx_customer_created' } },
    // Admin order management
    { fields: { status: 1, createdAt: -1 }, options: { name: 'idx_status_created' } },
    { fields: { 'payment.status': 1, status: 1 }, options: { name: 'idx_payment_status' } },
    { fields: { 'payment.method': 1, 'payment.status': 1 }, options: { name: 'idx_payment_method_status' } },
    { fields: { priority: 1, status: 1, createdAt: -1 }, options: { name: 'idx_priority_status_created' } },
    // Date range queries
    { fields: { createdAt: -1, status: 1 }, options: { name: 'idx_created_status' } },
    // Order tracking
    { fields: { orderNumber: 1 }, options: { name: 'idx_order_number', unique: true } },
  ],
  
  users: [
    // Authentication queries
    { fields: { email: 1, isActive: 1 }, options: { name: 'idx_email_active' } },
    { fields: { phone: 1, isActive: 1 }, options: { name: 'idx_phone_active' } },
    // Admin user management
    { fields: { role: 1, isActive: 1, createdAt: -1 }, options: { name: 'idx_role_active_created' } },
    { fields: { customerType: 1, isActive: 1 }, options: { name: 'idx_customer_type_active' } },
    // VIP customers
    { fields: { customerType: 1, totalSpent: -1 }, options: { name: 'idx_customer_type_spent' } },
  ],
  
  categories: [
    // Navigation queries
    { fields: { parentCategory: 1, isActive: 1, displayOrder: 1 }, options: { name: 'idx_parent_active_order' } },
    { fields: { slug: 1, isActive: 1 }, options: { name: 'idx_slug_active' } },
    { fields: { level: 1, isActive: 1 }, options: { name: 'idx_level_active' } },
  ],
  
  reviews: [
    // Product reviews
    { fields: { product: 1, status: 1, createdAt: -1 }, options: { name: 'idx_product_status_created' } },
    { fields: { product: 1, rating: -1 }, options: { name: 'idx_product_rating' } },
    { fields: { user: 1, createdAt: -1 }, options: { name: 'idx_user_created' } },
    // Admin review management
    { fields: { status: 1, createdAt: -1 }, options: { name: 'idx_status_created' } },
  ],
};

/**
 * Create indexes for a specific collection
 * @param {string} collectionName - Name of the collection
 * @param {Array} indexes - Array of index definitions
 */
const createIndexesForCollection = async (collectionName, indexes) => {
  try {
    const collection = mongoose.connection.collection(collectionName);
    
    for (const index of indexes) {
      try {
        await collection.createIndex(index.fields, index.options);
        logger.info(`✅ Created index ${index.options.name} on ${collectionName}`);
      } catch (error) {
        // Index might already exist with same fields but different name
        if (error.code === 85 || error.code === 86) {
          logger.debug(`Index ${index.options.name} already exists on ${collectionName}`);
        } else {
          logger.error(`Failed to create index ${index.options.name} on ${collectionName}:`, error.message);
        }
      }
    }
  } catch (error) {
    logger.error(`Error creating indexes for ${collectionName}:`, error.message);
  }
};

/**
 * Create all compound indexes
 */
const createAllIndexes = async () => {
  logger.info('🔧 Creating compound indexes...');
  
  const startTime = Date.now();
  
  for (const [collectionName, indexes] of Object.entries(COMPOUND_INDEXES)) {
    await createIndexesForCollection(collectionName, indexes);
  }
  
  const duration = Date.now() - startTime;
  logger.info(`✅ Compound indexes created in ${duration}ms`);
};

/**
 * List all indexes for a collection
 * @param {string} collectionName - Name of the collection
 * @returns {Array} List of indexes
 */
const listIndexes = async (collectionName) => {
  try {
    const collection = mongoose.connection.collection(collectionName);
    return await collection.indexes();
  } catch (error) {
    logger.error(`Error listing indexes for ${collectionName}:`, error.message);
    return [];
  }
};

/**
 * List all indexes for all collections
 * @returns {Object} Index information for all collections
 */
const listAllIndexes = async () => {
  const indexInfo = {};
  
  for (const collectionName of Object.keys(COMPOUND_INDEXES)) {
    indexInfo[collectionName] = await listIndexes(collectionName);
  }
  
  return indexInfo;
};

/**
 * Drop unused or redundant indexes
 * @param {string} collectionName - Name of the collection
 * @param {Array<string>} indexNames - Names of indexes to drop
 */
const dropIndexes = async (collectionName, indexNames) => {
  try {
    const collection = mongoose.connection.collection(collectionName);
    
    for (const indexName of indexNames) {
      if (indexName === '_id_') {
        logger.warn(`Cannot drop _id index on ${collectionName}`);
        continue;
      }
      
      try {
        await collection.dropIndex(indexName);
        logger.info(`✅ Dropped index ${indexName} from ${collectionName}`);
      } catch (error) {
        logger.error(`Failed to drop index ${indexName} from ${collectionName}:`, error.message);
      }
    }
  } catch (error) {
    logger.error(`Error dropping indexes from ${collectionName}:`, error.message);
  }
};

/**
 * Analyze index usage (requires MongoDB 3.2+)
 * @param {string} collectionName - Name of the collection
 * @returns {Object} Index usage statistics
 */
const analyzeIndexUsage = async (collectionName) => {
  try {
    const result = await mongoose.connection.db.command({
      aggregate: collectionName,
      pipeline: [{ $indexStats: {} }],
      cursor: {},
    });
    
    return result.cursor.firstBatch;
  } catch (error) {
    logger.error(`Error analyzing index usage for ${collectionName}:`, error.message);
    return [];
  }
};

/**
 * Get index recommendations based on slow queries
 * This is a simplified version - in production, use MongoDB profiler
 */
const getIndexRecommendations = () => {
  return [
    {
      collection: 'products',
      reason: 'Frequently filtered by category and price range',
      recommendedIndex: { category: 1, 'pricing.basePrice': 1, isActive: 1 },
    },
    {
      collection: 'orders',
      reason: 'Customer order history queries',
      recommendedIndex: { customer: 1, createdAt: -1 },
    },
    {
      collection: 'products',
      reason: 'Full-text search on products',
      recommendedIndex: { title: 'text', description: 'text', tags: 'text' },
    },
  ];
};

module.exports = {
  createAllIndexes,
  createIndexesForCollection,
  listIndexes,
  listAllIndexes,
  dropIndexes,
  analyzeIndexUsage,
  getIndexRecommendations,
  COMPOUND_INDEXES,
};

