/**
 * Startup Verification Service
 * 
 * Verifies all external services and configurations on server startup
 * Provides clear error messages for missing or misconfigured services
 * 
 * @module config/startupVerification
 */

const mongoose = require('mongoose');

/**
 * Verification result type
 * @typedef {Object} VerificationResult
 * @property {boolean} success - Whether verification passed
 * @property {string} service - Name of the service
 * @property {string} message - Status message
 * @property {boolean} critical - Whether failure should stop server
 */

/**
 * Verify Cloudinary configuration
 * @returns {Promise<VerificationResult>}
 */
async function verifyCloudinary() {
  const serviceName = 'Cloudinary';
  
  try {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    
    // Check for required env vars
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      const missing = [];
      if (!CLOUDINARY_CLOUD_NAME) missing.push('CLOUDINARY_CLOUD_NAME');
      if (!CLOUDINARY_API_KEY) missing.push('CLOUDINARY_API_KEY');
      if (!CLOUDINARY_API_SECRET) missing.push('CLOUDINARY_API_SECRET');
      
      return {
        success: false,
        service: serviceName,
        message: `Missing environment variables: ${missing.join(', ')}`,
        critical: true
      };
    }
    
    // Try to connect to Cloudinary
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true
    });
    
    // Ping Cloudinary (with timeout)
    const pingPromise = cloudinary.api.ping();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Cloudinary ping timeout')), 10000)
    );
    
    await Promise.race([pingPromise, timeoutPromise]);
    
    return {
      success: true,
      service: serviceName,
      message: `Connected to cloud: ${CLOUDINARY_CLOUD_NAME}`,
      critical: true
    };
    
  } catch (error) {
    return {
      success: false,
      service: serviceName,
      message: `Connection failed: ${error.message}`,
      critical: true
    };
  }
}

/**
 * Verify AI Provider configuration
 * @returns {Promise<VerificationResult>}
 */
async function verifyAIProvider() {
  const serviceName = 'AI Provider';
  
  try {
    const hasGroq = !!process.env.GROQ_API_KEY;
    const hasGemini = !!process.env.GEMINI_API_KEY;
    
    if (!hasGroq && !hasGemini) {
      return {
        success: false,
        service: serviceName,
        message: 'No AI provider configured. Add GROQ_API_KEY or GEMINI_API_KEY',
        critical: false // Not critical - app can work without AI
      };
    }
    
    // Determine active provider
    const activeProvider = hasGroq ? 'Groq' : 'Gemini';
    const fallbackAvailable = hasGroq && hasGemini;
    
    // Quick validation of API key format (don't actually call API on startup)
    let validFormat = true;
    if (hasGroq && process.env.GROQ_API_KEY.length < 10) {
      validFormat = false;
    }
    if (hasGemini && process.env.GEMINI_API_KEY.length < 10) {
      validFormat = false;
    }
    
    if (!validFormat) {
      return {
        success: false,
        service: serviceName,
        message: 'API key format appears invalid (too short)',
        critical: false
      };
    }
    
    return {
      success: true,
      service: serviceName,
      message: `Active: ${activeProvider}${fallbackAvailable ? ' (fallback available)' : ''}`,
      critical: false
    };
    
  } catch (error) {
    return {
      success: false,
      service: serviceName,
      message: `Verification error: ${error.message}`,
      critical: false
    };
  }
}

/**
 * Verify MongoDB connection and indexes
 * @returns {Promise<VerificationResult>}
 */
async function verifyMongoDB() {
  const serviceName = 'MongoDB';
  
  try {
    if (mongoose.connection.readyState !== 1) {
      return {
        success: false,
        service: serviceName,
        message: 'Not connected',
        critical: true
      };
    }
    
    // Get database name
    const dbName = mongoose.connection.db?.databaseName || 'unknown';
    
    // Count indexes for key collections
    const Product = mongoose.model('Product');
    const indexCount = (await Product.collection.indexes()).length;
    
    return {
      success: true,
      service: serviceName,
      message: `Connected to: ${dbName} (${indexCount} product indexes)`,
      critical: true
    };
    
  } catch (error) {
    return {
      success: false,
      service: serviceName,
      message: `Verification error: ${error.message}`,
      critical: true
    };
  }
}

/**
 * Verify Redis connection (if configured)
 * @returns {Promise<VerificationResult>}
 */
async function verifyRedis() {
  const serviceName = 'Redis';
  
  try {
    const redisUrl = process.env.REDIS_URL;
    
    if (!redisUrl) {
      return {
        success: true,
        service: serviceName,
        message: 'Not configured (using in-memory caching)',
        critical: false
      };
    }
    
    // If Redis is configured, try to connect
    // Note: Actual Redis client connection would go here
    // For now, just validate URL format
    if (!redisUrl.startsWith('redis://') && !redisUrl.startsWith('rediss://')) {
      return {
        success: false,
        service: serviceName,
        message: 'Invalid REDIS_URL format',
        critical: false
      };
    }
    
    return {
      success: true,
      service: serviceName,
      message: 'URL configured (connection will be established on first use)',
      critical: false
    };
    
  } catch (error) {
    return {
      success: false,
      service: serviceName,
      message: `Verification error: ${error.message}`,
      critical: false
    };
  }
}

