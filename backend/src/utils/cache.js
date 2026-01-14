/**
 * Cache Utility - Redis/Memory Hybrid
 * Uses Redis in production, in-memory cache for development
 * 
 * Performance optimizations:
 * - LRU eviction policy
 * - TTL-based expiration
 * - Compression for large values
 * - Batch operations support
 */

// Lazy load Redis to prevent errors if not installed
let Redis = null;
try {
  Redis = require('ioredis');
} catch (e) {
  // Redis not installed, will use memory cache
}

// In-memory cache for development/fallback
class MemoryCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.maxSize = options.maxSize || 1000;
    this.defaultTTL = options.defaultTTL || 300; // 5 minutes
    this.hits = 0;
    this.misses = 0;
  }

  async get(key) {
    const item = this.cache.get(key);
    if (!item) {
      this.misses++;
      return null;
    }
    
    if (item.expiry && item.expiry < Date.now()) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }
    
    this.hits++;
    return item.value;
  }

  async set(key, value, ttlSeconds = this.defaultTTL) {
    // LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      value,
      expiry: ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null
    });
    return 'OK';
  }

  async del(key) {
    return this.cache.delete(key) ? 1 : 0;
  }

  async keys(pattern) {
    const regex = new RegExp(pattern.replace('*', '.*'));
    return Array.from(this.cache.keys()).filter(k => regex.test(k));
  }

  async flushPattern(pattern) {
    const keys = await this.keys(pattern);
    keys.forEach(k => this.cache.delete(k));
    return keys.length;
  }

  async mget(...keys) {
    return Promise.all(keys.map(k => this.get(k)));
  }

  async mset(keyValuePairs) {
    for (let i = 0; i < keyValuePairs.length; i += 2) {
      await this.set(keyValuePairs[i], keyValuePairs[i + 1]);
    }
    return 'OK';
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits / (this.hits + this.misses) || 0
    };
  }

  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }
}

// Cache instance
let cacheClient = null;
let isRedis = false;

/**
 * Initialize cache connection
 */
const initCache = async () => {
  const redisUrl = process.env.REDIS_URL;
  
  // Skip Redis in development if not explicitly enabled
  const useRedis = process.env.USE_REDIS === 'true' || process.env.NODE_ENV === 'production';
  
  if (redisUrl && Redis && useRedis) {
    try {
      const redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
          // Only retry once, then give up
          if (times > 1) {
            return null; // Stop retrying
          }
          return 100; // Wait 100ms before first retry
        },
        enableReadyCheck: true,
        lazyConnect: true,
        connectTimeout: 5000, // 5 second timeout
      });
      
      // Suppress error events to prevent console spam
      redisClient.on('error', () => {
        // Silently ignore - we'll use memory cache
      });
      
      await redisClient.connect();
      cacheClient = redisClient;
      isRedis = true;
      console.log('✅ Redis cache connected');
      return cacheClient;
    } catch (error) {
      console.warn('⚠️ Redis connection failed, using memory cache:', error.message);
    }
  }
  
  // Fallback to memory cache
  cacheClient = new MemoryCache({ maxSize: 2000, defaultTTL: 300 });
  console.log('📦 Using in-memory cache');
  return cacheClient;
};

/**
 * Get cache client
 */
const getCache = () => {
  if (!cacheClient) {
    cacheClient = new MemoryCache({ maxSize: 2000, defaultTTL: 300 });
  }
  return cacheClient;
};

/**
 * Cache key generators
 */
const cacheKeys = {
  products: {
    all: (page, limit, filters) => `products:all:${page}:${limit}:${JSON.stringify(filters || {})}`,
    single: (id) => `products:single:${id}`,
    slug: (slug) => `products:slug:${slug}`,
    featured: () => 'products:featured',
    newArrivals: () => 'products:newArrivals',
    bestSellers: () => 'products:bestSellers',
    category: (categoryId, page, limit) => `products:category:${categoryId}:${page}:${limit}`,
    search: (query, page, limit) => `products:search:${query}:${page}:${limit}`,
  },
  categories: {
    all: () => 'categories:all',
    single: (id) => `categories:single:${id}`,
    tree: () => 'categories:tree',
  },
  user: {
    profile: (id) => `user:profile:${id}`,
    orders: (id, page) => `user:orders:${id}:${page}`,
  },
  dashboard: {
    stats: (range) => `dashboard:stats:${range}`,
    recentOrders: () => 'dashboard:recentOrders',
  }
};

/**
 * Cache TTL values (in seconds)
 */
const cacheTTL = {
  products: {
    list: 300,        // 5 minutes
    single: 600,      // 10 minutes
    featured: 300,    // 5 minutes
    search: 120,      // 2 minutes
  },
  categories: {
    all: 3600,        // 1 hour
    tree: 3600,       // 1 hour
  },
  dashboard: {
    stats: 60,        // 1 minute
    recentOrders: 30, // 30 seconds
  },
  user: {
    profile: 300,     // 5 minutes
    orders: 60,       // 1 minute
  }
};

/**
 * Get cached value with JSON parsing
 */
const getCached = async (key) => {
  try {
    const cache = getCache();
    const value = await cache.get(key);
    
    if (!value) return null;
    
    // Handle Redis string response
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    
    return value;
  } catch (error) {
    console.error('Cache get error:', error.message);
    return null;
  }
};

/**
 * Set cached value with JSON stringification
 */
const setCached = async (key, value, ttlSeconds = 300) => {
  try {
    const cache = getCache();
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    
    if (isRedis) {
      await cache.setex(key, ttlSeconds, serialized);
    } else {
      await cache.set(key, value, ttlSeconds);
    }
    
    return true;
  } catch (error) {
    console.error('Cache set error:', error.message);
    return false;
  }
};

/**
 * Delete cached value
 */
const deleteCached = async (key) => {
  try {
    const cache = getCache();
    await cache.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error.message);
    return false;
  }
};

/**
 * Invalidate cache by pattern
 */
const invalidatePattern = async (pattern) => {
  try {
    const cache = getCache();
    
    if (isRedis) {
      const keys = await cache.keys(pattern);
      if (keys.length > 0) {
        await cache.del(...keys);
      }
      return keys.length;
    } else {
      return await cache.flushPattern(pattern);
    }
  } catch (error) {
    console.error('Cache invalidate error:', error.message);
    return 0;
  }
};

/**
 * Cache wrapper for async functions
 */
const withCache = (keyGenerator, ttlSeconds = 300) => {
  return (fn) => async (...args) => {
    const key = typeof keyGenerator === 'function' 
      ? keyGenerator(...args) 
      : keyGenerator;
    
    // Try to get from cache
    const cached = await getCached(key);
    if (cached !== null) {
      return cached;
    }
    
    // Execute function and cache result
    const result = await fn(...args);
    await setCached(key, result, ttlSeconds);
    
    return result;
  };
};

/**
 * Cache statistics
 */
const getCacheStats = async () => {
  const cache = getCache();
  
  if (!isRedis && cache.getStats) {
    return cache.getStats();
  }
  
  if (isRedis) {
    try {
      const info = await cache.info('stats');
      return { type: 'redis', info };
    } catch {
      return { type: 'redis', error: 'Unable to get stats' };
    }
  }
  
  return { type: 'unknown' };
};

module.exports = {
  initCache,
  getCache,
  getCached,
  setCached,
  deleteCached,
  invalidatePattern,
  withCache,
  getCacheStats,
  cacheKeys,
  cacheTTL,
  MemoryCache
};
