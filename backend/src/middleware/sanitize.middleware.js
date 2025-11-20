/**
 * Enhanced Input Sanitization Middleware
 * Provides comprehensive input sanitization to prevent XSS and injection attacks
 */

const validator = require('validator');
const { sanitize: sanitizeHtml } = require('sanitize-html');

// ============================================
// HTML SANITIZATION OPTIONS
// ============================================

/**
 * Strict sanitization options (for user-generated content)
 */
const strictSanitizeOptions = {
  allowedTags: [], // No HTML tags allowed
  allowedAttributes: {},
  allowedSchemes: [],
  textContent: true
};

/**
 * Basic sanitization options (for rich text content)
 */
const basicSanitizeOptions = {
  allowedTags: [
    'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'a'
  ],
  allowedAttributes: {
    'a': ['href', 'title'],
    'h1': ['id'],
    'h2': ['id'],
    'h3': ['id'],
    'h4': ['id'],
    'h5': ['id'],
    'h6': ['id']
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    'a': ['http', 'https', 'mailto']
  }
};

// ============================================
// SANITIZATION FUNCTIONS
// ============================================

/**
 * Sanitize string input
 * @param {string} input - Input string
 * @param {object} options - Sanitization options
 * @returns {string} Sanitized string
 */
const sanitizeString = (input, options = strictSanitizeOptions) => {
  if (typeof input !== 'string') {
    return input;
  }
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Remove control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // HTML sanitization
  sanitized = sanitizeHtml(sanitized, options);
  
  // Additional XSS prevention
  sanitized = sanitized
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<script/gi, '&lt;script')
    .replace(/<\/script>/gi, '&lt;/script&gt;');
  
  return sanitized;
};

/**
 * Sanitize email
 * @param {string} email - Email address
 * @returns {string} Sanitized email
 */
const sanitizeEmail = (email) => {
  if (typeof email !== 'string') {
    return email;
  }
  
  const sanitized = validator.normalizeEmail(email, {
    lowercase: true,
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
    outlookdotcom_remove_subaddress: false,
    yahoo_remove_subaddress: false,
    icloud_remove_subaddress: false
  });
  
  return validator.isEmail(sanitized) ? sanitized : email.trim().toLowerCase();
};

/**
 * Sanitize URL
 * @param {string} url - URL
 * @returns {string} Sanitized URL
 */
const sanitizeURL = (url) => {
  if (typeof url !== 'string') {
    return url;
  }
  
  const trimmed = url.trim();
  
  // Validate and sanitize URL
  if (validator.isURL(trimmed, {
    protocols: ['http', 'https'],
    require_protocol: false,
    require_valid_protocol: true
  })) {
    return validator.escape(trimmed);
  }
  
  return '';
};

/**
 * Sanitize phone number
 * @param {string} phone - Phone number
 * @returns {string} Sanitized phone number
 */
const sanitizePhone = (phone) => {
  if (typeof phone !== 'string') {
    return phone;
  }
  
  // Remove all non-digit characters except + and spaces
  return phone.replace(/[^\d+\s-]/g, '').trim();
};

/**
 * Sanitize MongoDB ObjectId
 * @param {string} id - ObjectId string
 * @returns {string} Sanitized ObjectId
 */
const sanitizeObjectId = (id) => {
  if (typeof id !== 'string') {
    return id;
  }
  
  // Only allow alphanumeric characters (24 hex characters)
  const sanitized = id.replace(/[^0-9a-fA-F]/g, '');
  
  // Validate ObjectId format
  if (sanitized.length === 24 && /^[0-9a-fA-F]{24}$/.test(sanitized)) {
    return sanitized;
  }
  
  return '';
};

/**
 * Sanitize number
 * @param {any} value - Value to sanitize
 * @returns {number|null} Sanitized number or null
 */
const sanitizeNumber = (value) => {
  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }
  
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  }
  
  return null;
};

/**
 * Sanitize object recursively
 * @param {object} obj - Object to sanitize
 * @param {object} schema - Sanitization schema
 * @returns {object} Sanitized object
 */
const sanitizeObject = (obj, schema = {}) => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj !== 'object') {
    return sanitizeString(String(obj));
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, schema));
  }
  
  const sanitized = {};
  
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }
    
    // Sanitize key name
    const sanitizedKey = sanitizeString(key);
    
    // Get schema for this field
    const fieldSchema = schema[key] || {};
    const value = obj[key];
    
    // Apply field-specific sanitization
    if (fieldSchema.type === 'email') {
      sanitized[sanitizedKey] = sanitizeEmail(value);
    } else if (fieldSchema.type === 'url') {
      sanitized[sanitizedKey] = sanitizeURL(value);
    } else if (fieldSchema.type === 'phone') {
      sanitized[sanitizedKey] = sanitizePhone(value);
    } else if (fieldSchema.type === 'objectId') {
      sanitized[sanitizedKey] = sanitizeObjectId(value);
    } else if (fieldSchema.type === 'number') {
      sanitized[sanitizedKey] = sanitizeNumber(value);
    } else if (fieldSchema.type === 'html' || fieldSchema.allowHTML) {
      sanitized[sanitizedKey] = sanitizeString(value, basicSanitizeOptions);
    } else if (fieldSchema.type === 'object' && typeof value === 'object') {
      sanitized[sanitizedKey] = sanitizeObject(value, fieldSchema.schema || {});
    } else {
      sanitized[sanitizedKey] = sanitizeString(value);
    }
  }
  
  return sanitized;
};

// ============================================
// MIDDLEWARE
// ============================================

/**
 * Sanitize request body, query, and params
 * @param {object} schema - Optional sanitization schema
 */
const sanitizeInput = (schema = {}) => {
  return (req, res, next) => {
    try {
      // Sanitize body
      if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body, schema.body || {});
      }
      
      // Sanitize query parameters
      if (req.query && typeof req.query === 'object') {
        req.query = sanitizeObject(req.query, schema.query || {});
      }
      
      // Sanitize URL parameters
      if (req.params && typeof req.params === 'object') {
        req.params = sanitizeObject(req.params, schema.params || {});
      }
      
      next();
    } catch (error) {
      console.error('[Sanitization Error]', error);
      return res.status(400).json({
        success: false,
        message: 'Invalid input format'
      });
    }
  };
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  sanitizeString,
  sanitizeEmail,
  sanitizeURL,
  sanitizePhone,
  sanitizeObjectId,
  sanitizeNumber,
  sanitizeObject,
  sanitizeInput,
  strictSanitizeOptions,
  basicSanitizeOptions
};

