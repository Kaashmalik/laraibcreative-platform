/**
 * Performance Monitoring Utilities
 * Tracks API response times, database queries, and system metrics
 */

const logger = require('./logger');

// Performance metrics storage
const metrics = {
  requests: {
    total: 0,
    success: 0,
    error: 0,
    avgResponseTime: 0,
    p95ResponseTime: 0,
    p99ResponseTime: 0,
  },
  database: {
    queries: 0,
    avgQueryTime: 0,
    slowQueries: 0,
  },
  memory: {
    used: 0,
    peak: 0,
  },
  responseTimes: []
};

/**
 * Record request metrics
 */
function recordRequest(duration, success = true) {
  metrics.requests.total++;
  if (success) {
    metrics.requests.success++;
  } else {
    metrics.requests.error++;
  }

  // Store response time for percentile calculation
  metrics.responseTimes.push(duration);

  // Keep only last 1000 response times
  if (metrics.responseTimes.length > 1000) {
    metrics.responseTimes.shift();
  }

  // Update average response time
  metrics.requests.avgResponseTime = calculateAverage(metrics.responseTimes);

  // Update percentiles
  const sorted = [...metrics.responseTimes].sort((a, b) => a - b);
  metrics.requests.p95ResponseTime = sorted[Math.floor(sorted.length * 0.95)] || 0;
  metrics.requests.p99ResponseTime = sorted[Math.floor(sorted.length * 0.99)] || 0;

  // Log slow requests
  if (duration > 3000) {
    logger.warn('Slow request detected', {
      duration,
      threshold: 3000,
    });
  }
}

/**
 * Record database query metrics
 */
function recordDatabaseQuery(duration) {
  metrics.database.queries++;
  metrics.database.avgQueryTime = calculateAverage([metrics.database.avgQueryTime, duration]);

  if (duration > 1000) {
    metrics.database.slowQueries++;
    logger.warn('Slow database query detected', {
      duration,
      threshold: 1000,
    });
  }
}

/**
 * Record memory usage
 */
function recordMemoryUsage() {
  const used = process.memoryUsage();
  metrics.memory.used = used.heapUsed / 1024 / 1024; // MB

  if (used.heapUsed > metrics.memory.peak) {
    metrics.memory.peak = used.heapUsed / 1024 / 1024; // MB
  }
}

/**
 * Calculate average of array
 */
function calculateAverage(arr) {
  if (arr.length === 0) return 0;
  const sum = arr.reduce((acc, val) => acc + val, 0);
  return sum / arr.length;
}

/**
 * Get current metrics
 */
function getMetrics() {
  return {
    ...metrics,
    memory: {
      ...metrics.memory,
      rss: process.memoryUsage().rss / 1024 / 1024, // MB
      heapTotal: process.memoryUsage().heapTotal / 1024 / 1024, // MB
      external: process.memoryUsage().external / 1024 / 1024, // MB
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Reset metrics
 */
function resetMetrics() {
  metrics.requests.total = 0;
  metrics.requests.success = 0;
  metrics.requests.error = 0;
  metrics.requests.avgResponseTime = 0;
  metrics.requests.p95ResponseTime = 0;
  metrics.requests.p99ResponseTime = 0;
  metrics.responseTimes = [];
  metrics.database.queries = 0;
  metrics.database.avgQueryTime = 0;
  metrics.database.slowQueries = 0;
  metrics.memory.used = 0;
  metrics.memory.peak = 0;
}

/**
 * Performance monitoring middleware
 */
const performanceMiddleware = (options = {}) => {
  const {
    slowThreshold = 1000, // 1 second
    verySlowThreshold = 3000, // 3 seconds
    collectMemory = false,
  } = options;

  return (req, res, next) => {
    const startTime = Date.now();

    // Record memory if enabled
    if (collectMemory) {
      recordMemoryUsage();
    }

    // Store original end method
    const originalEnd = res.end.bind(res);

    // Override end method to capture metrics
    res.end = function (...args) {
      const duration = Date.now() - startTime;

      // Record request metrics
      const success = res.statusCode >= 200 && res.statusCode < 400;
      recordRequest(duration, success);

      // Add performance headers
      res.setHeader('X-Response-Time', `${duration}ms`);
      res.setHeader('X-Process-Time', `${process.uptime()}s`);

      // Log performance
      if (duration > verySlowThreshold) {
        logger.error('Very slow request', {
          method: req.method,
          path: req.path,
          duration,
          statusCode: res.statusCode,
        });
      } else if (duration > slowThreshold) {
        logger.warn('Slow request', {
          method: req.method,
          path: req.path,
          duration,
          statusCode: res.statusCode,
        });
      }

      return originalEnd(...args);
    };

    next();
  };
};

/**
 * Database query performance wrapper
 */
function trackQuery(queryFn, queryName = 'unknown') {
  return async (...args) => {
    const startTime = Date.now();
    try {
      const result = await queryFn(...args);
      const duration = Date.now() - startTime;
      recordDatabaseQuery(duration);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      recordDatabaseQuery(duration);
      throw error;
    }
  };
}

/**
 * Health check metrics
 */
function getHealthMetrics() {
  const metricsData = getMetrics();
  const isHealthy = metricsData.requests.error < metricsData.requests.total * 0.05; // Less than 5% error rate

  return {
    status: isHealthy ? 'healthy' : 'degraded',
    metrics: metricsData,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  recordRequest,
  recordDatabaseQuery,
  recordMemoryUsage,
  getMetrics,
  resetMetrics,
  performanceMiddleware,
  trackQuery,
  getHealthMetrics
};
