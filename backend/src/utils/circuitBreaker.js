/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures when external services are down
 * 
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Service is failing, requests are rejected immediately
 * - HALF-OPEN: Testing if service has recovered
 */

const EventEmitter = require('events');
const logger = require('./logger');

class CircuitBreaker extends EventEmitter {
  /**
   * Create a new circuit breaker
   * @param {Object} options - Configuration options
   * @param {string} options.name - Name of the circuit breaker (for logging)
   * @param {number} options.failureThreshold - Number of failures before opening (default: 5)
   * @param {number} options.successThreshold - Successes needed to close from half-open (default: 2)
   * @param {number} options.resetTimeout - Time in ms before attempting reset (default: 30000)
   * @param {number} options.requestTimeout - Timeout for each request in ms (default: 10000)
   * @param {Function} options.fallback - Fallback function when circuit is open
   */
  constructor(options = {}) {
    super();
    
    this.name = options.name || 'default';
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.resetTimeout = options.resetTimeout || 30000;
    this.requestTimeout = options.requestTimeout || 10000;
    this.fallback = options.fallback || null;
    
    // State management
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    this.lastFailure = null;
    this.lastSuccess = null;
    this.nextAttempt = null;
    
    // Statistics
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rejectedRequests: 0,
      timeouts: 0,
      lastError: null,
    };
  }

  /**
   * Execute a function with circuit breaker protection
   * @param {Function} fn - Async function to execute
   * @param {...any} args - Arguments to pass to the function
   * @returns {Promise<any>} Result of the function
   */
  async execute(fn, ...args) {
    this.stats.totalRequests++;

    // Check if circuit is open
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        this.stats.rejectedRequests++;
        this.emit('rejected', { name: this.name, state: this.state });
        
        // Use fallback if available
        if (this.fallback) {
          return this.fallback(...args);
        }
        
        throw new CircuitBreakerError(
          `Circuit breaker "${this.name}" is OPEN. Retry after ${Math.ceil((this.nextAttempt - Date.now()) / 1000)}s`,
          this.name,
          this.state
        );
      }
      
      // Time to try again - move to half-open
      this.toHalfOpen();
    }

    try {
      // Execute with timeout
      const result = await this.executeWithTimeout(fn, ...args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  /**
   * Execute function with timeout
   * @private
   */
  async executeWithTimeout(fn, ...args) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.stats.timeouts++;
        reject(new Error(`Circuit breaker "${this.name}" request timeout after ${this.requestTimeout}ms`));
      }, this.requestTimeout);

      fn(...args)
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Handle successful execution
   * @private
   */
  onSuccess() {
    this.stats.successfulRequests++;
    this.lastSuccess = Date.now();
    this.failures = 0;
    this.successes++;

    if (this.state === 'HALF-OPEN') {
      if (this.successes >= this.successThreshold) {
        this.toClose();
      }
    }

    this.emit('success', { name: this.name, state: this.state });
  }

  /**
   * Handle failed execution
   * @private
   */
  onFailure(error) {
    this.stats.failedRequests++;
    this.stats.lastError = error.message;
    this.lastFailure = Date.now();
    this.failures++;
    this.successes = 0;

    if (this.state === 'HALF-OPEN') {
      // Any failure in half-open goes back to open
      this.toOpen();
    } else if (this.state === 'CLOSED' && this.failures >= this.failureThreshold) {
      this.toOpen();
    }

    this.emit('failure', { name: this.name, state: this.state, error: error.message });
  }

  /**
   * Transition to OPEN state
   * @private
   */
  toOpen() {
    const previousState = this.state;
    this.state = 'OPEN';
    this.nextAttempt = Date.now() + this.resetTimeout;
    
    logger.warn(`Circuit breaker "${this.name}" opened`, {
      previousState,
      failures: this.failures,
      nextAttempt: new Date(this.nextAttempt).toISOString(),
    });
    
    this.emit('open', { name: this.name, previousState });
  }

  /**
   * Transition to HALF-OPEN state
   * @private
   */
  toHalfOpen() {
    const previousState = this.state;
    this.state = 'HALF-OPEN';
    this.successes = 0;
    
    logger.info(`Circuit breaker "${this.name}" half-open, testing service`, {
      previousState,
    });
    
    this.emit('half-open', { name: this.name, previousState });
  }

  /**
   * Transition to CLOSED state
   * @private
   */
  toClose() {
    const previousState = this.state;
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    this.nextAttempt = null;
    
    logger.info(`Circuit breaker "${this.name}" closed, service recovered`, {
      previousState,
    });
    
    this.emit('close', { name: this.name, previousState });
  }

  /**
   * Force circuit to specific state (for testing/admin)
   * @param {string} state - 'CLOSED', 'OPEN', or 'HALF-OPEN'
   */
  forceState(state) {
    const validStates = ['CLOSED', 'OPEN', 'HALF-OPEN'];
    if (!validStates.includes(state)) {
      throw new Error(`Invalid state: ${state}. Must be one of: ${validStates.join(', ')}`);
    }

    const previousState = this.state;
    this.state = state;
    
    if (state === 'OPEN') {
      this.nextAttempt = Date.now() + this.resetTimeout;
    } else {
      this.nextAttempt = null;
    }
    
    if (state === 'CLOSED') {
      this.failures = 0;
      this.successes = 0;
    }

    logger.info(`Circuit breaker "${this.name}" forced to ${state}`, { previousState });
    this.emit('state-change', { name: this.name, previousState, newState: state });
  }

  /**
   * Get current status
   * @returns {Object} Current circuit breaker status
   */
  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailure: this.lastFailure ? new Date(this.lastFailure).toISOString() : null,
      lastSuccess: this.lastSuccess ? new Date(this.lastSuccess).toISOString() : null,
      nextAttempt: this.nextAttempt ? new Date(this.nextAttempt).toISOString() : null,
      stats: { ...this.stats },
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rejectedRequests: 0,
      timeouts: 0,
      lastError: null,
    };
  }
}

