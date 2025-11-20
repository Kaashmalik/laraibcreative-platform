/**
 * Jest Setup for Backend Tests
 * Global test configuration
 */

const { setupTestDB, teardownTestDB } = require('./test-db');

// Setup test database before all tests
beforeAll(async () => {
  await setupTestDB();
});

// Cleanup after all tests
afterAll(async () => {
  await teardownTestDB();
});

// Clear database between test suites
afterEach(async () => {
  // Optional: Clear specific collections if needed
  // This is handled by setupTestDB/teardownTestDB
});

