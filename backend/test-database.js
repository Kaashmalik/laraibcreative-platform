#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests both TiDB and MongoDB connections with detailed logging
 */

// Load environment variables
require('dotenv').config();

const databaseManager = require('./src/config/database');

async function testDatabase() {
  console.log('🧪 Testing Database Connections...\n');
  
  try {
    // Initialize database manager
    console.log('📊 Initializing Database Manager...');
    await databaseManager.initialize();
    
    // Get status
    const status = databaseManager.getStatus();
    console.log('\n📋 Database Status:');
    console.log('   Mode:', status.mode);
    console.log('   Active Service:', status.activeService);
    console.log('   Fallback Mode:', status.fallbackMode);
    console.log('   Connections:', status.connections);
    
    // Test health check
    console.log('\n🏥 Testing Health Check...');
    const health = await databaseManager.healthCheck();
    console.log('   Health Status:', health.healthy ? '✅ Healthy' : '❌ Unhealthy');
    console.log('   Database:', health.database);
    console.log('   Timestamp:', health.timestamp);
    
    if (!health.healthy && health.error) {
      console.log('   Error:', health.error);
    }
    
    // Test product service if TiDB is active
    if (status.connections.tidb) {
      console.log('\n🛍️  Testing TiDB ProductService...');
      try {
        const productService = databaseManager.getProductService();
        const products = await productService.getAllProducts({ limit: 1 });
        console.log('   ✅ ProductService working - Found', products.total, 'products');
      } catch (error) {
        console.log('   ❌ ProductService error:', error.message);
      }
    }
    
    // Test MongoDB if active
    if (status.connections.mongodb) {
      console.log('\n🗄️  Testing MongoDB Models...');
      try {
        const Product = require('./src/models/Product');
        const count = await Product.countDocuments();
        console.log('   ✅ MongoDB working - Found', count, 'products');
      } catch (error) {
        console.log('   ❌ MongoDB error:', error.message);
      }
    }
    
    console.log('\n✅ Database test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Database test failed:', error);
    process.exit(1);
  } finally {
    // Cleanup
    await databaseManager.shutdown();
    console.log('\n🔄 Database connections closed');
  }
}

// Run the test
testDatabase();
