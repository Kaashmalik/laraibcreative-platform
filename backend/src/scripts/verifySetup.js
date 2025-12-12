/**
 * LaraibCreative Setup Verification Script
 * 
 * Run with: node src/scripts/verifySetup.js
 * 
 * Checks:
 * - Environment variables
 * - TiDB connection
 * - MongoDB connection (if configured)
 * - Cloudinary configuration
 * - Gemini AI configuration
 * - Admin user exists
 */

require('dotenv').config();
const chalk = require('chalk') || { green: (s) => s, red: (s) => s, yellow: (s) => s, cyan: (s) => s, bold: (s) => s };

// Simple colored output
const log = {
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  warn: (msg) => console.log(`⚠️  ${msg}`),
  info: (msg) => console.log(`ℹ️  ${msg}`),
  section: (msg) => console.log(`\n${'='.repeat(50)}\n📋 ${msg}\n${'='.repeat(50)}`)
};

// Track results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0
};

// Check environment variable
const checkEnv = (key, required = true, mask = false) => {
  const value = process.env[key];
  if (value) {
    const displayValue = mask ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}` : value;
    log.success(`${key}: ${displayValue}`);
    results.passed++;
    return true;
  } else if (required) {
    log.error(`${key}: NOT SET (required)`);
    results.failed++;
    return false;
  } else {
    log.warn(`${key}: Not set (optional)`);
    results.warnings++;
    return false;
  }
};

// Main verification function
async function verifySetup() {
  console.log('\n');
  console.log('🎨 LaraibCreative Setup Verification');
  console.log('====================================\n');
  
  // ===========================================
  // 1. Core Environment Variables
  // ===========================================
  log.section('1. Core Environment Variables');
  
  checkEnv('NODE_ENV', false);
  checkEnv('PORT', false);
  checkEnv('FRONTEND_URL', false);
  
  // ===========================================
  // 2. JWT Configuration
  // ===========================================
  log.section('2. JWT Configuration');
  
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefresh = process.env.JWT_REFRESH_SECRET;
  
  if (jwtSecret) {
    if (jwtSecret.length >= 32) {
      log.success(`JWT_SECRET: Set (${jwtSecret.length} chars) ✓`);
      results.passed++;
    } else {
      log.error(`JWT_SECRET: Too short (${jwtSecret.length} chars, need 32+)`);
      results.failed++;
    }
  } else {
    log.error('JWT_SECRET: NOT SET (required)');
    results.failed++;
  }
  
  if (jwtRefresh) {
    if (jwtRefresh.length >= 32) {
      log.success(`JWT_REFRESH_SECRET: Set (${jwtRefresh.length} chars) ✓`);
      results.passed++;
    } else {
      log.error(`JWT_REFRESH_SECRET: Too short (${jwtRefresh.length} chars, need 32+)`);
      results.failed++;
    }
  } else {
    log.error('JWT_REFRESH_SECRET: NOT SET (required)');
    results.failed++;
  }
  
  // ===========================================
  // 3. Database Configuration
  // ===========================================
  log.section('3. Database Configuration');
  
  // Check TiDB
  const hasTiDB = process.env.TIDB_HOST && process.env.TIDB_USER && process.env.TIDB_PASSWORD;
  if (hasTiDB) {
    log.success('TiDB Cloud: Configured');
    checkEnv('TIDB_HOST', true);
    checkEnv('TIDB_PORT', false);
    checkEnv('TIDB_USER', true);
    checkEnv('TIDB_PASSWORD', true, true);
    checkEnv('TIDB_DATABASE', false);
    
    // Test TiDB connection
    log.info('Testing TiDB connection...');
    try {
      const mysql = require('mysql2/promise');
      const connection = await mysql.createConnection({
        host: process.env.TIDB_HOST,
        port: parseInt(process.env.TIDB_PORT || '4000'),
        user: process.env.TIDB_USER,
        password: process.env.TIDB_PASSWORD,
        database: process.env.TIDB_DATABASE || 'test',
        ssl: { rejectUnauthorized: true },
        connectTimeout: 10000
      });
      
      const [rows] = await connection.query('SELECT 1 as test');
      log.success('TiDB Connection: SUCCESS ✓');
      results.passed++;
      
      // Check tables
      const [tables] = await connection.query('SHOW TABLES');
      log.info(`Tables found: ${tables.length}`);
      
      // Check admin user
      try {
        const [admins] = await connection.query(
          "SELECT email, name, role FROM admin_users WHERE email = ?",
          ['laraibcreative.business@gmail.com']
        );
        if (admins.length > 0) {
          log.success(`Admin user found: ${admins[0].email} (${admins[0].role})`);
          results.passed++;
        } else {
          log.warn('Admin user NOT found - run SEED_ADMIN_USER.sql');
          results.warnings++;
        }
      } catch (e) {
        log.warn('admin_users table not found - run SEED_ADMIN_USER.sql');
        results.warnings++;
      }
      
      // Check categories
      try {
        const [cats] = await connection.query('SELECT COUNT(*) as count FROM categories');
        log.success(`Categories: ${cats[0].count} found`);
        results.passed++;
      } catch (e) {
        log.warn('categories table not found - run TIDB_SCHEMA.md first');
        results.warnings++;
      }
      
      // Check products
      try {
        const [prods] = await connection.query('SELECT COUNT(*) as count FROM products');
        log.success(`Products: ${prods[0].count} found`);
        results.passed++;
      } catch (e) {
        log.warn('products table not found - run TIDB_SCHEMA.md first');
        results.warnings++;
      }
      
      await connection.end();
      
    } catch (error) {
      log.error(`TiDB Connection: FAILED - ${error.message}`);
      results.failed++;
      
      if (error.code === 'ECONNREFUSED') {
        log.info('💡 Check if TiDB cluster is running');
      }
      if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        log.info('💡 Check username and password');
      }
      if (error.message.includes('SSL')) {
        log.info('💡 SSL certificate issue - check TiDB Cloud settings');
      }
    }
  } else {
    log.warn('TiDB Cloud: Not configured');
    results.warnings++;
  }
  
  // Check MongoDB
  const hasMongoDB = !!process.env.MONGODB_URI;
  if (hasMongoDB) {
    log.success('MongoDB: Configured');
    checkEnv('MONGODB_URI', true, true);
    
    // Test MongoDB connection
    log.info('Testing MongoDB connection...');
    try {
      const mongoose = require('mongoose');
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000
      });
      log.success('MongoDB Connection: SUCCESS ✓');
      results.passed++;
      await mongoose.disconnect();
    } catch (error) {
      log.error(`MongoDB Connection: FAILED - ${error.message}`);
      results.failed++;
    }
  } else {
    log.info('MongoDB: Not configured (using TiDB instead)');
  }
  
  // ===========================================
  // 4. Cloudinary Configuration
  // ===========================================
  log.section('4. Cloudinary Configuration');
  
  const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                        process.env.CLOUDINARY_API_KEY && 
                        process.env.CLOUDINARY_API_SECRET;
  
  if (hasCloudinary) {
    checkEnv('CLOUDINARY_CLOUD_NAME', true);
    checkEnv('CLOUDINARY_API_KEY', true, true);
    checkEnv('CLOUDINARY_API_SECRET', true, true);
    
    // Test Cloudinary
    log.info('Testing Cloudinary connection...');
    try {
      const cloudinary = require('cloudinary').v2;
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });
      
      const result = await cloudinary.api.ping();
      log.success('Cloudinary Connection: SUCCESS ✓');
      results.passed++;
    } catch (error) {
      log.error(`Cloudinary Connection: FAILED - ${error.message}`);
      results.failed++;
    }
  } else {
    log.warn('Cloudinary: Not fully configured');
    checkEnv('CLOUDINARY_CLOUD_NAME', false);
    checkEnv('CLOUDINARY_API_KEY', false);
    checkEnv('CLOUDINARY_API_SECRET', false);
  }
  
  // ===========================================
  // 5. AI Configuration (Gemini)
  // ===========================================
  log.section('5. AI Configuration (Google Gemini)');
  
  if (process.env.GEMINI_API_KEY) {
    checkEnv('GEMINI_API_KEY', true, true);
    checkEnv('GEMINI_MODEL', false);
    
    // Test AI providers (Groq primary, Gemini fallback)
    let aiConfigured = false;
    
    // Test Groq (Primary)
    if (process.env.GROQ_API_KEY) {
      checkEnv('GROQ_API_KEY', true, true);
      checkEnv('GROQ_MODEL', false);
      log.info('Testing Groq AI connection...');
      
      try {
        const Groq = require('groq-sdk');
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const response = await groq.chat.completions.create({
          model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: 'Say "Hello" in one word' }],
          max_tokens: 10
        });
        const text = response.choices[0]?.message?.content || '';
        log.success(`Groq AI: SUCCESS ✓ (Response: "${text.trim()}")`);
        results.passed++;
        aiConfigured = true;
      } catch (error) {
        log.error(`Groq AI: FAILED - ${error.message}`);
        results.failed++;
        log.info('💡 Check your GROQ_API_KEY at https://console.groq.com');
      }
    }
    
    // Test Gemini (Fallback)
    if (process.env.GEMINI_API_KEY) {
      checkEnv('GEMINI_API_KEY', true, true);
      checkEnv('GEMINI_MODEL', false);
      log.info('Testing Gemini AI connection...');
      
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-pro' });
        const result = await model.generateContent('Say "Hello" in one word');
        const response = await result.response;
        log.success(`Gemini AI: SUCCESS ✓ (Response: "${response.text().trim()}")`);
        results.passed++;
        aiConfigured = true;
      } catch (error) {
        log.warn(`Gemini AI: FAILED - ${error.message}`);
        if (!aiConfigured) results.failed++;
        else results.warnings++;
        log.info('💡 Get new key from https://aistudio.google.com/apikey');
      }
    }
    
  } else {
    // No Gemini key, check for Groq
    if (process.env.GROQ_API_KEY) {
      checkEnv('GROQ_API_KEY', true, true);
      checkEnv('GROQ_MODEL', false);
      log.info('Testing Groq AI connection...');
      
      try {
        const Groq = require('groq-sdk');
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const response = await groq.chat.completions.create({
          model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: 'Say "Hello" in one word' }],
          max_tokens: 10
        });
        const text = response.choices[0]?.message?.content || '';
        log.success(`Groq AI: SUCCESS ✓ (Response: "${text.trim()}")`);
        results.passed++;
      } catch (error) {
        log.error(`Groq AI: FAILED - ${error.message}`);
        results.failed++;
      }
    } else {
      log.warn('AI: Not configured (add GROQ_API_KEY or GEMINI_API_KEY)');
      log.info('💡 Groq (free & fast): https://console.groq.com');
      log.info('💡 Gemini (free): https://aistudio.google.com/apikey');
      results.warnings++;
    }
  }
  
  // ===========================================
  // 6. Email Configuration (Optional)
  // ===========================================
  log.section('6. Email Configuration (Optional)');
  
  checkEnv('EMAIL_HOST', false);
  checkEnv('EMAIL_USER', false);
  checkEnv('EMAIL_PASSWORD', false, true);
  
  // ===========================================
  // Summary
  // ===========================================
  log.section('SUMMARY');
  
  console.log(`\n📊 Results:`);
  console.log(`   ✅ Passed:   ${results.passed}`);
  console.log(`   ❌ Failed:   ${results.failed}`);
  console.log(`   ⚠️  Warnings: ${results.warnings}`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All critical checks passed! Your setup is ready.\n');
  } else {
    console.log('\n⚠️  Some checks failed. Please fix the issues above.\n');
    console.log('📖 Reference: docs/ENV_TEMPLATE.md\n');
  }
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run verification
verifySetup().catch(error => {
  console.error('\n❌ Verification script error:', error.message);
  process.exit(1);
});
