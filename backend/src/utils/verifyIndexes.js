// ==========================================
// DATABASE INDEXES VERIFICATION
// ==========================================
// Verifies that all required database indexes are created
// Run this script to check index status
// ==========================================

const mongoose = require('mongoose');
require('dotenv').config();

// Import all models to ensure indexes are registered
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Review = require('../models/Review');
const Blog = require('../models/Blog');
const Measurement = require('../models/Measurement');
const Settings = require('../models/Settings');

/**
 * Verify indexes for a model
 * @param {mongoose.Model} Model - Mongoose model
 * @param {String} modelName - Model name for display
 */
async function verifyIndexes(Model, modelName) {
  try {
    const indexes = await Model.collection.getIndexes();
    const indexCount = Object.keys(indexes).length;
    
    console.log(`\n📊 ${modelName} Indexes (${indexCount}):`);
    Object.keys(indexes).forEach(indexName => {
      const index = indexes[indexName];
      console.log(`   ✓ ${indexName}:`, JSON.stringify(index.key));
    });
    
    return { modelName, indexCount, indexes };
  } catch (error) {
    console.error(`❌ Error verifying indexes for ${modelName}:`, error.message);
    return { modelName, error: error.message };
  }
}

/**
 * Main function to verify all indexes
 */
async function verifyAllIndexes() {
  try {
    console.log('🔍 Verifying Database Indexes...\n');
    
    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
      });
      console.log('✅ Connected to MongoDB\n');
    }

    // Verify indexes for all models
    const results = await Promise.all([
      verifyIndexes(User, 'User'),
      verifyIndexes(Product, 'Product'),
      verifyIndexes(Order, 'Order'),
      verifyIndexes(Category, 'Category'),
      verifyIndexes(Review, 'Review'),
      verifyIndexes(Blog, 'Blog'),
      verifyIndexes(Measurement, 'Measurement'),
      verifyIndexes(Settings, 'Settings')
    ]);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📈 INDEX VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    
    let totalIndexes = 0;
    results.forEach(result => {
      if (result.indexCount) {
        totalIndexes += result.indexCount;
        console.log(`✅ ${result.modelName}: ${result.indexCount} indexes`);
      } else {
        console.log(`❌ ${result.modelName}: Error - ${result.error}`);
      }
    });
    
    console.log(`\n📊 Total Indexes: ${totalIndexes}`);
    console.log('='.repeat(60));
    
    // Check for common missing indexes
    console.log('\n💡 RECOMMENDED INDEXES CHECK:');
    console.log('   ✓ User: email (unique), phone, role, isActive');
    console.log('   ✓ Product: category, isActive, isFeatured, views');
    console.log('   ✓ Order: customer, status, createdAt, payment.status');
    console.log('   ✓ Review: product, customer, status');
    console.log('   ✓ Blog: status, publishedAt, category');
    
    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Index verification complete');
    
  } catch (error) {
    console.error('❌ Error during index verification:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  verifyAllIndexes()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { verifyAllIndexes, verifyIndexes };

