/**
 * Rate Limiter Service
 * 
 * Production-ready rate limiting with Redis support and fallback to in-memory
 * Supports different rate limit strategies for various endpoints
 * 
 * @module services/rateLimiterService
 */

/**
 * Rate limit configuration
 */
const RATE_LIMIT_CONFIGS = {
  // AI endpoints - stricter limits
  ai: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    keyPrefix: 'rl:ai:'
  },
  // API general - standard limits
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    keyPrefix: 'rl:api:'
  },
  // Auth endpoints - prevent brute force
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyPrefix: 'rl:auth:'
  },
  // Upload endpoints - prevent abuse
  upload: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    keyPrefix: 'rl:upload:'
  },
  // Contact/support - prevent spam
  contact: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    keyPrefix: 'rl:contact:'
  }
};

/**
 * In-Memory Rate Limiter Store
 * Used as fallback when Redis is not available
 */
class InMemoryStore {
  constructor() {
    this.store = new Map();
    this.cleanupInterval = null;
    
    // Clean up expired entries every minute
    this.startCleanup();
  }
  
  /**
   * Get rate limit data for a key
   * @param {string} key - Rate limit key
   * @returns {Promise<{count: number, resetAt: number} | null>}
   */
  async get(key) {
    const data = this.store.get(key);
    if (!data) return null;
    
    // Check if expired
    if (Date.now() > data.resetAt) {
      this.store.delete(key);
      return null;
    }
    
    return data;
  }
  
  /**
   * Increment rate limit counter
   * @param {string} key - Rate limit key
   * @param {number} windowMs - Window in milliseconds
   * @returns {Promise<{count: number, resetAt: number}>}
   */
  async increment(key, windowMs) {
    let data = this.store.get(key);
    const now = Date.now();
    
    if (!data || now > data.resetAt) {
      // Create new window
      data = {
        count: 1,
        resetAt: now + windowMs
      };
    } else {
      // Increment existing
      data.count++;
    }
    
    this.store.set(key, data);
    return data;
  }
  
  /**
   * Reset rate limit for a key
   * @param {string} key - Rate limit key
   */
  async reset(key) {
    this.store.delete(key);
  }
  
  /**
   * Start cleanup interval
   */
  startCleanup() {
    if (this.cleanupInterval) return;
    
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.store.entries()) {
        if (now > data.resetAt) {
          this.store.delete(key);
        }
      }
    }, 60000); // Clean every minute
    
    // Don't prevent process exit
    this.cleanupInterval.unref();
  }
  
  /**
   * Stop cleanup and clear store
   */
  shutdown() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
  
  /**
   * Get store size for monitoring
   */
  getSize() {
    return this.store.size;
  }
}

/**
 * Redis Rate Limiter Store
 * Used when Redis is configured
 */
class RedisStore {
  constructor(redisClient) {
    this.client = redisClient;
  }
  
  /**
   * Get rate limit data for a key
   * @param {string} key - Rate limit key
   * @returns {Promise<{count: number, resetAt: number} | null>}
   */
  async get(key) {
    try {
      const data = await this.client.hGetAll(key);
      if (!data || !data.count) return null;
      
      return {
        count: parseInt(data.count, 10),
        resetAt: parseInt(data.resetAt, 10)
      };
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }
  
  /**
   * Increment rate limit counter
   * @param {string} key - Rate limit key
   * @param {number} windowMs - Window in milliseconds
   * @returns {Promise<{count: number, resetAt: number}>}
   */
  async increment(key, windowMs) {
    try {
      const now = Date.now();
      const resetAt = now + windowMs;
      
      // Use Redis transaction for atomic operation
      const multi = this.client.multi();
      multi.hIncrBy(key, 'count', 1);
      multi.hSetNX(key, 'resetAt', resetAt.toString());
      multi.pExpire(key, windowMs);
      
      const results = await multi.exec();
      const count = results[0];
      
      // Get the actual resetAt (might be from previous window)
      const data = await this.client.hGetAll(key);
      
      return {
        count,
        resetAt: parseInt(data.resetAt, 10)
      };
    } catch (error) {
      console.error('Redis increment error:', error);
      // Fallback: allow the request
      return { count: 1, resetAt: Date.now() + windowMs };
    }
  }
  
  /**
   * Reset rate limit for a key
   * @param {string} key - Rate limit key
   */
  async reset(key) {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis reset error:', error);
    }
  }
}

/**
 * Rate Limiter Service
 */
class RateLimiterService {
  constructor() {
    this.store = null;
    this.useRedis = false;
    this.initialized = false;
  }
  
