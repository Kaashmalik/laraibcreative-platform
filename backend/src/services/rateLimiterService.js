/**
 * Rate Limiter Service
 * In-memory rate limiting for API endpoints
 */

class RateLimiterService {
    constructor() {
        this.limiters = new Map();
        this.config = {
            ai: {
                maxRequests: 100,
                windowMs: 60000 // 1 minute
            },
            general: {
                maxRequests: 1000,
                windowMs: 900000 // 15 minutes
            }
        };
    }

    async initialize() {
        console.log('✅ Rate Limiter Service initialized');
        return true;
    }

    async checkLimit(userId, type = 'general') {
        const key = `${userId}:${type}`;
        const now = Date.now();
        const config = this.config[type] || this.config.general;

        if (!this.limiters.has(key)) {
            this.limiters.set(key, {
                count: 1,
                resetTime: now + config.windowMs
            });
            return {
                allowed: true,
                remaining: config.maxRequests - 1,
                resetTime: now + config.windowMs
            };
        }

        const limiter = this.limiters.get(key);

        // Reset if window expired
        if (now >= limiter.resetTime) {
            limiter.count = 1;
            limiter.resetTime = now + config.windowMs;
            return {
                allowed: true,
                remaining: config.maxRequests - 1,
                resetTime: limiter.resetTime
            };
        }

        // Check if limit exceeded
        if (limiter.count >= config.maxRequests) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: limiter.resetTime
            };
        }

        // Increment counter
        limiter.count++;
        return {
            allowed: true,
            remaining: config.maxRequests - limiter.count,
            resetTime: limiter.resetTime
        };
    }

    async getUsage(userId, type = 'general') {
        const key = `${userId}:${type}`;
        const limiter = this.limiters.get(key);
        const config = this.config[type] || this.config.general;

        if (!limiter) {
            return {
                count: 0,
                limit: config.maxRequests,
                remaining: config.maxRequests,
                resetTime: null
            };
        }

        const now = Date.now();
        if (now >= limiter.resetTime) {
            return {
                count: 0,
                limit: config.maxRequests,
                remaining: config.maxRequests,
                resetTime: null
            };
        }

        return {
            count: limiter.count,
            limit: config.maxRequests,
            remaining: Math.max(0, config.maxRequests - limiter.count),
            resetTime: limiter.resetTime
        };
    }

    getStatus() {
        return {
            active: true,
            limitersCount: this.limiters.size,
            config: this.config
        };
    }

    async shutdown() {
        this.limiters.clear();
        console.log('✅ Rate Limiter Service shut down');
    }
}

const RATE_LIMIT_CONFIGS = {
    AI: {
        maxRequests: 100,
        windowMs: 60000
    },
    GENERAL: {
        maxRequests: 1000,
        windowMs: 900000
    }
};

const rateLimiterService = new RateLimiterService();

module.exports = {
    rateLimiterService,
    RATE_LIMIT_CONFIGS
};
