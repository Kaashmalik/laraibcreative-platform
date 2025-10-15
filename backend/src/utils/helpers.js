/**
 * Helper Utilities
 * Common utility functions used across the application
 * 
 * Features:
 * - Slug generation
 * - Text formatting
 * - Date formatting
 * - Price formatting
 * - Order number generation
 * - Pagination helpers
 * - Response formatters
 */

const crypto = require('crypto');

// ============================================
// SLUG GENERATION
// ============================================

/**
 * Generate SEO-friendly slug from text
 * @param {string} text - Text to convert to slug
 * @returns {string} - URL-friendly slug
 */
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

/**
 * Generate unique slug with counter
 * @param {string} text - Base text
 * @param {Function} checkExists - Async function to check if slug exists
 * @returns {Promise<string>} - Unique slug
 */
const generateUniqueSlug = async (text, checkExists) => {
  let slug = generateSlug(text);
  let counter = 1;
  let exists = await checkExists(slug);

  while (exists) {
    slug = `${generateSlug(text)}-${counter}`;
    exists = await checkExists(slug);
    counter++;
  }

  return slug;
};

// ============================================
// ORDER NUMBER GENERATION
// ============================================

/**
 * Generate unique order number
 * Format: LC-YYYY-XXXXX (e.g., LC-2025-00001)
 * @param {number} lastOrderCount - Last order count from database
 * @returns {string} - Formatted order number
 */
const generateOrderNumber = (lastOrderCount = 0) => {
  const year = new Date().getFullYear();
  const orderCount = (lastOrderCount + 1).toString().padStart(5, '0');
  return `LC-${year}-${orderCount}`;
};

/**
 * Generate tracking number
 * @returns {string} - Random tracking number
 */
const generateTrackingNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `LC${timestamp}${random}`;
};

// ============================================
// SKU GENERATION
// ============================================

/**
 * Generate product SKU
 * Format: LC-TIMESTAMP-RAND (e.g., LC-1704567890-AB3F)
 * @returns {string} - Unique SKU
 */
const generateSKU = () => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `LC-${timestamp}-${random}`;
};

// ============================================
// TEXT FORMATTING
// ============================================

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} - Truncated text
 */
const truncateText = (text, length = 100, suffix = '...') => {
  if (!text || text.length <= length) return text;
  return text.substring(0, length).trim() + suffix;
};

/**
 * Extract excerpt from HTML content
 * @param {string} html - HTML content
 * @param {number} length - Maximum length
 * @returns {string} - Plain text excerpt
 */
const extractExcerpt = (html, length = 160) => {
  // Remove HTML tags
  const text = html.replace(/<[^>]*>/g, '');
  return truncateText(text, length);
};

/**
 * Calculate reading time
 * @param {string} text - Text content
 * @param {number} wordsPerMinute - Average reading speed (default: 200)
 * @returns {number} - Reading time in minutes
 */
const calculateReadTime = (text, wordsPerMinute = 200) => {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
};

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} - Capitalized text
 */
const capitalizeWords = (text) => {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// ============================================
// NUMBER & CURRENCY FORMATTING
// ============================================

/**
 * Format price in Pakistani Rupees
 * @param {number} amount - Amount to format
 * @param {boolean} includeSymbol - Include PKR symbol (default: true)
 * @returns {string} - Formatted price
 */
const formatPrice = (amount, includeSymbol = true) => {
  const formatted = new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);

  return includeSymbol ? `PKR ${formatted}` : formatted;
};

/**
 * Calculate discount amount
 * @param {number} price - Original price
 * @param {number} discountPercent - Discount percentage
 * @returns {object} - {discountAmount, finalPrice}
 */
const calculateDiscount = (price, discountPercent) => {
  const discountAmount = (price * discountPercent) / 100;
  const finalPrice = price - discountAmount;
  
  return {
    discountAmount: Math.round(discountAmount),
    finalPrice: Math.round(finalPrice)
  };
};

/**
 * Calculate percentage
 * @param {number} part - Part value
 * @param {number} whole - Whole value
 * @returns {number} - Percentage (0-100)
 */
