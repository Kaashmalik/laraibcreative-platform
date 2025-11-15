// diagnostic.js - Run this to find the issue
console.log('=== DIAGNOSTIC SCRIPT STARTED ===\n');

// Test 1: Environment Variables
console.log('TEST 1: Loading .env file...');
try {
  require('dotenv').config();
  console.log('✅ dotenv loaded');
  console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
} catch (err) {
  console.error('❌ dotenv error:', err.message);
  process.exit(1);
}

// Test 2: Core Dependencies
console.log('\nTEST 2: Loading core dependencies...');
const dependencies = [
  'express',
  'mongoose',
  'cors',
  'helmet',
  'express-mongo-sanitize',
  'express-rate-limit',
  'compression',
  'morgan',
  'path'
];

for (const dep of dependencies) {
  try {
    require(dep);
    console.log(`✅ ${dep}`);
  } catch (err) {
    console.error(`❌ ${dep}: ${err.message}`);
  }
}

// Test 3: Route Files
console.log('\nTEST 3: Loading route files...');
const routes = [
  './src/routes/auth.routes',
  './src/routes/product.routes',
  './src/routes/order.routes',
  './src/routes/customer.routes',
  './src/routes/category.routes',
  './src/routes/review.routes',
  './src/routes/blog.routes',
  './src/routes/upload.routes',
  './src/routes/measurement.routes',
  './src/routes/analytics.routes',
  './src/routes/settings.routes'
];

for (const route of routes) {
  try {
    require(route);
    console.log(`✅ ${route}`);
  } catch (err) {
    console.error(`❌ ${route}:`);
    console.error(`   ${err.message}`);
    if (err.stack) {
      console.error(`   Stack: ${err.stack.split('\n')[1]}`);
    }
  }
}

// Test 4: Middleware Files
console.log('\nTEST 4: Loading middleware files...');
const middleware = [
  './src/middleware/errorHandler',
  './src/utils/logger'
];

for (const mw of middleware) {
  try {
    require(mw);
    console.log(`✅ ${mw}`);
  } catch (err) {
    console.error(`❌ ${mw}:`);
    console.error(`   ${err.message}`);
  }
}

// Test 5: Directory Structure
console.log('\nTEST 5: Checking directory structure...');
const fs = require('fs');
const directories = [
  './src',
  './src/routes',
  './src/middleware',
  './src/utils',
  './src/models',
  './src/controllers'
];

for (const dir of directories) {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir} exists`);
  } else {
    console.error(`❌ ${dir} missing`);
  }
}

console.log('\n=== DIAGNOSTIC COMPLETE ===');
console.log('\nIf all tests pass, the issue is in server.js logic.');
console.log('If tests fail, fix the failing module first.\n');