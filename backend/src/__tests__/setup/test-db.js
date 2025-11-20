/**
 * Test Database Setup and Teardown
 * Utilities for managing test database connections and data
 */

const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../../config/db');

// Test database URI (should use a separate test database)
const TEST_DB_URI = process.env.MONGODB_TEST_URI || process.env.MONGODB_URI?.replace(
  /\/[^/]+$/,
  '/laraibcreative-test'
);

/**
 * Connect to test database
 */
async function connectTestDB() {
  if (mongoose.connection.readyState === 1) {
    return; // Already connected
  }

  try {
    await mongoose.connect(TEST_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 5,
    });
    console.log('✅ Test database connected');
  } catch (error) {
    console.error('❌ Test database connection error:', error);
    throw error;
  }
}

/**
 * Disconnect from test database
 */
async function disconnectTestDB() {
  try {
    await mongoose.connection.close();
    console.log('✅ Test database disconnected');
  } catch (error) {
    console.error('❌ Test database disconnection error:', error);
    throw error;
  }
}

/**
 * Clear all collections in test database
 */
async function clearTestDB() {
  try {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    
    console.log('✅ Test database cleared');
  } catch (error) {
    console.error('❌ Error clearing test database:', error);
    throw error;
  }
}

/**
 * Drop test database (use with caution)
 */
async function dropTestDB() {
  try {
    await mongoose.connection.db.dropDatabase();
    console.log('✅ Test database dropped');
  } catch (error) {
    console.error('❌ Error dropping test database:', error);
    throw error;
  }
}

/**
 * Setup test database (connect and clear)
 */
async function setupTestDB() {
  await connectTestDB();
  await clearTestDB();
}

/**
 * Teardown test database (clear and disconnect)
 */
async function teardownTestDB() {
  await clearTestDB();
  await disconnectTestDB();
}

module.exports = {
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
  dropTestDB,
  setupTestDB,
  teardownTestDB,
  TEST_DB_URI,
};

