/**
 * Request Context Middleware
 * Provides request tracking, logging context, and performance metrics
 * 
 * Features:
 * - Unique request ID for tracing
 * - Request timing and metrics
 * - Structured logging context
 * - User context tracking
 */

const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * Request context storage using AsyncLocalStorage (Node.js 12.17+)
 */
const { AsyncLocalStorage } = require('async_hooks');
const requestContext = new AsyncLocalStorage();

/**
 * Get current request context
 * @returns {Object|null} Current request context
 */
const getRequestContext = () => {
  return requestContext.getStore() || null;
};

/**
 * Get request ID from current context
 * @returns {string|null} Current request ID
 */
const getRequestId = () => {
  const context = getRequestContext();
  return context?.requestId || null;
};

/**
 * Request context middleware
 * Attaches unique ID and tracking info to each request
 */
const requestContextMiddleware = (req, res, next) => {
  // Generate or use existing request ID
  const requestId = req.headers['x-request-id'] || uuidv4();
  const startTime = Date.now();
  const startHrTime = process.hrtime.bigint();

  // Create request context
  const context = {
    requestId,
    startTime,
    startHrTime,
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('user-agent'),
    userId: null, // Set later if authenticated
    sessionId: req.cookies?.sessionId || null,
  };

  // Attach to request object for easy access
  req.requestId = requestId;
  req.startTime = startTime;
  req.context = context;

  // Set response headers
  res.setHeader('X-Request-Id', requestId);

  // Create child logger with request context
  req.log = logger.child({
    requestId,
    method: req.method,
    path: req.path,
  });

  // Track response timing
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    const hrDuration = Number(process.hrtime.bigint() - startHrTime) / 1000000; // Convert to ms

    // Set timing headers
    res.setHeader('X-Response-Time', `${hrDuration.toFixed(2)}ms`);

    // Log request completion
    const logData = {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length') || 0,
      userId: req.user?.id || null,
    };

    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error('Request completed with server error', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Request completed with client error', logData);
    } else if (duration > 1000) {
      logger.warn('Slow request detected', { ...logData, threshold: '1000ms' });
    } else {
      logger.info('Request completed', logData);
    }

    // Emit metrics (can be used by monitoring middleware)
    if (req.emit) {
      req.emit('request-complete', {
        ...logData,
        hrDuration,
      });
    }

    return originalEnd.apply(res, args);
  };

  // Run in async context for propagation
  requestContext.run(context, () => {
    next();
  });
};

/**
 * Update user context after authentication
 * Call this middleware after auth middleware
 */
const updateUserContext = (req, res, next) => {
  if (req.user) {
    const context = getRequestContext();
    if (context) {
      context.userId = req.user.id || req.user._id;
      context.userEmail = req.user.email;
      context.userRole = req.user.role;
    }
    
    // Update logger context
    if (req.log) {
      req.log = req.log.child({
        userId: req.user.id || req.user._id,
        userRole: req.user.role,
      });
    }
  }
  next();
};

/**
 * Performance metrics middleware
 * Collects and reports performance data
 */
const performanceMetricsMiddleware = (options = {}) => {
  const {
    slowThreshold = 1000, // 1 second
    verySlowThreshold = 5000, // 5 seconds
    collectMemory = true,
    collectCpu = false,
  } = options;

  return (req, res, next) => {
    const startTime = Date.now();
    const startMemory = collectMemory ? process.memoryUsage() : null;
    const startCpu = collectCpu ? process.cpuUsage() : null;

    // Track when response finishes
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      const metrics = {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        contentLength: parseInt(res.get('Content-Length') || '0', 10),
      };

      // Add memory usage if enabled
      if (collectMemory && startMemory) {
        const endMemory = process.memoryUsage();
        metrics.memory = {
          heapUsedDelta: endMemory.heapUsed - startMemory.heapUsed,
          heapTotalDelta: endMemory.heapTotal - startMemory.heapTotal,
          externalDelta: endMemory.external - startMemory.external,
        };
      }

      // Add CPU usage if enabled
      if (collectCpu && startCpu) {
        const endCpu = process.cpuUsage(startCpu);
        metrics.cpu = {
          user: endCpu.user,
          system: endCpu.system,
        };
      }

      // Log slow requests
      if (duration >= verySlowThreshold) {
        logger.error('Very slow request', metrics);
      } else if (duration >= slowThreshold) {
        logger.warn('Slow request', metrics);
      }

      // Log performance metric
      logger.logPerformance(`${req.method} ${req.path}`, duration, {
        statusCode: res.statusCode,
        contentLength: metrics.contentLength,
      });
    });

    next();
  };
};

/**
 * Request correlation middleware
 * Links related requests (e.g., parent/child requests)
 */
const correlationMiddleware = (req, res, next) => {
  // Get correlation ID from header or create new
  const correlationId = req.headers['x-correlation-id'] || req.requestId;
  const parentRequestId = req.headers['x-parent-request-id'] || null;

  req.correlationId = correlationId;
  req.parentRequestId = parentRequestId;

  // Set response headers for tracing
  res.setHeader('X-Correlation-Id', correlationId);

  // Update context
  const context = getRequestContext();
  if (context) {
    context.correlationId = correlationId;
    context.parentRequestId = parentRequestId;
  }

  next();
};

/**
 * Create headers for outgoing requests (to propagate context)
 * @param {Object} req - Express request object
 * @returns {Object} Headers to include in outgoing requests
 */
const getOutgoingHeaders = (req) => {
  return {
    'X-Request-Id': uuidv4(), // New ID for outgoing request
    'X-Correlation-Id': req.correlationId || req.requestId,
    'X-Parent-Request-Id': req.requestId,
  };
};

module.exports = {
  requestContextMiddleware,
  updateUserContext,
  performanceMetricsMiddleware,
  correlationMiddleware,
  getRequestContext,
  getRequestId,
  getOutgoingHeaders,
  requestContext,
};

