// backend/src/utils/logger.js
// ==========================================
// WINSTON LOGGER CONFIGURATION
// ==========================================
// Production-grade logging system with daily rotation and error tracking
// ==========================================

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// ==========================================
// CREATE LOGS DIRECTORY
// ==========================================

const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ==========================================
// CUSTOM LOG FORMATS
// ==========================================

// Format for file output (JSON with stack traces)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Format for console output (colorized and readable)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let output = `${timestamp} [${level}]: ${message}`;
    
    // Add stack trace if available
    if (stack) {
      output += `\n${stack}`;
    }
    
    // Add metadata if available
    if (Object.keys(meta).length > 0) {
      output += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return output;
  })
);

// ==========================================
// DAILY ROTATE FILE TRANSPORTS
// ==========================================

// Error logs with daily rotation
const errorFileRotateTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxFiles: process.env.LOG_MAX_FILES || '14d',
  maxSize: process.env.LOG_MAX_SIZE || '20m',
  format: fileFormat,
  zippedArchive: true
});

// Combined logs with daily rotation
const combinedFileRotateTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: process.env.LOG_MAX_FILES || '14d',
  maxSize: process.env.LOG_MAX_SIZE || '20m',
  format: fileFormat,
  zippedArchive: true
});

// Warning logs with daily rotation
const warnFileRotateTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'warn-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'warn',
  maxFiles: process.env.LOG_MAX_FILES || '7d',
  maxSize: process.env.LOG_MAX_SIZE || '10m',
  format: fileFormat,
  zippedArchive: true
});

// ==========================================
// WINSTON LOGGER INSTANCE
// ==========================================

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  defaultMeta: { 
    service: 'laraibcreative-backend',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    errorFileRotateTransport,
    combinedFileRotateTransport,
    warnFileRotateTransport
  ],

  // Handle uncaught exceptions
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '7d',
      maxSize: '10m',
      format: fileFormat
    })
  ],

  // Handle unhandled promise rejections
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '7d',
      maxSize: '10m',
      format: fileFormat
    })
  ],

  exitOnError: false
});

// ==========================================
// CONSOLE OUTPUT (Development Only)
// ==========================================

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug'
    })
  );
}

// ==========================================
// STREAM FOR MORGAN (HTTP Request Logging)
// ==========================================

logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// ==========================================
// CUSTOM HELPER METHODS
// ==========================================

/**
 * Log HTTP request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
logger.logRequest = (req, res) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    statusCode: res.statusCode,
    responseTime: res.responseTime || 0
  });
};

/**
 * Log database operation
 * @param {String} operation - Operation type (CREATE, READ, UPDATE, DELETE)
 * @param {String} model - Model name
 * @param {String} id - Document ID (optional)
 * @param {Boolean} success - Operation success status
 * @param {String} error - Error message (if failed)
 */
logger.logDatabase = (operation, model, id = null, success = true, error = null) => {
  const logData = {
    operation,
    model,
    id,
    success,
    timestamp: new Date().toISOString()
  };

  if (success) {
    logger.info(`Database ${operation}`, logData);
  } else {
    logger.error(`Database ${operation} Failed`, { ...logData, error });
  }
};

/**
 * Log authentication event
 * @param {String} event - Event type (LOGIN, LOGOUT, REGISTER, etc.)
 * @param {String} userId - User ID
 * @param {String} email - User email
 * @param {Boolean} success - Event success status
 * @param {String} ip - IP address
 */
logger.logAuth = (event, userId, email, success = true, ip = null) => {
  const logData = {
    event,
    userId,
    email,
    success,
    ip,
    timestamp: new Date().toISOString()
  };

  if (success) {
    logger.info(`Auth Event: ${event}`, logData);
  } else {
    logger.warn(`Auth Event Failed: ${event}`, logData);
  }
};

/**
 * Log file upload
 * @param {String} filename - File name
 * @param {Number} size - File size in bytes
 * @param {String} mimetype - File MIME type
 * @param {String} userId - User ID who uploaded
 * @param {Boolean} success - Upload success status
 */