/**
 * Verify Email configuration
 * @returns {Promise<VerificationResult>}
 */
async function verifyEmail() {
  const serviceName = 'Email (SMTP)';
  
  try {
    const { SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
    
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      return {
        success: false,
        service: serviceName,
        message: 'Not configured (SMTP_HOST, SMTP_USER, SMTP_PASS required)',
        critical: false
      };
    }
    
    return {
      success: true,
      service: serviceName,
      message: `Configured: ${SMTP_HOST} (from: ${SMTP_FROM || SMTP_USER})`,
      critical: false
    };
    
  } catch (error) {
    return {
      success: false,
      service: serviceName,
      message: `Verification error: ${error.message}`,
      critical: false
    };
  }
}

/**
 * Verify WhatsApp configuration
 * @returns {Promise<VerificationResult>}
 */
async function verifyWhatsApp() {
  const serviceName = 'WhatsApp';
  
  try {
    const { WHATSAPP_API_URL, WHATSAPP_TOKEN, WHATSAPP_PHONE_ID } = process.env;
    
    if (!WHATSAPP_API_URL || !WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
      return {
        success: false,
        service: serviceName,
        message: 'Not configured',
        critical: false
      };
    }
    
    return {
      success: true,
      service: serviceName,
      message: 'Configured',
      critical: false
    };
    
  } catch (error) {
    return {
      success: false,
      service: serviceName,
      message: `Verification error: ${error.message}`,
      critical: false
    };
  }
}

/**
 * Run all startup verifications
 * @param {Object} options
 * @param {boolean} options.exitOnCriticalFailure - Exit process if critical service fails
 * @param {boolean} options.verifyCloudinaryConnection - Actually ping Cloudinary
 * @returns {Promise<{passed: boolean, results: VerificationResult[]}>}
 */
async function runStartupVerification(options = {}) {
  const {
    exitOnCriticalFailure = true,
    verifyCloudinaryConnection = true
  } = options;
  
  console.log('\n🔍 Running startup verification...\n');
  
  const results = [];
  let hasAnyCriticalFailure = false;
  
  // Run verifications
  const verifications = [
    { name: 'Cloudinary', fn: verifyCloudinary, skip: !verifyCloudinaryConnection },
    { name: 'AI Provider', fn: verifyAIProvider },
    { name: 'MongoDB', fn: verifyMongoDB },
    { name: 'Redis', fn: verifyRedis },
    { name: 'Email', fn: verifyEmail },
    { name: 'WhatsApp', fn: verifyWhatsApp }
  ];
  
  for (const verification of verifications) {
    if (verification.skip) continue;
    
    try {
      const result = await verification.fn();
      results.push(result);
      
      const icon = result.success ? '✅' : (result.critical ? '❌' : '⚠️');
      const status = result.success ? 'OK' : (result.critical ? 'FAILED' : 'WARNING');
      
      console.log(`${icon} ${result.service}: ${status}`);
      console.log(`   └─ ${result.message}`);
      
      if (!result.success && result.critical) {
        hasAnyCriticalFailure = true;
      }
      
    } catch (error) {
      console.log(`❌ ${verification.name}: ERROR`);
      console.log(`   └─ ${error.message}`);
      
      results.push({
        success: false,
        service: verification.name,
        message: error.message,
        critical: true
      });
      hasAnyCriticalFailure = true;
    }
  }
  
  console.log('\n');
  
  // Summary
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success && r.critical).length;
  const warnings = results.filter(r => !r.success && !r.critical).length;
  
  console.log(`📊 Verification Summary: ${passed} passed, ${failed} failed, ${warnings} warnings`);
  
  if (hasAnyCriticalFailure) {
    console.log('\n❌ Critical services are not properly configured!');
    
    if (exitOnCriticalFailure) {
      console.log('💥 Exiting due to critical configuration errors.\n');
      process.exit(1);
    }
  } else {
    console.log('✅ All critical services verified successfully!\n');
  }
  
  return {
    passed: !hasAnyCriticalFailure,
    results
  };
}

/**
 * Quick health check (for /health endpoint)
 * @returns {Promise<Object>}
 */
async function quickHealthCheck() {
  const checks = {
    mongodb: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString()
  };
  
  // Check Cloudinary (cached result, don't ping every time)
  checks.cloudinary = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
  
  // Check AI
  checks.ai = !!(process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY);
  
  return {
    status: checks.mongodb ? 'healthy' : 'unhealthy',
    checks
  };
}

module.exports = {
  runStartupVerification,
  quickHealthCheck,
  verifyCloudinary,
  verifyAIProvider,
  verifyMongoDB,
  verifyRedis,
  verifyEmail,
  verifyWhatsApp
};

