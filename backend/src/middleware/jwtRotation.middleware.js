/**
 * JWT Token Rotation Middleware
 * Automatically refreshes access tokens before expiry
 * 
 * Features:
 * - Silent token rotation (no user action needed)
 * - Configurable rotation threshold
 * - Secure token handling
 */

const jwt = require('jsonwebtoken');
const { generateAccessToken, setAuthCookies } = require('./auth.middleware');
const logger = require('../utils/logger');

/**
 * Check if token should be rotated
 * @param {Object} decoded - Decoded JWT payload
 * @param {number} rotationThreshold - Percentage of lifetime after which to rotate (0-1)
 * @returns {boolean} Whether token should be rotated
 */
const shouldRotateToken = (decoded, rotationThreshold = 0.5) => {
  if (!decoded.iat || !decoded.exp) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  const tokenLifetime = decoded.exp - decoded.iat;
  const tokenAge = now - decoded.iat;
  
  // Rotate if token has used more than threshold of its lifetime
  return tokenAge > tokenLifetime * rotationThreshold;
};

/**
 * JWT Token Rotation Middleware
 * Checks if access token should be rotated and issues new one
 */
const tokenRotationMiddleware = (options = {}) => {
  const {
    rotationThreshold = 0.5, // Rotate after 50% of lifetime
    setCookie = true, // Set new token in cookie
    setHeader = true, // Set new token in response header
  } = options;

  return async (req, res, next) => {
    // Only process if user is authenticated
    if (!req.user) {
      return next();
    }

    try {
      // Get current token
      let token;
      if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      } else if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
      }

      if (!token) {
        return next();
      }

      // Decode token (we already know it's valid from auth middleware)
      const decoded = jwt.decode(token);
      
      if (!decoded) {
        return next();
      }

      // Check if token should be rotated
      if (shouldRotateToken(decoded, rotationThreshold)) {
        // Generate new access token
        const newAccessToken = generateAccessToken(req.user.id || req.user._id);
        
        // Set in response header
        if (setHeader) {
          res.setHeader('X-New-Access-Token', newAccessToken);
          res.setHeader('X-Token-Rotated', 'true');
        }
        
        // Set in cookie
        if (setCookie) {
          const isProduction = process.env.NODE_ENV === 'production';
          
          res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000, // 15 minutes
          });
        }
        
        // Log rotation
        logger.debug('Token rotated for user', {
          userId: req.user.id || req.user._id,
          tokenAge: Math.floor(Date.now() / 1000) - decoded.iat,
        });
      }
    } catch (error) {
      // Don't fail the request if rotation fails
      logger.error('Token rotation error:', error.message);
    }

    next();
  };
};

/**
 * Refresh Token Middleware
 * Validates refresh token and issues new access/refresh token pair
 */
const refreshTokenMiddleware = async (req, res, next) => {
  try {
    // Get refresh token from cookie or body
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required',
        code: 'REFRESH_TOKEN_REQUIRED',
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Get user
    const User = require('../models/User');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account deactivated',
        code: 'ACCOUNT_DEACTIVATED',
      });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );

    // Set cookies
    setAuthCookies(res, newAccessToken, newRefreshToken);

    // Attach to request
    req.user = user;
    req.accessToken = newAccessToken;
    req.refreshToken = newRefreshToken;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired. Please login again.',
        code: 'REFRESH_TOKEN_EXPIRED',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        code: 'REFRESH_TOKEN_INVALID',
      });
    }

    logger.error('Refresh token error:', error);
    return res.status(500).json({
      success: false,
      message: 'Token refresh failed',
      code: 'TOKEN_REFRESH_FAILED',
    });
  }
};

/**
 * Token blacklist check middleware
 * Checks if token has been revoked (e.g., on logout)
 * 
 * Note: Requires Redis or similar store for production use
 */
const tokenBlacklistMiddleware = (checkBlacklist) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next();
    }

    try {
      // Get token
      let token;
      if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      } else if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
      }

      if (!token) {
        return next();
      }

      // Check if token is blacklisted
      const isBlacklisted = await checkBlacklist(token);
      
      if (isBlacklisted) {
        return res.status(401).json({
          success: false,
          message: 'Token has been revoked. Please login again.',
          code: 'TOKEN_REVOKED',
        });
      }

      next();
    } catch (error) {
      logger.error('Blacklist check error:', error);
      // Don't fail request on blacklist check error
      next();
    }
  };
};

/**
 * Create token blacklist checker using rate limiter service
 */
const createBlacklistChecker = () => {
  const blacklist = new Set();
  const maxSize = 10000; // Prevent memory issues

  return {
    add: (token) => {
      if (blacklist.size >= maxSize) {
        // Remove oldest entries (convert to array, remove first half)
        const entries = Array.from(blacklist);
        entries.slice(0, maxSize / 2).forEach((t) => blacklist.delete(t));
      }
      blacklist.add(token);
    },
    check: (token) => blacklist.has(token),
    remove: (token) => blacklist.delete(token),
    clear: () => blacklist.clear(),
    size: () => blacklist.size,
  };
};

// In-memory blacklist (use Redis in production)
const tokenBlacklist = createBlacklistChecker();

/**
 * Add token to blacklist (call on logout)
 */
const blacklistToken = (token) => {
  tokenBlacklist.add(token);
};

/**
 * Check if token is blacklisted
 */
const isTokenBlacklisted = (token) => {
  return tokenBlacklist.check(token);
};

module.exports = {
  tokenRotationMiddleware,
  refreshTokenMiddleware,
  tokenBlacklistMiddleware,
  shouldRotateToken,
  blacklistToken,
  isTokenBlacklisted,
  createBlacklistChecker,
};

