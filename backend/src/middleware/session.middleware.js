/**
 * Session Caching Middleware
 * Caches user sessions in Redis for faster authentication
 */

const { getCache, setCache, deleteCache } = require('../config/redis');

/**
 * Cache user session data
 */
async function cacheSession(userId, sessionData, ttl = 3600) {
  const key = `session:${userId}`;
  return await setCache(key, sessionData, ttl);
}

/**
 * Get cached user session
 */
async function getCachedSession(userId) {
  const key = `session:${userId}`;
  return await getCache(key);
}

/**
 * Invalidate user session cache
 */
async function invalidateSessionCache(userId) {
  const key = `session:${userId}`;
  return await deleteCache(key);
}

/**
 * Session caching middleware
 * Caches user data after successful authentication
 */
const sessionCacheMiddleware = (req, res, next) => {
  // Store original json method
  const originalJson = res.json.bind(res);

  res.json = async (data) => {
    // Cache session data after successful auth
    if (req.path.includes('/auth/login') || req.path.includes('/auth/me')) {
      if (res.statusCode >= 200 && res.statusCode < 300 && data.user) {
        const userId = data.user._id || data.user.id;
        await cacheSession(userId, data.user, 3600); // 1 hour
      }
    }

    return originalJson(data);
  };

  next();
};

module.exports = {
  cacheSession,
  getCachedSession,
  invalidateSessionCache,
  sessionCacheMiddleware
};