  /**
   * Initialize the rate limiter
   * @param {Object} redisClient - Optional Redis client
   */
  async initialize(redisClient = null) {
    if (this.initialized) return;
    
    if (redisClient) {
      try {
        // Test Redis connection
        await redisClient.ping();
        this.store = new RedisStore(redisClient);
        this.useRedis = true;
        console.log('✅ Rate Limiter: Using Redis store');
      } catch (error) {
        console.warn('⚠️ Rate Limiter: Redis unavailable, falling back to in-memory');
        this.store = new InMemoryStore();
        this.useRedis = false;
      }
    } else {
      this.store = new InMemoryStore();
      this.useRedis = false;
      console.log('ℹ️ Rate Limiter: Using in-memory store (configure REDIS_URL for production)');
    }
    
    this.initialized = true;
  }
  
  /**
   * Check rate limit for a request
   * @param {string} identifier - User ID or IP
   * @param {string} type - Rate limit type (ai, api, auth, upload, contact)
   * @returns {Promise<{allowed: boolean, remaining: number, resetIn: number, retryAfter?: number}>}
   */
  async checkLimit(identifier, type = 'api') {
    // Initialize with in-memory if not already done
    if (!this.initialized) {
      await this.initialize();
    }
    
    const config = RATE_LIMIT_CONFIGS[type] || RATE_LIMIT_CONFIGS.api;
    const key = `${config.keyPrefix}${identifier}`;
    
    // Increment counter
    const data = await this.store.increment(key, config.windowMs);
    
    const now = Date.now();
    const resetIn = Math.max(0, Math.ceil((data.resetAt - now) / 1000));
    const remaining = Math.max(0, config.maxRequests - data.count);
    const allowed = data.count <= config.maxRequests;
    
    const result = {
      allowed,
      remaining,
      resetIn,
      limit: config.maxRequests
    };
    
    if (!allowed) {
      result.retryAfter = resetIn;
    }
    
    return result;
  }
  
  /**
   * Reset rate limit for a user/endpoint
   * @param {string} identifier - User ID or IP
   * @param {string} type - Rate limit type
   */
  async resetLimit(identifier, type = 'api') {
    if (!this.initialized) return;
    
    const config = RATE_LIMIT_CONFIGS[type] || RATE_LIMIT_CONFIGS.api;
    const key = `${config.keyPrefix}${identifier}`;
    
    await this.store.reset(key);
  }
  
  /**
   * Get current usage for a user/endpoint
   * @param {string} identifier - User ID or IP
   * @param {string} type - Rate limit type
   * @returns {Promise<{count: number, remaining: number, resetIn: number} | null>}
   */
  async getUsage(identifier, type = 'api') {
    if (!this.initialized) return null;
    
    const config = RATE_LIMIT_CONFIGS[type] || RATE_LIMIT_CONFIGS.api;
    const key = `${config.keyPrefix}${identifier}`;
    
    const data = await this.store.get(key);
    if (!data) {
      return {
        count: 0,
        remaining: config.maxRequests,
        resetIn: 0
      };
    }
    
    const now = Date.now();
    return {
      count: data.count,
      remaining: Math.max(0, config.maxRequests - data.count),
      resetIn: Math.max(0, Math.ceil((data.resetAt - now) / 1000))
    };
  }
  
  /**
   * Create Express middleware for rate limiting
   * @param {string} type - Rate limit type
   * @param {Object} options - Additional options
   * @returns {Function} Express middleware
   */
  middleware(type = 'api', options = {}) {
    const { keyGenerator, onRateLimited, skipFailedRequests = false } = options;
    
    return async (req, res, next) => {
      try {
        // Generate key (user ID or IP)
        const identifier = keyGenerator 
          ? keyGenerator(req) 
          : (req.user?.id || req.ip);
        
        const result = await this.checkLimit(identifier, type);
        
        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', result.limit);
        res.setHeader('X-RateLimit-Remaining', result.remaining);
        res.setHeader('X-RateLimit-Reset', result.resetIn);
        
        if (!result.allowed) {
          res.setHeader('Retry-After', result.retryAfter);
          
          if (onRateLimited) {
            return onRateLimited(req, res, result);
          }
          
          return res.status(429).json({
            success: false,
            message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
            retryAfter: result.retryAfter
          });
        }
        
        next();
      } catch (error) {
        console.error('Rate limiter middleware error:', error);
        // On error, allow the request (fail open)
        next();
      }
    };
  }
  
  /**
   * Shutdown the service
   */
  async shutdown() {
    if (this.store && this.store.shutdown) {
      this.store.shutdown();
    }
    this.initialized = false;
  }
  
  /**
   * Get service status for monitoring
   */
  getStatus() {
    return {
      initialized: this.initialized,
      storeType: this.useRedis ? 'redis' : 'in-memory',
      storeSize: this.store?.getSize?.() || 'N/A'
    };
  }
}

// Export singleton instance
const rateLimiterService = new RateLimiterService();

module.exports = {
  rateLimiterService,
  RATE_LIMIT_CONFIGS,
  RateLimiterService
};

