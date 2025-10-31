// ==========================================
// HTTP REQUEST LOGGING MIDDLEWARE
// ==========================================
// Logs all incoming HTTP requests with detailed information
// Tracks response times, status codes, and potential security issues
// ==========================================

const logger = require('../utils/logger');
const { HTTP_STATUS } = require('../config/constants');

/**
 * Extract IP address from request
 * Handles proxy and load balancer scenarios
 * @param {Object} req - Express request object
 * @returns {string} - Client IP address
 */
const getClientIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
};

/**
 * Sanitize sensitive data from request body
 * Removes passwords, tokens, and other sensitive information
 * @param {Object} body - Request body
 * @returns {Object} - Sanitized body
 */
const sanitizeBody = (body) => {
  if (!body || typeof body !== 'object') return body;

  const sensitiveFields = [
    'password',
    'confirmPassword',
    'oldPassword',
    'newPassword',
    'token',
    'refreshToken',
    'accessToken',
    'secret',
    'apiKey',
    'creditCard',
    'cvv',
    'ssn'
  ];

  const sanitized = { ...body };

  sensitiveFields.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  });

  return sanitized;
};

/**
 * Check if route should be logged
 * Skip logging for health checks and static assets
 * @param {string} path - Request path
 * @returns {boolean} - Should log this route
 */
const shouldLogRoute = (path) => {
  const skipPaths = [
    '/health',
    '/ping',
    '/favicon.ico',
    '/_next',
    '/static',
    '/public'
  ];

  return !skipPaths.some((skipPath) => path.startsWith(skipPath));
};

/**
 * Format response time for readability
 * @param {number} ms - Milliseconds
 * @returns {string} - Formatted time
 */
