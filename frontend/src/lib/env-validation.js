// ==========================================
// FRONTEND ENVIRONMENT VARIABLES VALIDATION
// ==========================================
// Validates required environment variables at build/runtime
// ==========================================

/**
 * Validate required environment variables
 * @throws {Error} If required variables are missing
 */
export const validateEnv = () => {
  if (typeof window === 'undefined') {
    // Server-side validation
    const required = [
      'NEXT_PUBLIC_API_URL',
      'NEXT_PUBLIC_SITE_URL',
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      console.warn('\n⚠️  Missing recommended environment variables:');
      missing.forEach(key => console.warn(`   - ${key}`));
      console.warn('   Some features may not work properly.\n');
    }

    // Validate API URL format
    if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.startsWith('http')) {
      console.warn('⚠️  NEXT_PUBLIC_API_URL should be a valid URL starting with http:// or https://');
    }
  } else {
    // Client-side validation
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.error('❌ NEXT_PUBLIC_API_URL is not defined. API calls may fail.');
    }
  }
};

/**
 * Get environment variable with fallback
 * @param {string} key - Environment variable key
 * @param {string} fallback - Fallback value
 * @returns {string} Environment variable value or fallback
 */
export const getEnv = (key, fallback = '') => {
  if (typeof window === 'undefined') {
    return process.env[key] || fallback;
  }
  return process.env[key] || fallback;
};

// Validate on import (server-side only)
if (typeof window === 'undefined') {
  validateEnv();
}

export default { validateEnv, getEnv };

