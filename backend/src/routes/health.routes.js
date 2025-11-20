/**
 * Health Check Routes
 * Comprehensive health check endpoints for monitoring and load balancers
 */

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// ============================================
// BASIC HEALTH CHECK
// ============================================

/**
 * GET /api/health
 * Basic health check endpoint
 * Used by load balancers and monitoring tools
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// ============================================
// DETAILED HEALTH CHECK
// ============================================

/**
 * GET /api/health/detailed
 * Detailed health check with system metrics
 * Includes database, memory, and service status
 */
router.get('/detailed', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {},
    system: {}
  };

  // Database Health Check
  try {
    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    health.services.database = {
      status: dbState === 1 ? 'healthy' : 'unhealthy',
      state: dbStates[dbState] || 'unknown',
      host: mongoose.connection.host || 'unknown',
      name: mongoose.connection.name || 'unknown'
    };

    // Test database query
    if (dbState === 1) {
      const startTime = Date.now();
      await mongoose.connection.db.admin().ping();
      health.services.database.responseTime = Date.now() - startTime;
    }
  } catch (error) {
    health.services.database = {
      status: 'unhealthy',
      error: error.message
    };
    health.status = 'degraded';
  }

  // Memory Usage
  const memoryUsage = process.memoryUsage();
  health.system.memory = {
    used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
    total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
    external: Math.round(memoryUsage.external / 1024 / 1024), // MB
    rss: Math.round(memoryUsage.rss / 1024 / 1024) // MB
  };

  // CPU Usage
  const cpuUsage = process.cpuUsage();
  health.system.cpu = {
    user: cpuUsage.user,
    system: cpuUsage.system
  };

  // Environment Variables Check
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ];

  health.services.environment = {
    status: 'healthy',
    missing: []
  };

  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      health.services.environment.missing.push(varName);
      health.services.environment.status = 'unhealthy';
      health.status = 'unhealthy';
    }
  });

  // External Services Check
  health.services.external = {
    cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? 'configured' : 'not configured',
    email: process.env.EMAIL_HOST ? 'configured' : 'not configured',
    whatsapp: process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'not configured'
  };

  // Determine overall status
  const hasUnhealthyServices = Object.values(health.services).some(
    service => service.status === 'unhealthy'
  );

  if (hasUnhealthyServices && health.status !== 'unhealthy') {
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 
                     health.status === 'degraded' ? 200 : 503;

  res.status(statusCode).json(health);
});

// ============================================
// READINESS CHECK
// ============================================

/**
 * GET /api/health/ready
 * Readiness probe for Kubernetes/Docker
 * Returns 200 only if service is ready to accept traffic
 */
router.get('/ready', async (req, res) => {
  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'not ready',
        reason: 'Database not connected',
        timestamp: new Date().toISOString()
      });
    }

    // Check required environment variables
    const required = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      return res.status(503).json({
        status: 'not ready',
        reason: 'Missing required environment variables',
        missing,
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      reason: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================
// LIVENESS CHECK
// ============================================

/**
 * GET /api/health/live
 * Liveness probe for Kubernetes/Docker
 * Returns 200 if service is alive (even if degraded)
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============================================
// METRICS ENDPOINT
// ============================================

/**
 * GET /api/health/metrics
 * Prometheus-style metrics endpoint
 * Returns metrics in Prometheus format
 */
router.get('/metrics', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();

  const metrics = [
    `# HELP nodejs_heap_size_total_bytes Process heap size from Node.js`,
    `# TYPE nodejs_heap_size_total_bytes gauge`,
    `nodejs_heap_size_total_bytes ${memoryUsage.heapTotal}`,
    ``,
    `# HELP nodejs_heap_size_used_bytes Process heap size used from Node.js`,
    `# TYPE nodejs_heap_size_used_bytes gauge`,
    `nodejs_heap_size_used_bytes ${memoryUsage.heapUsed}`,
    ``,
    `# HELP nodejs_external_memory_bytes Node.js external memory size`,
    `# TYPE nodejs_external_memory_bytes gauge`,
    `nodejs_external_memory_bytes ${memoryUsage.external}`,
    ``,
    `# HELP nodejs_rss_memory_bytes Node.js RSS memory size`,
    `# TYPE nodejs_rss_memory_bytes gauge`,
    `nodejs_rss_memory_bytes ${memoryUsage.rss}`,
    ``,
    `# HELP nodejs_uptime_seconds Node.js process uptime in seconds`,
    `# TYPE nodejs_uptime_seconds gauge`,
    `nodejs_uptime_seconds ${uptime}`,
    ``,
    `# HELP nodejs_db_connection_state MongoDB connection state (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)`,
    `# TYPE nodejs_db_connection_state gauge`,
    `nodejs_db_connection_state ${mongoose.connection.readyState}`
  ].join('\n');

  res.set('Content-Type', 'text/plain');
  res.status(200).send(metrics);
});

module.exports = router;