const formatResponseTime = (ms) => {
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

/**
 * Get log level based on status code
 * @param {number} statusCode - HTTP status code
 * @returns {string} - Log level (info, warn, error)
 */
const getLogLevel = (statusCode) => {
  if (statusCode >= 500) return 'error';
  if (statusCode >= 400) return 'warn';
  return 'info';
};

/**
 * Main HTTP request logging middleware
 * Logs request details and response information
 */
const requestLogger = (req, res, next) => {
  // Skip logging for certain routes
  if (!shouldLogRoute(req.path)) {
    return next();
  }

  // Record request start time
  const startTime = Date.now();
  const startHrTime = process.hrtime();

  // Extract request information
  const requestInfo = {
    method: req.method,
    url: req.originalUrl || req.url,
    path: req.path,
    ip: getClientIp(req),
    userAgent: req.get('user-agent') || 'unknown',
    referer: req.get('referer') || req.get('referrer') || 'direct',
    protocol: req.protocol,
    httpVersion: req.httpVersion,
    userId: req.user?.id || req.user?._id || 'anonymous',
    userEmail: req.user?.email || null,
    query: Object.keys(req.query).length > 0 ? req.query : null,
    body: req.method !== 'GET' ? sanitizeBody(req.body) : null,
    headers: {
      contentType: req.get('content-type'),
      contentLength: req.get('content-length'),
      accept: req.get('accept'),
      authorization: req.get('authorization') ? 'Bearer ***' : null
    }
  };

  // Log incoming request
  logger.info('Incoming Request', requestInfo);

  // Capture original end function
  const originalEnd = res.end;
  const originalJson = res.json;

  // Override res.end to capture response
  res.end = function (chunk, encoding) {
    // Calculate response time
    const responseTime = Date.now() - startTime;
    const hrDuration = process.hrtime(startHrTime);
    const hrResponseTime = hrDuration[0] * 1000 + hrDuration[1] / 1000000;

    // Response information
    const responseInfo = {
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      responseTime: formatResponseTime(responseTime),
      responseTimeMs: responseTime,
      hrResponseTime: `${hrResponseTime.toFixed(3)}ms`,
      ip: requestInfo.ip,
      userId: requestInfo.userId,
      userEmail: requestInfo.userEmail,
      contentLength: res.get('content-length') || 0,
      contentType: res.get('content-type'),
      timestamp: new Date().toISOString()
    };

    // Determine log level based on status code
    const logLevel = getLogLevel(res.statusCode);

    // Log response with appropriate level
    logger[logLevel]('Request Completed', responseInfo);

    // Log slow requests (> 1000ms)
    if (responseTime > 1000) {
      logger.warn('Slow Request Detected', {
        ...responseInfo,
        threshold: '1000ms',
        exceeded: `${responseTime - 1000}ms`
      });
    }

    // Log potential security issues
    if (res.statusCode === HTTP_STATUS.UNAUTHORIZED || 
        res.statusCode === HTTP_STATUS.FORBIDDEN) {
      logger.logSecurity(
        res.statusCode === HTTP_STATUS.UNAUTHORIZED 
          ? 'UNAUTHORIZED_ACCESS_ATTEMPT' 
          : 'FORBIDDEN_ACCESS_ATTEMPT',
        requestInfo.ip,
        `Attempted to access: ${requestInfo.url}`
      );
    }

    // Call original end function
    originalEnd.apply(res, arguments);
  };

  // Override res.json to capture JSON responses
  res.json = function (data) {
    // Store response body for potential error logging
    res.body = data;
    return originalJson.apply(res, arguments);
  };

  // Continue to next middleware
  next();
};

/**
 * Error logging middleware
 * Logs errors that occur during request processing
 * Should be used after error handler middleware
 */
const errorLogger = (err, req, res, next) => {
  const errorInfo = {
    error: {
      message: err.message,
      name: err.name,
      code: err.code || 'UNKNOWN_ERROR',
      statusCode: err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    },
    request: {
      method: req.method,
      url: req.originalUrl || req.url,
      ip: getClientIp(req),
      userAgent: req.get('user-agent'),
      userId: req.user?.id || req.user?._id || 'anonymous',
      userEmail: req.user?.email || null,
      body: sanitizeBody(req.body),
      query: req.query
    },
    timestamp: new Date().toISOString()
  };

  // Log error
  logger.error('Request Error', errorInfo);

  // Continue to error handler
  next(err);
};

/**
 * Morgan-style middleware for production
 * Simplified logging for high-traffic environments
 */
const productionLogger = (req, res, next) => {
  if (!shouldLogRoute(req.path)) {
    return next();
  }

  const startTime = Date.now();

  // Override res.end
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const responseTime = Date.now() - startTime;
    
    // Simple log format: METHOD URL STATUS TIME IP
    const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} ${responseTime}ms ${getClientIp(req)}`;
    
    if (res.statusCode >= 400) {
      logger.warn(logMessage);
    } else {
      logger.info(logMessage);
    }

    originalEnd.apply(res, arguments);
  };

  next();
};

/**
 * API endpoint monitoring middleware
 * Tracks API usage and performance metrics
 */
const apiMetricsLogger = (req, res, next) => {
  // Only track API routes
  if (!req.path.startsWith('/api/')) {
    return next();
  }

  const startTime = Date.now();

  // Override res.end
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const responseTime = Date.now() - startTime;

    // Extract endpoint info
    const endpoint = req.route?.path || req.path;
    const method = req.method;

    // Log API metric
    logger.logPerformance('API_ENDPOINT', responseTime, {
      endpoint,
      method,
      statusCode: res.statusCode,
      userId: req.user?.id || 'anonymous',
      ip: getClientIp(req)
    });

    originalEnd.apply(res, arguments);
  };

  next();
};

/**
 * Rate limit violation logger
 * Logs when rate limits are hit
 */
const rateLimitLogger = (req, res, next) => {
  // Check if rate limit headers are present
  const remaining = res.get('RateLimit-Remaining');
  const limit = res.get('RateLimit-Limit');

  if (remaining !== undefined && parseInt(remaining) === 0) {
    logger.logSecurity(
      'RATE_LIMIT_HIT',
      getClientIp(req),
      `Endpoint: ${req.originalUrl}, Limit: ${limit}`
    );
  }

  next();
};

/**
 * Authentication attempt logger
 * Logs login and registration attempts
 */
const authLogger = (req, res, next) => {
  const authPaths = ['/login', '/register', '/logout', '/forgot-password', '/reset-password'];
  const isAuthPath = authPaths.some(path => req.path.includes(path));

  if (!isAuthPath) {
    return next();
  }

  // Override res.json to log auth events
  const originalJson = res.json;
  res.json = function (data) {
    const email = req.body?.email || 'unknown';
    const userId = data?.data?.user?.id || data?.user?.id || null;
    const success = data?.success || res.statusCode < 400;

    let eventType = 'AUTH_UNKNOWN';
    if (req.path.includes('/login')) eventType = 'LOGIN';
    else if (req.path.includes('/register')) eventType = 'REGISTER';
    else if (req.path.includes('/logout')) eventType = 'LOGOUT';
    else if (req.path.includes('/forgot-password')) eventType = 'PASSWORD_RESET_REQUEST';
    else if (req.path.includes('/reset-password')) eventType = 'PASSWORD_RESET';

    logger.logAuth(eventType, userId, email, success, getClientIp(req));

    return originalJson.apply(res, arguments);
  };

  next();
};

/**
 * Choose appropriate logger based on environment
 */
const httpLogger = process.env.NODE_ENV === 'production'
  ? productionLogger
  : requestLogger;

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  requestLogger,
  errorLogger,
  httpLogger,
  productionLogger,
  apiMetricsLogger,
  rateLimitLogger,
  authLogger,
  getClientIp,
  sanitizeBody
};