/**
 * Custom error for circuit breaker rejections
 */
class CircuitBreakerError extends Error {
  constructor(message, circuitName, state) {
    super(message);
    this.name = 'CircuitBreakerError';
    this.circuitName = circuitName;
    this.state = state;
    this.isCircuitBreakerError = true;
  }
}

/**
 * Circuit Breaker Manager - manages multiple circuit breakers
 */
class CircuitBreakerManager {
  constructor() {
    this.breakers = new Map();
  }

  /**
   * Get or create a circuit breaker
   * @param {string} name - Name of the circuit breaker
   * @param {Object} options - Options for new circuit breaker
   * @returns {CircuitBreaker}
   */
  getBreaker(name, options = {}) {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker({ name, ...options }));
    }
    return this.breakers.get(name);
  }

  /**
   * Get status of all circuit breakers
   * @returns {Object} Status of all breakers
   */
  getAllStatus() {
    const status = {};
    this.breakers.forEach((breaker, name) => {
      status[name] = breaker.getStatus();
    });
    return status;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll() {
    this.breakers.forEach((breaker) => {
      breaker.forceState('CLOSED');
      breaker.resetStats();
    });
  }
}

// Singleton instance
const circuitBreakerManager = new CircuitBreakerManager();

// Pre-configured circuit breakers for common services
const aiServiceBreaker = circuitBreakerManager.getBreaker('ai-service', {
  failureThreshold: 3,
  successThreshold: 2,
  resetTimeout: 60000, // 1 minute
  requestTimeout: 30000, // 30 seconds
});

const cloudinaryBreaker = circuitBreakerManager.getBreaker('cloudinary', {
  failureThreshold: 5,
  successThreshold: 2,
  resetTimeout: 30000,
  requestTimeout: 60000, // 1 minute for uploads
});

const emailServiceBreaker = circuitBreakerManager.getBreaker('email-service', {
  failureThreshold: 3,
  successThreshold: 1,
  resetTimeout: 120000, // 2 minutes
  requestTimeout: 15000,
});

const whatsappServiceBreaker = circuitBreakerManager.getBreaker('whatsapp-service', {
  failureThreshold: 5,
  successThreshold: 2,
  resetTimeout: 60000,
  requestTimeout: 10000,
});

module.exports = {
  CircuitBreaker,
  CircuitBreakerError,
  CircuitBreakerManager,
  circuitBreakerManager,
  aiServiceBreaker,
  cloudinaryBreaker,
  emailServiceBreaker,
  whatsappServiceBreaker,
};

