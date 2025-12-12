// ==========================================
// ENVIRONMENT VARIABLES VALIDATION
// ==========================================
// Validates all required environment variables at startup
// Prevents runtime errors from missing configuration
// ==========================================

/**
 * Validate required environment variables
 * Supports both MongoDB (legacy) and TiDB (new) configurations
 * @throws {Error} If required variables are missing
 */
const validateEnv = () => {
  // Core required variables
  const required = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\n💡 Please create a .env file with all required variables.');
    console.error('   See docs/ENV_TEMPLATE.md for reference.\n');
    process.exit(1);
  }

  // Validate JWT secrets length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.error('\n❌ JWT_SECRET must be at least 32 characters long');
    console.error('   Current length:', process.env.JWT_SECRET.length);
    process.exit(1);
  }

  if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
    console.error('\n❌ JWT_REFRESH_SECRET must be at least 32 characters long');
    console.error('   Current length:', process.env.JWT_REFRESH_SECRET.length);
    process.exit(1);
  }

  // Check database configuration (TiDB or MongoDB)
  const hasTiDB = process.env.TIDB_HOST && process.env.TIDB_USER && process.env.TIDB_PASSWORD;
  const hasMongoDB = process.env.MONGODB_URI;

  if (!hasTiDB && !hasMongoDB) {
    console.error('\n❌ No database configured!');
    console.error('   Configure either TiDB Cloud or MongoDB:');
    console.error('   TiDB: TIDB_HOST, TIDB_USER, TIDB_PASSWORD, TIDB_DATABASE');
    console.error('   MongoDB: MONGODB_URI');
    process.exit(1);
  }

  // Log which database is configured
  if (hasTiDB) {
    console.log('✅ TiDB Cloud configured');
  }
  if (hasMongoDB) {
    console.log('✅ MongoDB configured');
  }

  // Validate MongoDB URI format (if using MongoDB)
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.startsWith('mongodb')) {
    console.error('\n❌ MONGODB_URI must be a valid MongoDB connection string');
    console.error('   Should start with "mongodb://" or "mongodb+srv://"');
    process.exit(1);
  }

  // Check AI configuration
  if (process.env.GEMINI_API_KEY) {
    console.log('✅ Gemini AI configured');
  }

  // Check Cloudinary configuration
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    console.log('✅ Cloudinary configured');
  }

  // Warn about optional but recommended variables
  const recommended = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'FRONTEND_URL'
  ];

  const missingRecommended = recommended.filter(key => !process.env[key]);

  if (missingRecommended.length > 0 && process.env.NODE_ENV === 'production') {
    console.warn('\n⚠️  Missing recommended environment variables:');
    missingRecommended.forEach(key => console.warn(`   - ${key}`));
    console.warn('   Some features may not work properly.\n');
  }

  console.log('✅ Environment variables validated');
};

module.exports = { validateEnv };