const calculatePercentage = (part, whole) => {
  if (whole === 0) return 0;
  return Math.round((part / whole) * 100);
};

// ============================================
// DATE FORMATTING
// ============================================

/**
 * Format date to readable string
 * @param {Date} date - Date object
 * @param {string} format - Format type ('short', 'long', 'iso')
 * @returns {string} - Formatted date
 */
const formatDate = (date, format = 'short') => {
  const d = new Date(date);
  
  if (format === 'iso') {
    return d.toISOString();
  }
  
  const options = format === 'long' 
    ? { year: 'numeric', month: 'long', day: 'numeric' }
    : { year: 'numeric', month: 'short', day: 'numeric' };
  
  return d.toLocaleDateString('en-US', options);
};

/**
 * Calculate date difference in days
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} - Difference in days
 */
const dateDifferenceInDays = (date1, date2) => {
  const diffTime = Math.abs(new Date(date2) - new Date(date1));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Add days to date
 * @param {Date} date - Base date
 * @param {number} days - Number of days to add
 * @returns {Date} - New date
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {Date} date - Date to compare
 * @returns {string} - Relative time string
 */
const getRelativeTime = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }
  
  return 'Just now';
};

// ============================================
// PAGINATION HELPERS
// ============================================

/**
 * Calculate pagination metadata
 * @param {number} total - Total items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} - Pagination metadata
 */
const calculatePagination = (total, page = 1, limit = 10) => {
  const currentPage = parseInt(page);
  const itemsPerPage = parseInt(limit);
  const totalPages = Math.ceil(total / itemsPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  const skip = (currentPage - 1) * itemsPerPage;

  return {
    total,
    currentPage,
    totalPages,
    itemsPerPage,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? currentPage + 1 : null,
    prevPage: hasPrevPage ? currentPage - 1 : null,
    skip
  };
};

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Check if string is valid email
 * @param {string} email - Email to validate
 * @returns {boolean} - Is valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if string is valid Pakistani phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - Is valid phone number
 */
const isValidPakistaniPhone = (phone) => {
  const phoneRegex = /^(\+92|0)?[0-9]{10}$/;
  return phoneRegex.test(phone);
};

/**
 * Check if string is valid MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} - Is valid ObjectId
 */
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Sanitize filename for upload
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
const sanitizeFilename = (filename) => {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// ============================================
// ARRAY HELPERS
// ============================================

/**
 * Remove duplicates from array
 * @param {Array} array - Array with duplicates
 * @returns {Array} - Array without duplicates
 */
const removeDuplicates = (array) => {
  return [...new Set(array)];
};

/**
 * Shuffle array randomly
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} - Grouped object
 */
const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

// ============================================
// RESPONSE FORMATTERS
// ============================================

/**
 * Format success response
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @returns {object} - Formatted response
 */
const successResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data
  };
};

/**
 * Format error response
 * @param {string} message - Error message
 * @param {Array} errors - Validation errors (optional)
 * @returns {object} - Formatted response
 */