logger.logUpload = (filename, size, mimetype, userId, success = true) => {
  const logData = {
    filename,
    size,
    mimetype,
    userId,
    success,
    timestamp: new Date().toISOString()
  };

  if (success) {
    logger.info('File Upload', logData);
  } else {
    logger.error('File Upload Failed', logData);
  }
};

/**
 * Log order event
 * @param {String} event - Event type (CREATED, UPDATED, CANCELLED, etc.)
 * @param {String} orderId - Order ID
 * @param {String} customerId - Customer ID
 * @param {Number} amount - Order amount
 * @param {String} status - Order status
 */
logger.logOrder = (event, orderId, customerId, amount, status) => {
  logger.info(`Order Event: ${event}`, {
    event,
    orderId,
    customerId,
    amount,
    status,
    timestamp: new Date().toISOString()
  });
};

/**
 * Log payment event
 * @param {String} event - Event type (INITIATED, SUCCESS, FAILED)
 * @param {String} orderId - Order ID
 * @param {String} paymentMethod - Payment method
 * @param {Number} amount - Payment amount
 * @param {String} transactionId - Transaction ID
 * @param {Boolean} success - Payment success status
 */
logger.logPayment = (event, orderId, paymentMethod, amount, transactionId, success = true) => {
  const logData = {
    event,
    orderId,
    paymentMethod,
    amount,
    transactionId,
    success,
    timestamp: new Date().toISOString()
  };

  if (success) {
    logger.info(`Payment Event: ${event}`, logData);
  } else {
    logger.error(`Payment Event Failed: ${event}`, logData);
  }
};

/**
 * Log security event
 * @param {String} event - Event type (SUSPICIOUS_ACTIVITY, RATE_LIMIT_HIT, etc.)
 * @param {String} ip - IP address
 * @param {String} details - Additional details
 */
logger.logSecurity = (event, ip, details = '') => {
  logger.warn(`Security Event: ${event}`, {
    event,
    ip,
    details,
    timestamp: new Date().toISOString()
  });
};

/**
 * Log email event
 * @param {String} to - Recipient email
 * @param {String} subject - Email subject
 * @param {Boolean} success - Send success status
 * @param {String} error - Error message (if failed)
 */
logger.logEmail = (to, subject, success = true, error = null) => {
  const logData = {
    to,
    subject,
    success,
    timestamp: new Date().toISOString()
  };

  if (success) {
    logger.info('Email Sent', logData);
  } else {
    logger.error('Email Failed', { ...logData, error });
  }
};

/**
 * Log performance metric
 * @param {String} operation - Operation name
 * @param {Number} duration - Duration in milliseconds
 * @param {Object} metadata - Additional metadata
 */
logger.logPerformance = (operation, duration, metadata = {}) => {
  logger.info('Performance Metric', {
    operation,
    duration: `${duration}ms`,
    ...metadata,
    timestamp: new Date().toISOString()
  });
};

/**
 * Log WhatsApp notification
 * @param {String} to - Recipient phone number
 * @param {String} message - Message content
 * @param {Boolean} success - Send success status
 * @param {String} error - Error message (if failed)
 */
logger.logWhatsApp = (to, message, success = true, error = null) => {
  const logData = {
    to,
    messagePreview: message.substring(0, 50),
    success,
    timestamp: new Date().toISOString()
  };

  if (success) {
    logger.info('WhatsApp Sent', logData);
  } else {
    logger.error('WhatsApp Failed', { ...logData, error });
  }
};

// ==========================================
// LOG ROTATION EVENTS
// ==========================================

// Log rotation events
errorFileRotateTransport.on('rotate', (oldFilename, newFilename) => {
  logger.info('Log file rotated', { oldFilename, newFilename });
});

combinedFileRotateTransport.on('rotate', (oldFilename, newFilename) => {
  logger.info('Log file rotated', { oldFilename, newFilename });
});

// ==========================================
// EXPORT LOGGER
// ==========================================

module.exports = logger;