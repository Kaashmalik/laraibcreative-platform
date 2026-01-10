/**
 * Simple Circuit Breaker Implementation
 * Prevents cascading failures by stopping requests to failing services
 */

class CircuitBreaker {
    constructor(name, options = {}) {
        this.name = name;
        this.failureThreshold = options.failureThreshold || 5;
        this.timeout = options.timeout || 60000; // 60 seconds
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this.failureCount = 0;
        this.nextAttempt = Date.now();
        this.successCount = 0;
    }

    async execute(fn) {
        if (this.state === 'OPEN') {
            if (Date.now() < this.nextAttempt) {
                throw new Error(`Circuit breaker ${this.name} is OPEN`);
            }
            this.state = 'HALF_OPEN';
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    onSuccess() {
        this.failureCount = 0;
        if (this.state === 'HALF_OPEN') {
            this.successCount++;
            if (this.successCount >= 2) {
                this.state = 'CLOSED';
                this.successCount = 0;
            }
        }
    }

    onFailure() {
        this.failureCount++;
        if (this.failureCount >= this.failureThreshold) {
            this.state = 'OPEN';
            this.nextAttempt = Date.now() + this.timeout;
            this.successCount = 0;
        }
    }

    getStatus() {
        return {
            name: this.name,
            state: this.state,
            failureCount: this.failureCount,
            nextAttempt: this.nextAttempt
        };
    }

    reset() {
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.successCount = 0;
        this.nextAttempt = Date.now();
    }
}

// Circuit Breaker Manager
class CircuitBreakerManager {
    constructor() {
        this.breakers = new Map();
    }

    getBreaker(name, options) {
        if (!this.breakers.has(name)) {
            this.breakers.set(name, new CircuitBreaker(name, options));
        }
        return this.breakers.get(name);
    }

    getAllStatus() {
        const status = {};
        for (const [name, breaker] of this.breakers) {
            status[name] = breaker.getStatus();
        }
        return status;
    }

    resetAll() {
        for (const breaker of this.breakers.values()) {
            breaker.reset();
        }
    }
}

const circuitBreakerManager = new CircuitBreakerManager();

// Export pre-configured circuit breakers
const aiServiceBreaker = circuitBreakerManager.getBreaker('ai-service', {
    failureThreshold: 3,
    timeout: 60000
});

const cloudinaryBreaker = circuitBreakerManager.getBreaker('cloudinary', {
    failureThreshold: 5,
    timeout: 30000
});

module.exports = {
    CircuitBreaker,
    CircuitBreakerManager,
    circuitBreakerManager,
    aiServiceBreaker,
    cloudinaryBreaker
};