const errorResponse = (message = 'An error occurred', errors = null) => {
  const response = {
    success: false,
    message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return response;
};

/**
 * Format paginated response
 * @param {Array} data - Data array
 * @param {object} pagination - Pagination metadata
 * @returns {object} - Formatted response
 */
const paginatedResponse = (data, pagination) => {
  return {
    success: true,
    data,
    pagination
  };
};

// ============================================
// RANDOM GENERATORS
// ============================================

/**
 * Generate random string
 * @param {number} length - Length of string
 * @param {string} charset - Character set (default: alphanumeric)
 * @returns {string} - Random string
 */
const generateRandomString = (length = 10, charset = 'alphanumeric') => {
  const charsets = {
    numeric: '0123456789',
    alphabetic: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    alphanumeric: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    hex: '0123456789ABCDEF'
  };
  
  const chars = charsets[charset] || charsets.alphanumeric;
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Generate random number in range
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random number
 */
const randomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// ============================================
// PASSWORD HELPERS
// ============================================

/**
 * Generate random password
 * @param {number} length - Password length (default: 12)
 * @returns {string} - Random password
 */
const generatePassword = (length = 12) => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '@$!%*?&#';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  let password = '';
  
  // Ensure at least one of each type
  password += lowercase[randomNumber(0, lowercase.length - 1)];
  password += uppercase[randomNumber(0, uppercase.length - 1)];
  password += numbers[randomNumber(0, numbers.length - 1)];
  password += symbols[randomNumber(0, symbols.length - 1)];
  
  // Fill remaining length
  for (let i = password.length; i < length; i++) {
    password += allChars[randomNumber(0, allChars.length - 1)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Check password strength
 * @param {string} password - Password to check
 * @returns {object} - {strength: 'weak'|'medium'|'strong', score: 0-100}
 */
const checkPasswordStrength = (password) => {
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  
  // Complexity checks
  if (/[a-z]/.test(password)) score += 15; // Lowercase
  if (/[A-Z]/.test(password)) score += 15; // Uppercase
  if (/\d/.test(password)) score += 15; // Numbers
  if (/[@$!%*?&#]/.test(password)) score += 15; // Special chars
  
  let strength = 'weak';
  if (score >= 60) strength = 'medium';
  if (score >= 80) strength = 'strong';
  
  return { strength, score };
};

// ============================================
// OBJECT HELPERS
// ============================================

/**
 * Deep clone object
 * @param {object} obj - Object to clone
 * @returns {object} - Cloned object
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Remove null/undefined values from object
 * @param {object} obj - Object to clean
 * @returns {object} - Cleaned object
 */
const removeEmpty = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v != null && v !== '')
  );
};

/**
 * Pick specific keys from object
 * @param {object} obj - Source object
 * @param {Array} keys - Keys to pick
 * @returns {object} - Object with selected keys
 */
const pick = (obj, keys) => {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

/**
 * Omit specific keys from object
 * @param {object} obj - Source object
 * @param {Array} keys - Keys to omit
 * @returns {object} - Object without omitted keys
 */
const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

// ============================================
// SEARCH HELPERS
// ============================================

/**
 * Build search query for MongoDB
 * @param {string} searchTerm - Search term
 * @param {Array} fields - Fields to search in
 * @returns {object} - MongoDB query object
 */
const buildSearchQuery = (searchTerm, fields) => {
  if (!searchTerm) return {};
  
  return {
    $or: fields.map(field => ({
      [field]: { $regex: searchTerm, $options: 'i' }
    }))
  };
};

/**
 * Highlight search term in text
 * @param {string} text - Text to highlight in
 * @param {string} searchTerm - Term to highlight
 * @returns {string} - Text with highlighted term
 */
const highlightSearchTerm = (text, searchTerm) => {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

// ============================================
// ERROR HELPERS
// ============================================

/**
 * Create custom error with status code
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {Error} - Custom error
 */
const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * Handle async errors in Express
 * @param {Function} fn - Async function
 * @returns {Function} - Wrapped function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Slug generation
  generateSlug,
  generateUniqueSlug,
  
  // Number generation
  generateOrderNumber,
  generateTrackingNumber,
  generateSKU,
  
  // Text formatting
  truncateText,
  extractExcerpt,
  calculateReadTime,
  capitalizeWords,
  
  // Currency formatting
  formatPrice,
  calculateDiscount,
  calculatePercentage,
  
  // Date formatting
  formatDate,
  dateDifferenceInDays,
  addDays,
  getRelativeTime,
  
  // Pagination
  calculatePagination,
  
  // Validation
  isValidEmail,
  isValidPakistaniPhone,
  isValidObjectId,
  sanitizeFilename,
  
  // Array helpers
  removeDuplicates,
  shuffleArray,
  groupBy,
  
  // Response formatters
  successResponse,
  errorResponse,
  paginatedResponse,
  
  // Random generators
  generateRandomString,
  randomNumber,
  generatePassword,
  checkPasswordStrength,
  
  // Object helpers
  deepClone,
  removeEmpty,
  pick,
  omit,
  
  // Search helpers
  buildSearchQuery,
  highlightSearchTerm,
  
  // Error helpers
  createError,
  asyncHandler
};