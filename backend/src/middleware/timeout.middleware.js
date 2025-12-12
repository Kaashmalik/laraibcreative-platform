/**
 * Request Timeout Middleware
 * Prevents long-running requests from tying up server resources
 * 
 * Features:
 * - Configurable timeout per route
 * - Graceful timeout handling
 * - Proper cleanup of pending operations
 */

/**
 * Create timeout middleware with specified duration
 * @param {number} timeoutMs - Timeout in milliseconds (default: 30000)
 * @param {Object} options - Additional options
 * @returns {Function} Express middleware
 */
const createTimeoutMiddleware = (timeoutMs = 30000, options = {}) => {
  const {
    message = 'Request timeout - please try again',
    statusCode = 408,
    onTimeout = null,
  } = options;

  return (req, res, next) => {
    // Track if response has been sent
    let responseSent = false;
    let timeoutId = null;

    // Store original methods
    const originalSend = res.send.bind(res);
    const originalJson = res.json.bind(res);
    const originalEnd = res.end.bind(res);

    // Mark response as sent when any response method is called
    const markSent = () => {
      responseSent = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    // Override response methods to track when response is sent
    res.send = (...args) => {
      markSent();
      return originalSend(...args);
    };

    res.json = (...args) => {
      markSent();
      return originalJson(...args);
    };

    res.end = (...args) => {
      markSent();
      return originalEnd(...args);
    };

    // Set timeout
    timeoutId = setTimeout(() => {
      if (!responseSent) {
        // Mark request as timed out
        req.timedout = true;
        
        // Call custom timeout handler if provided
        if (onTimeout && typeof onTimeout === 'function') {
          try {
            onTimeout(req, res);
          } catch (error) {
            console.error('Timeout handler error:', error);
          }
        }

        // Only send response if not already sent
        if (!res.headersSent) {
          res.status(statusCode).json({
            success: false,
            message,
            code: 'REQUEST_TIMEOUT',
            timeout: timeoutMs,
          });
        }
      }
    }, timeoutMs);

    // Add timeout check helper to request
    req.checkTimeout = () => {
      if (req.timedout) {
        throw new Error('Request timed out');
      }
    };

    // Cleanup on response finish
    res.on('finish', markSent);
    res.on('close', markSent);

    next();
  };
};

/**
 * Pre-configured timeout middlewares for different route types
 */

// Default API timeout (30 seconds)
const defaultTimeout = createTimeoutMiddleware(30000, {
  message: 'Request took too long to process. Please try again.',
});

// AI service timeout (60 seconds) - AI operations take longer
const aiTimeout = createTimeoutMiddleware(60000, {
  message: 'AI service request timed out. Please try again.',
  onTimeout: (req, res) => {
    console.warn(`AI request timeout: ${req.method} ${req.path}`);
  },
});

// File upload timeout (120 seconds) - uploads take longer
const uploadTimeout = createTimeoutMiddleware(120000, {
  message: 'File upload timed out. Please try with smaller files or check your connection.',
  onTimeout: (req, res) => {
    console.warn(`Upload timeout: ${req.method} ${req.path}`);
  },
});

// Quick operations timeout (10 seconds) - for simple lookups
const quickTimeout = createTimeoutMiddleware(10000, {
  message: 'Request timed out. Please try again.',
});

// Long operation timeout (5 minutes) - for bulk operations, exports
const longOperationTimeout = createTimeoutMiddleware(300000, {
  message: 'The operation is taking too long. Please try again or contact support.',
  onTimeout: (req, res) => {
    console.warn(`Long operation timeout: ${req.method} ${req.path}`);
  },
});

/**
 * Middleware to check if request has timed out
 * Use this in long-running operations to check periodically
 */
const checkTimeoutMiddleware = (req, res, next) => {
  if (req.timedout) {
    return; // Don't call next if timed out
  }
  next();
};

/**
 * Async operation wrapper with timeout check
 * @param {Function} asyncFn - Async function to wrap
 * @param {Object} req - Express request object
 * @returns {Function} Wrapped function that checks timeout
 */
const withTimeoutCheck = (asyncFn, req) => {
  return async (...args) => {
    if (req.timedout) {
      throw new Error('Request timed out before operation could complete');
    }
    return asyncFn(...args);
  };
};

module.exports = {
  createTimeoutMiddleware,
  defaultTimeout,
  aiTimeout,
  uploadTimeout,
  quickTimeout,
  longOperationTimeout,
  checkTimeoutMiddleware,
  withTimeoutCheck,
};

