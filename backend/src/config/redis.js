/**
 * Redis Configuration
 * Handles Redis connection and caching operations
 */

const Redis = require('ioredis');

let redisClient = null;

/**
 * Create Redis client
 */
function createRedisClient() {
  if (!process.env.REDIS_URL) {
    console.warn('⚠️ Redis URL not configured. Caching will be disabled.');
    return null;
  }

  try {
    const client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 0, // Don't retry on connection errors
      retryStrategy: (times) => {
        if (times > 3) {
          // Stop retrying after 3 attempts
          console.warn('⚠️ Redis connection failed after 3 attempts. Caching will be disabled.');
          return null;
        }
        const delay = Math.min(times * 100, 1000);
        return delay;
      },
      enableReadyCheck: false, // Disable ready check to avoid repeated attempts
      lazyConnect: true,
      connectTimeout: 5000, // 5 second connection timeout
      keepAlive: 30000,
    });

    let hasConnected = false;

    client.on('connect', () => {
      if (!hasConnected) {
        console.log('✅ Redis connected successfully');
        hasConnected = true;
      }
    });

    client.on('error', (err) => {
      // Only log first error to avoid spam
      if (!hasConnected) {
        console.warn('⚠️ Redis connection error. Caching will be disabled.');
        hasConnected = true; // Prevent repeated warnings
      }
    });

    client.on('close', () => {
      // Silent close - don't spam logs
    });

    return client;
  } catch (error) {
    console.warn('⚠️ Failed to create Redis client. Caching will be disabled.');
    return null;
  }
}

/**
 * Get Redis client (singleton)
 */
function getRedisClient() {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
}

/**
 * Set value in cache with expiration
 */
async function setCache(key, value, ttl = 3600) {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const serialized = JSON.stringify(value);
    await client.setex(key, ttl, serialized);
    return true;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
}

/**
 * Get value from cache
 */
async function getCache(key) {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const value = await client.get(key);
    if (!value) return null;
    return JSON.parse(value);
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

/**
 * Delete value from cache
 */
async function deleteCache(key) {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Redis delete error:', error);
    return false;
  }
}

/**
 * Delete multiple keys from cache (pattern)
 */
async function deleteCachePattern(pattern) {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
    return true;
  } catch (error) {
    console.error('Redis delete pattern error:', error);
    return false;
  }
}

/**
 * Increment counter in cache
 */
async function incrementCache(key, by = 1) {
  const client = getRedisClient();
  if (!client) return 0;

  try {
    return await client.incrby(key, by);
  } catch (error) {
    console.error('Redis increment error:', error);
    return 0;
  }
}

/**
 * Check if key exists
 */
async function existsCache(key) {
  const client = getRedisClient();
  if (!client) return false;

  try {
    return await client.exists(key) === 1;
  } catch (error) {
    console.error('Redis exists error:', error);
    return false;
  }
}

/**
 * Set value only if key doesn't exist
 */
async function setCacheIfNotExists(key, value, ttl = 3600) {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const serialized = JSON.stringify(value);
    const result = await client.set(key, serialized, 'NX', 'EX', ttl);
    return result === 'OK';
  } catch (error) {
    console.error('Redis setnx error:', error);
    return false;
  }
}

/**
 * Close Redis connection
 */
async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

module.exports = {
  getRedisClient,
  setCache,
  getCache,
  deleteCache,
  deleteCachePattern,
  incrementCache,
  existsCache,
  setCacheIfNotExists,
  closeRedis
};
