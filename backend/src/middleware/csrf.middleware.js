/**
 * CSRF Protection Middleware
 * Implements CSRF token validation for state-changing operations
 * 
 * Note: For API-only applications, CSRF protection is typically handled
 * via SameSite cookies and token-based authentication. This middleware
 * provides additional protection for web forms.
 */

const crypto = require('crypto');

// Store CSRF tokens in memory (in production, use Redis)
const csrfTokens = new Map();
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

// ============================================
// CSRF TOKEN GENERATION
// ============================================

/**
 * Generate a CSRF token
 * @returns {string} CSRF token
 */
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Create and store CSRF token
 * @param {string} sessionId - Session identifier
 * @returns {string} CSRF token
 */
const createCSRFToken = (sessionId) => {
  const token = generateCSRFToken();
  const expiry = Date.now() + CSRF_TOKEN_EXPIRY;
  
  csrfTokens.set(token, {
    sessionId,
    expiry,
    createdAt: Date.now()
  });
  
  // Clean up expired tokens periodically
  if (csrfTokens.size > 1000) {
    cleanupExpiredTokens();
  }
  
  return token;
};

/**
 * Clean up expired CSRF tokens
 */
const cleanupExpiredTokens = () => {
  const now = Date.now();
  for (const [token, data] of csrfTokens.entries()) {
    if (data.expiry < now) {
      csrfTokens.delete(token);
    }
  }
};

// ============================================
// CSRF TOKEN VALIDATION
// ============================================

/**
 * Validate CSRF token
 * @param {string} token - CSRF token to validate
 * @param {string} sessionId - Session identifier
 * @returns {boolean} True if valid
 */
const validateCSRFToken = (token, sessionId) => {
  if (!token || !sessionId) {
    return false;
  }
  
  const tokenData = csrfTokens.get(token);
  
  if (!tokenData) {
    return false;
  }
  
  // Check expiry
  if (tokenData.expiry < Date.now()) {
    csrfTokens.delete(token);
    return false;
  }
  
  // Check session match
  if (tokenData.sessionId !== sessionId) {
    return false;
  }
  
  // Token is valid - delete it (one-time use)
  csrfTokens.delete(token);
  return true;
};

// ============================================
// CSRF MIDDLEWARE
// ============================================

/**
 * CSRF protection middleware
 * Only applies to state-changing HTTP methods
 */
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Skip CSRF for API endpoints using token-based auth
  // (JWT tokens provide CSRF protection via SameSite cookies)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return next();
  }
  
  // Get session ID (from cookie or session)
  const sessionId = req.cookies?.sessionId || req.session?.id;
  
  if (!sessionId) {
    return res.status(403).json({
      success: false,
      message: 'CSRF protection: Session required'
    });
  }
  
  // Get CSRF token from header or body
  const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
  
  if (!csrfToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token missing. Please refresh the page and try again.'
    });
  }
  
  // Validate token
  if (!validateCSRFToken(csrfToken, sessionId)) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired CSRF token. Please refresh the page and try again.'
    });
  }
  
  next();
};

/**
 * Middleware to add CSRF token to response
 * Call this before rendering forms
 */
const addCSRFToken = (req, res, next) => {
  const sessionId = req.cookies?.sessionId || req.session?.id || req.ip;
  const token = createCSRFToken(sessionId);
  
  // Add token to response locals for template rendering
  res.locals.csrfToken = token;
  
  // Also send as header for API clients
  res.setHeader('X-CSRF-Token', token);
  
  next();
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  csrfProtection,
  addCSRFToken,
  createCSRFToken,
  validateCSRFToken,
  generateCSRFToken
};

