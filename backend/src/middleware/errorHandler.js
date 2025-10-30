// ==========================================
// GLOBAL ERROR HANDLER MIDDLEWARE
// ==========================================
// Centralized error handling for all API endpoints
// Handles mongoose errors, JWT errors, validation errors
// ==========================================

const { HTTP_STATUS, ERROR_CODES } = require('../config/constants');

/**
 * Error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging (in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  // ==========================================
  // MONGOOSE ERRORS
  // ==========================================

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.message = 'Resource not found';
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    error.code = ERROR_CODES.RECORD_NOT_FOUND;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error.statusCode = HTTP_STATUS.CONFLICT;
    error.code = ERROR_CODES.DUPLICATE_ENTRY;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    error.message = messages.join(', ');
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.code = ERROR_CODES.VALIDATION_ERROR;
  }

  // ==========================================
  // JWT ERRORS
  // ==========================================

  // JWT malformed or invalid
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token. Please login again';
    error.statusCode = HTTP_STATUS.UNAUTHORIZED;
    error.code = ERROR_CODES.TOKEN_INVALID;
  }

  // JWT expired
  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired. Please login again';
    error.statusCode = HTTP_STATUS.UNAUTHORIZED;
    error.code = ERROR_CODES.TOKEN_EXPIRED;
  }

  // ==========================================
  // MULTER ERRORS (File Upload)
  // ==========================================

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error.message = 'File size too large. Maximum size is 5MB';
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      error.code = ERROR_CODES.FILE_TOO_LARGE;
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      error.message = 'Too many files. Maximum is 10 files';
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      error.code = ERROR_CODES.UPLOAD_FAILED;
    } else {
      error.message = 'File upload failed';
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      error.code = ERROR_CODES.UPLOAD_FAILED;
    }
  }

  // ==========================================
  // RESPONSE
  // ==========================================

  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const errorCode = error.code || ERROR_CODES.INTERNAL_ERROR;

  res.status(statusCode).json({
    success: false,
    error: {
      message: error.message || 'Internal server error',
      code: errorCode,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        originalError: err,
      }),
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
  });
};

module.exports = errorHandler;