// ==========================================
// MONITORING MIDDLEWARE
// ==========================================
// Enhanced monitoring for production launch
// Tracks performance, errors, and system health
// ==========================================

const logger = require('../utils/logger');

/**
 * System health monitoring middleware
 * Tracks memory usage, response times, and error rates
 */
const monitoringMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();

  // Track request
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.requestId = requestId;

  // Override res.end to capture metrics
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const responseTime = Date.now() - startTime;
    const endMemory = process.memoryUsage();
    const memoryDelta = {
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      external: endMemory.external - startMemory.external,
      rss: endMemory.rss - startMemory.rss
    };

    // Log performance metrics
    logger.logPerformance('REQUEST_METRICS', responseTime, {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      memoryDelta: {
        heapUsedMB: (memoryDelta.heapUsed / 1024 / 1024).toFixed(2),
        rssMB: (memoryDelta.rss / 1024 / 1024).toFixed(2)
      },
      currentMemory: {
        heapUsedMB: (endMemory.heapUsed / 1024 / 1024).toFixed(2),
        heapTotalMB: (endMemory.heapTotal / 1024 / 1024).toFixed(2),
        rssMB: (endMemory.rss / 1024 / 1024).toFixed(2)
      }
    });

    // Alert on high memory usage
    const heapUsedMB = endMemory.heapUsed / 1024 / 1024;
    if (heapUsedMB > 500) {
      logger.warn('High Memory Usage Detected', {
        requestId,
        heapUsedMB: heapUsedMB.toFixed(2),
        threshold: '500MB',
        path: req.path
      });
    }

    // Alert on slow requests
    if (responseTime > 2000) {
      logger.warn('Very Slow Request Detected', {
        requestId,
        responseTime: `${responseTime}ms`,
        threshold: '2000ms',
        path: req.path,
        method: req.method
      });
    }

    // Track error rates
    if (res.statusCode >= 500) {
      logger.error('Server Error Occurred', {
        requestId,
        statusCode: res.statusCode,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    }

    originalEnd.apply(res, arguments);
  };

  next();
};

/**
 * Database query monitoring
 * Tracks database operation performance
 */
const dbMonitoringMiddleware = (req, res, next) => {
  // This will be used by database operations
  req.dbStartTime = Date.now();
  next();
};

/**
 * Admin action monitoring
 * Tracks all admin operations for audit trail
 */
const adminMonitoringMiddleware = (req, res, next) => {
  // Only track admin routes
  if (!req.path.startsWith('/api/v1/admin')) {
    return next();
  }

  const adminAction = {
    userId: req.user?.id || req.user?._id || 'unknown',
    userEmail: req.user?.email || 'unknown',
    action: `${req.method} ${req.path}`,
    ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
    timestamp: new Date().toISOString(),
    body: req.method !== 'GET' ? (req.body ? '***' : null) : null
  };

  // Log admin action
  logger.info('Admin Action', adminAction);

  // Override res.json to log action result
  const originalJson = res.json;
  res.json = function (data) {
    if (res.statusCode >= 400) {
      logger.warn('Admin Action Failed', {
        ...adminAction,
        statusCode: res.statusCode,
        error: data?.error || data?.message
      });
    } else {
      logger.info('Admin Action Success', {
        ...adminAction,
        statusCode: res.statusCode
      });
    }

    return originalJson.apply(res, arguments);
  };

  next();
};

/**
 * System health check middleware
 * Provides detailed system metrics
 */
const healthCheckMiddleware = (req, res, next) => {
  if (req.path !== '/health' && req.path !== '/health/detailed') {
    return next();
  }

  const healthData = {
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
      external: Math.round(process.memoryUsage().external / 1024 / 1024) + ' MB'
    },
    cpu: process.cpuUsage(),
    nodeVersion: process.version,
    platform: process.platform,
    environment: process.env.NODE_ENV || 'development'
  };

  // Log health check
  logger.info('Health Check', healthData);

  // Add health data to response
  if (req.path === '/health/detailed') {
    req.healthData = healthData;
  }

  next();
};

module.exports = {
  monitoringMiddleware,
  dbMonitoringMiddleware,
  adminMonitoringMiddleware,
  healthCheckMiddleware
};

