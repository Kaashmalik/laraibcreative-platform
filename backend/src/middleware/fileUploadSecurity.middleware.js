/**
 * Enhanced File Upload Security Middleware
 * Provides additional security checks for file uploads
 */

const path = require('path');
const fs = require('fs');

// ============================================
// FILE TYPE VALIDATION
// ============================================

/**
 * Allowed MIME types by upload category
 */
const ALLOWED_MIME_TYPES = {
  product: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  reference: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  receipt: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
  blog: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  avatar: ['image/jpeg', 'image/jpg', 'image/png']
};

/**
 * Allowed file extensions
 */
const ALLOWED_EXTENSIONS = {
  product: ['.jpg', '.jpeg', '.png', '.webp'],
  reference: ['.jpg', '.jpeg', '.png', '.webp'],
  receipt: ['.jpg', '.jpeg', '.png', '.pdf'],
  blog: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  avatar: ['.jpg', '.jpeg', '.png']
};

/**
 * Maximum file sizes (in bytes)
 */
const MAX_FILE_SIZES = {
  product: 5 * 1024 * 1024, // 5MB
  reference: 5 * 1024 * 1024, // 5MB
  receipt: 3 * 1024 * 1024, // 3MB
  blog: 5 * 1024 * 1024, // 5MB
  avatar: 2 * 1024 * 1024 // 2MB
};

// ============================================
// SECURITY VALIDATION FUNCTIONS
// ============================================

/**
 * Validate file extension
 * @param {string} filename - File name
 * @param {string} uploadType - Type of upload
 * @returns {boolean} True if valid
 */
const validateFileExtension = (filename, uploadType) => {
  const ext = path.extname(filename).toLowerCase();
  const allowed = ALLOWED_EXTENSIONS[uploadType] || ALLOWED_EXTENSIONS.product;
  return allowed.includes(ext);
};

/**
 * Validate MIME type
 * @param {string} mimetype - MIME type
 * @param {string} uploadType - Type of upload
 * @returns {boolean} True if valid
 */
const validateMimeType = (mimetype, uploadType) => {
  const allowed = ALLOWED_MIME_TYPES[uploadType] || ALLOWED_MIME_TYPES.product;
  return allowed.includes(mimetype);
};

/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @param {string} uploadType - Type of upload
 * @returns {boolean} True if valid
 */
const validateFileSize = (size, uploadType) => {
  const maxSize = MAX_FILE_SIZES[uploadType] || MAX_FILE_SIZES.product;
  return size <= maxSize;
};

/**
 * Check for dangerous file names
 * @param {string} filename - File name
 * @returns {boolean} True if safe
 */
const validateFileName = (filename) => {
  // Block null bytes
  if (filename.includes('\0')) {
    return false;
  }
  
  // Block path traversal attempts
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false;
  }
  
  // Block control characters
  if (/[\x00-\x1F\x7F]/.test(filename)) {
    return false;
  }
  
  // Block reserved Windows names
  const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
  const nameWithoutExt = path.basename(filename, path.extname(filename)).toUpperCase();
  if (reservedNames.includes(nameWithoutExt)) {
    return false;
  }
  
  return true;
};

/**
 * Check file content (magic number validation)
 * @param {Buffer} buffer - File buffer
 * @param {string} mimetype - Expected MIME type
 * @returns {boolean} True if content matches MIME type
 */
const validateFileContent = (buffer, mimetype) => {
  // Check magic numbers (file signatures)
  const signatures = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF header
    'image/gif': [0x47, 0x49, 0x46, 0x38], // GIF8
    'application/pdf': [0x25, 0x50, 0x44, 0x46] // %PDF
  };
  
  const expectedSignature = signatures[mimetype];
  if (!expectedSignature) {
    return false;
  }
  
  // Check if buffer starts with expected signature
  for (let i = 0; i < expectedSignature.length; i++) {
    if (buffer[i] !== expectedSignature[i]) {
      return false;
    }
  }
  
  return true;
};

// ============================================
// MIDDLEWARE
// ============================================

/**
 * Enhanced file upload security middleware
 * @param {string} uploadType - Type of upload (product, reference, etc.)
 */
const fileUploadSecurity = (uploadType = 'product') => {
  return (req, res, next) => {
    const files = req.files || (req.file ? [req.file] : []);
    
    if (files.length === 0) {
      return next();
    }
    
    for (const file of files) {
      // Validate file name
      if (!validateFileName(file.originalname)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file name. File name contains dangerous characters.'
        });
      }
      
      // Validate file extension
      if (!validateFileExtension(file.originalname, uploadType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS[uploadType].join(', ')}`
        });
      }
      
      // Validate MIME type
      if (!validateMimeType(file.mimetype, uploadType)) {
        return res.status(400).json({
          success: false,
          message: 'File MIME type does not match file extension. Possible file type spoofing.'
        });
      }
      
      // Validate file size
      if (!validateFileSize(file.size, uploadType)) {
        return res.status(400).json({
          success: false,
          message: `File size exceeds maximum allowed size of ${MAX_FILE_SIZES[uploadType] / (1024 * 1024)}MB`
        });
      }
      
      // Validate file content (magic number)
      if (file.buffer && !validateFileContent(file.buffer, file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'File content does not match declared file type. Possible file type spoofing.'
        });
      }
    }
    
    next();
  };
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  fileUploadSecurity,
  validateFileExtension,
  validateMimeType,
  validateFileSize,
  validateFileName,
  validateFileContent,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZES
};

