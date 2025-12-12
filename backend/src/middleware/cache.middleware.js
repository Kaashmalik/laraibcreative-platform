/**
 * API Caching Middleware
 * Provides automatic response caching with smart invalidation
 */

const { getCached, setCached, cacheKeys, cacheTTL } = require('../utils/cache');

/**
 * Cache middleware factory
 * @param {Function|string} keyGenerator - Function to generate cache key or static key
 * @param {number} ttlSeconds - Time to live in seconds
 * @param {Object} options - Additional options
 */
const cacheMiddleware = (keyGenerator, ttlSeconds = 300, options = {}) => {
  const {
    condition = () => true,  // Condition to cache
    compress = false,        // Compress large responses
    varyBy = [],             // Headers to vary cache by
  } = options;

  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Check condition
    if (!condition(req)) {
      return next();
    }

    // Generate cache key
    let cacheKey;
    if (typeof keyGenerator === 'function') {
      cacheKey = keyGenerator(req);
    } else {
      cacheKey = keyGenerator;
    }

    // Add vary headers to cache key
    if (varyBy.length > 0) {
      const varyValues = varyBy.map(h => req.get(h) || '').join(':');
      cacheKey = `${cacheKey}:vary:${varyValues}`;
    }

    try {
      // Try to get cached response
      const cached = await getCached(cacheKey);
      
      if (cached) {
        // Set cache headers
        res.set({
          'X-Cache': 'HIT',
          'X-Cache-Key': cacheKey,
          'Cache-Control': `public, max-age=${ttlSeconds}`,
        });
        
        return res.json(cached);
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = async (data) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          await setCached(cacheKey, data, ttlSeconds);
          
          res.set({
            'X-Cache': 'MISS',
            'X-Cache-Key': cacheKey,
            'Cache-Control': `public, max-age=${ttlSeconds}`,
          });
        }
        
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error.message);
      next();
    }
  };
};

/**
 * Pre-configured cache middlewares for common routes
 */
const cacheProducts = cacheMiddleware(
  (req) => cacheKeys.products.all(
    req.query.page || 1,
    req.query.limit || 20,
    { category: req.query.category, sort: req.query.sort }
  ),
  cacheTTL.products.list
);

const cacheProductById = cacheMiddleware(
  (req) => cacheKeys.products.single(req.params.id),
  cacheTTL.products.single
);

const cacheProductBySlug = cacheMiddleware(
  (req) => cacheKeys.products.slug(req.params.slug),
  cacheTTL.products.single
);

const cacheFeaturedProducts = cacheMiddleware(
  () => cacheKeys.products.featured(),
  cacheTTL.products.featured
);

const cacheNewArrivals = cacheMiddleware(
  () => cacheKeys.products.newArrivals(),
  cacheTTL.products.featured
);

const cacheBestSellers = cacheMiddleware(
  () => cacheKeys.products.bestSellers(),
  cacheTTL.products.featured
);

const cacheCategories = cacheMiddleware(
  () => cacheKeys.categories.all(),
  cacheTTL.categories.all
);

const cacheCategoryTree = cacheMiddleware(
  () => cacheKeys.categories.tree(),
  cacheTTL.categories.tree
);

const cacheSearchResults = cacheMiddleware(
  (req) => cacheKeys.products.search(
    req.query.q || '',
    req.query.page || 1,
    req.query.limit || 20
  ),
  cacheTTL.products.search
);

/**
 * Cache invalidation middleware
 * Clears relevant cache entries after mutations
 */
const invalidateCache = (patterns) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    res.json = async (data) => {
      // Invalidate cache after successful mutation
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const { invalidatePattern } = require('../utils/cache');
        
        for (const pattern of patterns) {
          const patternStr = typeof pattern === 'function' ? pattern(req) : pattern;
          await invalidatePattern(patternStr);
        }
      }
      
      return originalJson(data);
    };

    next();
  };
};

/**
 * ETags middleware for conditional requests
 */
const etagMiddleware = () => {
  const crypto = require('crypto');
  
  return (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = (data) => {
      // Generate ETag from response data
      const etag = crypto
        .createHash('md5')
        .update(JSON.stringify(data))
        .digest('hex');
      
      res.set('ETag', `"${etag}"`);
      
      // Check If-None-Match header
      const clientEtag = req.get('If-None-Match');
      if (clientEtag === `"${etag}"`) {
        return res.status(304).end();
      }
      
      return originalJson(data);
    };

    next();
  };
};

/**
 * Rate limiting with caching
 */
const cachedRateLimiter = (options = {}) => {
  const {
    windowMs = 60000,     // 1 minute
    maxRequests = 100,    // 100 requests per window
    keyGenerator = (req) => req.ip,
  } = options;

  return async (req, res, next) => {
    const { getCached, setCached } = require('../utils/cache');
    
    const key = `ratelimit:${keyGenerator(req)}`;
    const current = await getCached(key) || { count: 0, resetAt: Date.now() + windowMs };
    
    if (Date.now() > current.resetAt) {
      current.count = 0;
      current.resetAt = Date.now() + windowMs;
    }
    
    current.count++;
    await setCached(key, current, Math.ceil(windowMs / 1000));
    
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': Math.max(0, maxRequests - current.count),
      'X-RateLimit-Reset': current.resetAt,
    });
    
    if (current.count > maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later.',
      });
    }
    
    next();
  };
};

module.exports = {
  cacheMiddleware,
  cacheProducts,
  cacheProductById,
  cacheProductBySlug,
  cacheFeaturedProducts,
  cacheNewArrivals,
  cacheBestSellers,
  cacheCategories,
  cacheCategoryTree,
  cacheSearchResults,
  invalidateCache,
  etagMiddleware,
  cachedRateLimiter,
};
