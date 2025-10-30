/**
 * Validation Utilities
 * Helper functions for custom validation logic
 * 
 * Features:
 * - Custom validators for complex scenarios
 * - Data type validators
 * - Business logic validators
 * - Format validators
 * - Helper utilities for validation middleware
 */

const mongoose = require('mongoose');

// ============================================
// BASIC VALIDATORS
// ============================================

/**
 * Check if value is a valid MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean}
 */
const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Check if email format is valid
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
};

/**
 * Check if Pakistani phone number is valid
 * @param {string} phone - Phone number to validate
 * @returns {boolean}
 */
const isValidPakistaniPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const phoneRegex = /^(\+92|0)?3[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

/**
 * Check if URL is valid
 * @param {string} url - URL to validate
 * @returns {boolean}
 */
const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (error) {
    return false;
  }
};

/**
 * Check if string is a valid slug
 * @param {string} slug - Slug to validate
 * @returns {boolean}
 */
const isValidSlug = (slug) => {
  if (!slug || typeof slug !== 'string') return false;
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

/**
 * Check if password meets security requirements
 * @param {string} password - Password to validate
 * @returns {object} { valid: boolean, errors: string[] }
 */
const validatePasswordStrength = (password) => {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required'] };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[@$!%*?&#]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&#)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// ============================================
// BUSINESS LOGIC VALIDATORS
// ============================================

/**
 * Validate price range
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @returns {object} { valid: boolean, error: string }
 */
const validatePriceRange = (minPrice, maxPrice) => {
  const min = parseFloat(minPrice);
  const max = parseFloat(maxPrice);

  if (isNaN(min) || isNaN(max)) {
    return { valid: false, error: 'Price values must be numbers' };
  }

  if (min < 0 || max < 0) {
    return { valid: false, error: 'Prices cannot be negative' };
  }

  if (min > max) {
    return { valid: false, error: 'Minimum price cannot be greater than maximum price' };
  }

  return { valid: true };
};

/**
 * Validate discount percentage
 * @param {number} discount - Discount percentage
 * @returns {object} { valid: boolean, error: string }
 */
const validateDiscount = (discount) => {
  const discountNum = parseFloat(discount);

  if (isNaN(discountNum)) {
    return { valid: false, error: 'Discount must be a number' };
  }

  if (discountNum < 0) {
    return { valid: false, error: 'Discount cannot be negative' };
  }

  if (discountNum > 100) {
    return { valid: false, error: 'Discount cannot exceed 100%' };
  }

  return { valid: true };
};

/**
 * Validate measurement value
 * @param {number} value - Measurement value
 * @param {string} label - Measurement label (for error message)
 * @param {object} options - Min/max constraints
 * @returns {object} { valid: boolean, error: string }
 */
const validateMeasurement = (value, label, options = {}) => {
  const { min = 0, max = 500 } = options;
  const numValue = parseFloat(value);

  if (isNaN(numValue)) {
    return { valid: false, error: `${label} must be a number` };
  }

  if (numValue < min) {
    return { valid: false, error: `${label} must be at least ${min}` };
  }

  if (numValue > max) {
    return { valid: false, error: `${label} cannot exceed ${max}` };
  }

  return { valid: true };
};

/**
 * Validate rating value
 * @param {number} rating - Rating value
 * @returns {object} { valid: boolean, error: string }
 */
const validateRating = (rating) => {
  const ratingNum = parseInt(rating, 10);

  if (isNaN(ratingNum)) {
    return { valid: false, error: 'Rating must be a number' };
  }

  if (!Number.isInteger(ratingNum)) {
    return { valid: false, error: 'Rating must be a whole number' };
  }

  if (ratingNum < 1 || ratingNum > 5) {
    return { valid: false, error: 'Rating must be between 1 and 5' };
  }

  return { valid: true };
};

/**
 * Validate pagination parameters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {object} { valid: boolean, page: number, limit: number, error: string }
 */
const validatePagination = (page = 1, limit = 12) => {
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  if (isNaN(pageNum) || pageNum < 1) {
    return { valid: false, error: 'Page must be a positive integer' };
  }

  if (isNaN(limitNum) || limitNum < 1) {
    return { valid: false, error: 'Limit must be a positive integer' };
  }

  if (limitNum > 100) {
    return { valid: false, error: 'Limit cannot exceed 100 items per page' };
  }

  return {
    valid: true,
    page: pageNum,
    limit: limitNum
  };
};

/**
 * Validate sort parameter
 * @param {string} sort - Sort string (e.g., '-createdAt', 'price')
 * @param {array} allowedFields - Allowed fields for sorting
 * @returns {object} { valid: boolean, error: string }
 */
const validateSort = (sort, allowedFields = []) => {
  if (!sort || typeof sort !== 'string') {
    return { valid: true }; // Sort is optional
  }

  const sortField = sort.startsWith('-') ? sort.substring(1) : sort;

  if (allowedFields.length > 0 && !allowedFields.includes(sortField)) {
    return {
      valid: false,
      error: `Invalid sort field. Allowed fields: ${allowedFields.join(', ')}`
    };
  }

  return { valid: true };
};

// ============================================
// DATA SANITIZATION
// ============================================

/**
 * Sanitize string input (remove HTML tags, trim whitespace)
 * @param {string} input - String to sanitize
 * @returns {string}
 */
const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
};

/**
 * Sanitize email (lowercase, trim)
 * @param {string} email - Email to sanitize
 * @returns {string}
 */
const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return email;
  return email.trim().toLowerCase();
};

/**
 * Sanitize phone number (remove spaces, dashes)
 * @param {string} phone - Phone number to sanitize
 * @returns {string}
 */
