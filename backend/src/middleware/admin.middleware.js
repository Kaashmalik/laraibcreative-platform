/**
 * Admin Middleware
 * Checks if authenticated user has admin or super-admin role
 * Must be used after verifyToken middleware
 */

/**
 * Middleware to check if user is admin or super-admin
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const isAdmin = (req, res, next) => {
  // Check if user exists (should be attached by verifyToken middleware)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please login.'
    });
  }

  // Check if user has admin or super-admin role
  if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  next();
};

/**
 * Middleware to check if user is super-admin only
 * Used for sensitive operations like user management, system settings
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const isSuperAdmin = (req, res, next) => {
  // Check if user exists
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please login.'
    });
  }

  // Check if user is super-admin
  if (req.user.role !== 'super-admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin privileges required.'
    });
  }

  next();
};

/**
 * Middleware to check if user is customer
 * Used for customer-only endpoints
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const isCustomer = (req, res, next) => {
  // Check if user exists
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please login.'
    });
  }

  // Check if user is customer
  if (req.user.role !== 'customer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Customer account required.'
    });
  }

  next();
};

/**
 * Middleware to check if user has any of the specified roles
 * @param {array} roles - Array of allowed roles
 * @returns {function} Middleware function
 */
const hasRole = (roles) => {
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

// Aliases for backward compatibility
const adminOnly = isAdmin;
const admin = isAdmin;
const superAdminOnly = isSuperAdmin;
const requireAdmin = isAdmin;

module.exports = {
  isAdmin,
  isSuperAdmin,
  isCustomer,
  hasRole,
  // Aliases
  adminOnly,
  admin,
  superAdminOnly,
  requireAdmin
};