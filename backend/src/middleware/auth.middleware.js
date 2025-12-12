const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to verify JWT access token
 * Extracts token from Authorization header or cookies
 * Attaches user object to req.user if valid
 */
const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header or cookie
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Extract from Bearer token in header
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.accessToken) {
      // Extract from HTTP-only cookie
      token = req.cookies.accessToken;
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID from token payload
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token invalid.'
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Check if account is locked due to failed login attempts
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Your account is temporarily locked due to multiple failed login attempts. Please try again later or reset your password.'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
        expired: true
      });
    }

    console.error('Token verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed. Please try again.'
    });
  }
};

/**
 * Alias for verifyToken - used in routes as 'protect'
 * Protects routes requiring authentication
 */
const protect = verifyToken;

/**
 * Middleware to check if user is admin
 * Must be used after protect/verifyToken middleware
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please login.'
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  next();
};

/**
 * Middleware to check if user is super admin
 * Must be used after protect/verifyToken middleware
 */
const superAdminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please login.'
    });
  }

  if (req.user.role !== 'super-admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin privileges required.'
    });
  }

  next();
};

/**
 * Middleware to verify refresh token
 * Used specifically for token refresh endpoint
 */
const verifyRefreshToken = async (req, res, next) => {
  try {
    // Get refresh token from cookie or body
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided.'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Invalid refresh token.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account deactivated.'
      });
    }

    req.user = user;
    req.refreshToken = refreshToken;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired. Please login again.'
      });
    }

    console.error('Refresh token verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Token refresh failed.'
    });
  }
};

/**
 * Middleware to check if user is authenticated (optional authentication)
 * Similar to verifyToken but doesn't fail if no token provided
 * Useful for endpoints that work differently for logged-in users
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    // If no token, continue without user
    if (!token) {
      req.user = null;
      return next();
    }

    // Verify and attach user if token exists
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (user && user.isActive && !user.isLocked) {
      req.user = user;
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // On error, just continue without user
    req.user = null;
    next();
  }
};

/**
 * Role-based authorization middleware
 * Allows access to users with specific roles
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'super-admin')
 * @example authorize('admin', 'super-admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

/**
 * Generate JWT access token
 * @param {string} userId - User ID to encode in token
 * @returns {string} JWT access token
 */
const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' } // Default 15 minutes
  );
};

/**
 * Generate JWT refresh token
 * @param {string} userId - User ID to encode in token
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' } // Default 7 days
  );
};

/**
 * Set authentication cookies in response
 * @param {object} res - Express response object
 * @param {string} accessToken - JWT access token
 * @param {string} refreshToken - JWT refresh token
 * @param {boolean} rememberMe - Whether to set long-lived cookies
 */
const setAuthCookies = (res, accessToken, refreshToken, rememberMe = false) => {
  // Determine sameSite based on environment
  // 'lax' is safer than 'strict' for cross-origin requests while still providing CSRF protection
  // 'none' is required for cross-origin cookies but requires secure: true
  const isProduction = process.env.NODE_ENV === 'production';
  const sameSiteValue = isProduction ? 'lax' : 'lax';
  
  // Cookie options for access token (short-lived)
  const accessTokenOptions = {
    httpOnly: true, // Prevents XSS attacks
    secure: isProduction, // HTTPS only in production
    sameSite: sameSiteValue, // CSRF protection with cross-origin support
    maxAge: 15 * 60 * 1000 // 15 minutes
  };

  // Cookie options for refresh token (long-lived if rememberMe)
  const refreshTokenOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: sameSiteValue,
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000 // 30 days or 7 days
  };

  res.cookie('accessToken', accessToken, accessTokenOptions);
  res.cookie('refreshToken', refreshToken, refreshTokenOptions);
};

/**
 * Clear authentication cookies
 * @param {object} res - Express response object
 */
const clearAuthCookies = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax'
  });
  
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax'
  });
};

// Alias for authorize (used in some route files as restrictTo)
const restrictTo = authorize;

module.exports = {
  // Main auth middlewares
  verifyToken,
  protect, // Alias for verifyToken
  adminOnly,
  superAdminOnly,
  verifyRefreshToken,
  optionalAuth,
  authorize,
  restrictTo, // Alias for authorize
  
  // Token utilities
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  clearAuthCookies
};