const sanitizePhone = (phone) => {
  if (typeof phone !== 'string') return phone;
  return phone.replace(/[\s-]/g, '').trim();
};

/**
 * Sanitize object recursively
 * @param {object} obj - Object to sanitize
 * @returns {object}
 */
const sanitizeObject = (obj) => {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object' && obj !== null) {
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
};

// ============================================
// FILE VALIDATION
// ============================================

/**
 * Validate image file
 * @param {object} file - File object from multer
 * @param {object} options - Validation options
 * @returns {object} { valid: boolean, error: string }
 */
const validateImageFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  } = options;

  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!allowedTypes.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`
    };
  }

  return { valid: true };
};

/**
 * Validate multiple image files
 * @param {array} files - Array of file objects from multer
 * @param {object} options - Validation options
 * @returns {object} { valid: boolean, errors: string[] }
 */
const validateImageFiles = (files, options = {}) => {
  const { maxFiles = 10 } = options;
  const errors = [];

  if (!Array.isArray(files) || files.length === 0) {
    return { valid: false, errors: ['No files provided'] };
  }

  if (files.length > maxFiles) {
    return { valid: false, errors: [`Maximum ${maxFiles} files allowed`] };
  }

  files.forEach((file, index) => {
    const validation = validateImageFile(file, options);
    if (!validation.valid) {
      errors.push(`File ${index + 1}: ${validation.error}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

// ============================================
// ARRAY VALIDATORS
// ============================================

/**
 * Check if array is valid and not empty
 * @param {array} arr - Array to validate
 * @param {string} fieldName - Field name for error message
 * @returns {object} { valid: boolean, error: string }
 */
const validateNonEmptyArray = (arr, fieldName) => {
  if (!Array.isArray(arr)) {
    return { valid: false, error: `${fieldName} must be an array` };
  }

  if (arr.length === 0) {
    return { valid: false, error: `${fieldName} cannot be empty` };
  }

  return { valid: true };
};

/**
 * Validate array length
 * @param {array} arr - Array to validate
 * @param {object} options - Min/max length
 * @param {string} fieldName - Field name for error message
 * @returns {object} { valid: boolean, error: string }
 */
const validateArrayLength = (arr, options = {}, fieldName = 'Array') => {
  const { min, max } = options;

  if (!Array.isArray(arr)) {
    return { valid: false, error: `${fieldName} must be an array` };
  }

  if (min !== undefined && arr.length < min) {
    return { valid: false, error: `${fieldName} must contain at least ${min} item(s)` };
  }

  if (max !== undefined && arr.length > max) {
    return { valid: false, error: `${fieldName} cannot contain more than ${max} item(s)` };
  }

  return { valid: true };
};

// ============================================
// DATE VALIDATORS
// ============================================

/**
 * Check if date is valid
 * @param {string|Date} date - Date to validate
 * @returns {boolean}
 */
const isValidDate = (date) => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

/**
 * Validate date range
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {object} { valid: boolean, error: string }
 */
const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (!isValidDate(start) || !isValidDate(end)) {
    return { valid: false, error: 'Invalid date format' };
  }

  if (start > end) {
    return { valid: false, error: 'Start date cannot be after end date' };
  }

  return { valid: true };
};

/**
 * Check if date is in the past
 * @param {string|Date} date - Date to check
 * @returns {boolean}
 */
const isDateInPast = (date) => {
  const dateObj = new Date(date);
  const now = new Date();
  return isValidDate(dateObj) && dateObj < now;
};

/**
 * Check if date is in the future
 * @param {string|Date} date - Date to check
 * @returns {boolean}
 */
const isDateInFuture = (date) => {
  const dateObj = new Date(date);
  const now = new Date();
  return isValidDate(dateObj) && dateObj > now;
};

// ============================================
// CUSTOM VALIDATION HELPERS
// ============================================

/**
 * Create validation error response
 * @param {string|array} errors - Error message(s)
 * @returns {object}
 */
const createValidationError = (errors) => {
  const errorArray = Array.isArray(errors) ? errors : [errors];
  
  return {
    success: false,
    message: 'Validation failed',
    errors: errorArray.map(err => 
      typeof err === 'string' ? { message: err } : err
    )
  };
};

/**
 * Validate required fields
 * @param {object} data - Data object to validate
 * @param {array} requiredFields - Array of required field names
 * @returns {object} { valid: boolean, missing: string[] }
 */
const validateRequiredFields = (data, requiredFields) => {
  const missing = [];

  requiredFields.forEach(field => {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      missing.push(field);
    }
  });

  return {
    valid: missing.length === 0,
    missing
  };
};

/**
 * Validate enum value
 * @param {any} value - Value to validate
 * @param {array} allowedValues - Array of allowed values
 * @param {string} fieldName - Field name for error message
 * @returns {object} { valid: boolean, error: string }
 */
const validateEnum = (value, allowedValues, fieldName) => {
  if (!allowedValues.includes(value)) {
    return {
      valid: false,
      error: `${fieldName} must be one of: ${allowedValues.join(', ')}`
    };
  }

  return { valid: true };
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Basic validators
  isValidObjectId,
  isValidEmail,
  isValidPakistaniPhone,
  isValidUrl,
  isValidSlug,
  validatePasswordStrength,

  // Business logic validators
  validatePriceRange,
  validateDiscount,
  validateMeasurement,
  validateRating,
  validatePagination,
  validateSort,

  // Data sanitization
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  sanitizeObject,

  // File validation
  validateImageFile,
  validateImageFiles,

  // Array validators
  validateNonEmptyArray,
  validateArrayLength,

  // Date validators
  isValidDate,
  validateDateRange,
  isDateInPast,
  isDateInFuture,

  // Helpers
  createValidationError,
  validateRequiredFields,
  validateEnum
};