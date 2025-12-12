/**
 * Health Check Routes
 * Provides comprehensive health monitoring endpoints
 * 
 * Endpoints:
 * - GET /health - Quick health check
 * - GET /health/detailed - Detailed health with all services
 * - GET /health/ready - Readiness probe for k8s
 * - GET /health/live - Liveness probe for k8s
 */

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const logger = require('../utils/logger');
const { circuitBreakerManager } = require('../utils/circuitBreaker');

// Version info
const packageJson = require('../../package.json');

/**
 * Check MongoDB connection
 * @returns {Object} MongoDB health status
 */
const checkMongoDB = async () => {
  try {
    const startTime = Date.now();
    
    if (mongoose.connection.readyState !== 1) {
      return {
        status: 'unhealthy',
        message: 'MongoDB not connected',
        readyState: mongoose.connection.readyState,
      };
    }

    // Ping the database
    await mongoose.connection.db.admin().ping();
    const latency = Date.now() - startTime;

    return {
      status: 'healthy',
      latency: `${latency}ms`,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      database: mongoose.connection.name,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: error.message,
      readyState: mongoose.connection.readyState,
    };
  }
};

/**
 * Check Redis connection (if configured)
 * @returns {Object} Redis health status
 */
const checkRedis = async () => {
  if (!process.env.REDIS_URL) {
    return {
      status: 'not_configured',
      message: 'Redis not configured',
    };
  }

  try {
    // Import redis client if available
    const { rateLimiterService } = require('../services/rateLimiterService');
    const status = rateLimiterService.getStatus();
    
    return {
      status: status.type === 'redis' ? 'healthy' : 'degraded',
      type: status.type,
      configured: status.configured,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: error.message,
    };
  }
};

/**
 * Check external services via circuit breakers
 * @returns {Object} External services health status
 */
const checkExternalServices = () => {
  const breakerStatus = circuitBreakerManager.getAllStatus();
  const services = {};

  Object.entries(breakerStatus).forEach(([name, status]) => {
    services[name] = {
      status: status.state === 'CLOSED' ? 'healthy' : 
              status.state === 'HALF-OPEN' ? 'recovering' : 'unhealthy',
      circuitState: status.state,
      failures: status.failures,
      lastFailure: status.lastFailure,
      stats: {
        total: status.stats.totalRequests,
        success: status.stats.successfulRequests,
        failed: status.stats.failedRequests,
        rejected: status.stats.rejectedRequests,
      },
    };
  });

  return services;
};

/**
 * Get system metrics
 * @returns {Object} System metrics
 */
const getSystemMetrics = () => {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();

  return {
    uptime: {
      seconds: Math.floor(uptime),
      formatted: formatUptime(uptime),
    },
    memory: {
      heapUsed: formatBytes(memoryUsage.heapUsed),
      heapTotal: formatBytes(memoryUsage.heapTotal),
      external: formatBytes(memoryUsage.external),
      rss: formatBytes(memoryUsage.rss),
      heapUsedPercent: ((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(1) + '%',
    },
    process: {
      pid: process.pid,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    },
  };
};

/**
 * Format bytes to human readable
 * @param {number} bytes - Bytes to format
 * @returns {string} Formatted string
 */
const formatBytes = (bytes) => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(2)} ${units[unitIndex]}`;
};

/**
 * Format uptime to human readable
 * @param {number} seconds - Uptime in seconds
 * @returns {string} Formatted string
 */
const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
};

/**
 * GET /health
 * Quick health check - minimal overhead
 */
router.get('/', async (req, res) => {
  try {
    const mongoStatus = await checkMongoDB();
    const isHealthy = mongoStatus.status === 'healthy';

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: packageJson.version,
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

/**
 * GET /health/detailed
 * Comprehensive health check with all services
 */
router.get('/detailed', async (req, res) => {
  try {
    const [mongoStatus, redisStatus] = await Promise.all([
      checkMongoDB(),
      checkRedis(),
    ]);

    const externalServices = checkExternalServices();
    const systemMetrics = getSystemMetrics();

    // Determine overall health
    const criticalServices = [mongoStatus];
    const isHealthy = criticalServices.every(s => s.status === 'healthy');
    const isDegraded = !isHealthy && criticalServices.some(s => s.status === 'healthy');

    const overallStatus = isHealthy ? 'healthy' : isDegraded ? 'degraded' : 'unhealthy';

    res.status(overallStatus === 'healthy' ? 200 : 503).json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: packageJson.version,
      environment: process.env.NODE_ENV || 'development',
      services: {
        mongodb: mongoStatus,
        redis: redisStatus,
        ...externalServices,
      },
      system: systemMetrics,
    });
  } catch (error) {
    logger.error('Detailed health check failed', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

/**
 * GET /health/ready
 * Readiness probe - is the app ready to receive traffic?
 */
router.get('/ready', async (req, res) => {
  try {
    const mongoStatus = await checkMongoDB();
    const isReady = mongoStatus.status === 'healthy';

    if (isReady) {
      res.status(200).json({
        ready: true,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        ready: false,
        timestamp: new Date().toISOString(),
        reason: 'Database not ready',
        details: mongoStatus,
      });
    }
  } catch (error) {
    res.status(503).json({
      ready: false,
      timestamp: new Date().toISOString(),
      reason: error.message,
    });
  }
});

/**
 * GET /health/live
 * Liveness probe - is the app still running?
 */
router.get('/live', (req, res) => {
  // If we can respond, we're alive
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

/**
 * GET /health/metrics
 * Prometheus-style metrics (optional)
 */
router.get('/metrics', async (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    // Simple Prometheus-compatible format
    let metrics = '';
    
    // Process metrics
    metrics += `# HELP process_uptime_seconds The uptime of the process in seconds\n`;
    metrics += `# TYPE process_uptime_seconds gauge\n`;
    metrics += `process_uptime_seconds ${uptime}\n\n`;

    metrics += `# HELP process_heap_bytes The heap memory usage in bytes\n`;
    metrics += `# TYPE process_heap_bytes gauge\n`;
    metrics += `process_heap_bytes{type="used"} ${memoryUsage.heapUsed}\n`;
    metrics += `process_heap_bytes{type="total"} ${memoryUsage.heapTotal}\n\n`;

    metrics += `# HELP process_memory_bytes The memory usage in bytes\n`;
    metrics += `# TYPE process_memory_bytes gauge\n`;
    metrics += `process_memory_bytes{type="rss"} ${memoryUsage.rss}\n`;
    metrics += `process_memory_bytes{type="external"} ${memoryUsage.external}\n\n`;

    // Circuit breaker metrics
    const breakerStatus = circuitBreakerManager.getAllStatus();
    metrics += `# HELP circuit_breaker_state The state of circuit breakers (0=closed, 1=half-open, 2=open)\n`;
    metrics += `# TYPE circuit_breaker_state gauge\n`;
    
    Object.entries(breakerStatus).forEach(([name, status]) => {
      const stateValue = status.state === 'CLOSED' ? 0 : status.state === 'HALF-OPEN' ? 1 : 2;
      metrics += `circuit_breaker_state{name="${name}"} ${stateValue}\n`;
    });

    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(metrics);
  } catch (error) {
    logger.error('Metrics endpoint failed', { error: error.message });
    res.status(500).send('# Error generating metrics\n');
  }
});

module.exports = router;
