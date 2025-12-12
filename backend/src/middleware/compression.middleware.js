/**
 * Response Compression Middleware
 * Compresses HTTP responses to reduce bandwidth and improve load times
 * 
 * Features:
 * - Gzip and Brotli compression
 * - Selective compression based on content type
 * - Configurable compression levels
 * - Skip compression for small responses
 */

const compression = require('compression');

/**
 * Check if response should be compressed
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {boolean} Whether to compress
 */
const shouldCompress = (req, res) => {
  // Don't compress if client doesn't accept it
  if (req.headers['x-no-compression']) {
    return false;
  }

  // Don't compress already compressed content
  const contentEncoding = res.getHeader('Content-Encoding');
  if (contentEncoding && contentEncoding !== 'identity') {
    return false;
  }

  // Don't compress SSE (Server-Sent Events)
  if (res.getHeader('Content-Type')?.includes('text/event-stream')) {
    return false;
  }

  // Don't compress WebSocket upgrade requests
  if (req.headers.upgrade === 'websocket') {
    return false;
  }

  // Use default compression filter
  return compression.filter(req, res);
};

/**
 * Create compression middleware with custom options
 * @param {Object} options - Compression options
 * @returns {Function} Express middleware
 */
const createCompressionMiddleware = (options = {}) => {
  const {
    level = 6, // Compression level (1-9, higher = better compression, slower)
    threshold = 1024, // Only compress responses larger than 1KB
    memLevel = 8, // Memory level for zlib (1-9)
    chunkSize = 16 * 1024, // 16KB chunks
  } = options;

  return compression({
    filter: shouldCompress,
    level,
    threshold,
    memLevel,
    chunkSize,
  });
};

/**
 * Default compression middleware
 * Balanced settings for most use cases
 */
const defaultCompression = createCompressionMiddleware({
  level: 6,
  threshold: 1024,
});

/**
 * High compression middleware
 * Better compression ratio, slightly slower
 * Use for static assets or when bandwidth is critical
 */
const highCompression = createCompressionMiddleware({
  level: 9,
  threshold: 512,
});

/**
 * Fast compression middleware
 * Lower compression ratio, faster processing
 * Use when CPU is a concern
 */
const fastCompression = createCompressionMiddleware({
  level: 1,
  threshold: 2048,
});

/**
 * API-optimized compression middleware
 * Good balance for JSON API responses
 */
const apiCompression = createCompressionMiddleware({
  level: 6,
  threshold: 1024,
});

module.exports = {
  createCompressionMiddleware,
  defaultCompression,
  highCompression,
  fastCompression,
  apiCompression,
  shouldCompress,
};

