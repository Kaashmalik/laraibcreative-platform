const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const {
  getProfile,
  updateProfile,
  updateProfileImage,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getOrders,
  getOrder,
  cancelOrder,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  getMeasurements,
  getMeasurement,
  getReviews,
  getDashboard,
  getActivity
} = require('../controllers/customerController');
const { protect } = require('../middleware/auth.middleware');

/**
 * Customer Routes for LaraibCreative E-Commerce Platform
 * 
 * All routes are protected and require customer authentication
 * 
 * Base URL: /api/customers
 * 
 * @module customerRoutes
 */

// ============================================================
// VALIDATION RULES
// ============================================================

const profileValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('phone')
    .optional()
    .matches(/^(\+92|0)?3[0-9]{9}$/)
    .withMessage('Valid Pakistani phone number is required'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Valid date of birth is required'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
    .withMessage('Invalid gender value'),
  body('preferredLanguage')
    .optional()
    .isIn(['en', 'ur'])
    .withMessage('Preferred language must be en or ur')
];

const addressValidation = [
  body('type')
    .isIn(['home', 'work', 'other'])
    .withMessage('Address type must be home, work, or other'),
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name is required'),
  body('phone')
    .matches(/^(\+92|0)?3[0-9]{9}$/)
    .withMessage('Valid Pakistani phone number is required'),
  body('addressLine1')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address line 1 is required (5-200 characters)'),
  body('addressLine2')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address line 2 cannot exceed 200 characters'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City is required'),
  body('state')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State/Province is required'),
  body('postalCode')
    .trim()
    .isLength({ min: 5, max: 10 })
    .withMessage('Postal code is required'),
  body('country')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country is required'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean')
];

const cancelOrderValidation = [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Cancellation reason cannot exceed 500 characters')
];

// ============================================================
// PROFILE ROUTES
// ============================================================

/**
 * @route   GET /api/customers/profile
 * @desc    Get customer profile with stats
 * @access  Private (Customer)
 */
router.get('/profile', protect, getProfile);

/**
 * @route   PUT /api/customers/profile
 * @desc    Update customer profile
 * @access  Private (Customer)
 */
router.put('/profile', protect, profileValidation, updateProfile);

/**
 * @route   PUT /api/customers/profile/image
 * @desc    Update profile image
 * @access  Private (Customer)
 */
router.put(
  '/profile/image',
  protect,
  [
    body('profileImage')
      .isURL()
      .withMessage('Valid image URL is required')
  ],
  updateProfileImage
);

// ============================================================
// ADDRESS ROUTES
// ============================================================

/**
 * @route   GET /api/customers/addresses
 * @desc    Get all customer addresses
 * @access  Private (Customer)
 */
router.get('/addresses', protect, getAddresses);

/**
 * @route   POST /api/customers/addresses
 * @desc    Add new address
 * @access  Private (Customer)
 */
router.post('/addresses', protect, addressValidation, addAddress);

/**
 * @route   PUT /api/customers/addresses/:addressId
 * @desc    Update address
 * @access  Private (Customer)
 */
router.put(
  '/addresses/:addressId',
  protect,
  [
    param('addressId')
      .isMongoId()
      .withMessage('Invalid address ID'),
    ...addressValidation
  ],
  updateAddress
);

/**
 * @route   DELETE /api/customers/addresses/:addressId
 * @desc    Delete address
 * @access  Private (Customer)
 */
router.delete(
  '/addresses/:addressId',
  protect,
  [
    param('addressId')
      .isMongoId()
      .withMessage('Invalid address ID')
  ],
  deleteAddress
);

/**
 * @route   PUT /api/customers/addresses/:addressId/default
 * @desc    Set address as default
 * @access  Private (Customer)
 */
router.put(
  '/addresses/:addressId/default',
  protect,
  [
    param('addressId')
      .isMongoId()
      .withMessage('Invalid address ID')
  ],
  setDefaultAddress
);

// ============================================================
// ORDER ROUTES
// ============================================================

/**
 * @route   GET /api/customers/orders
 * @desc    Get customer order history
 * @access  Private (Customer)
 */
router.get(
  '/orders',
  protect,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('status')
      .optional()
      .isIn([
        'pending',
        'payment-pending',
        'confirmed',
        'processing',
        'ready',
        'shipped',
        'delivered',
        'completed',
        'cancelled'
      ])
      .withMessage('Invalid order status')
  ],
  getOrders
);

/**
 * @route   GET /api/customers/orders/:orderId
 * @desc    Get single order details
 * @access  Private (Customer)
 */
router.get(
  '/orders/:orderId',
  protect,
  [
    param('orderId')
      .isMongoId()
      .withMessage('Invalid order ID')
  ],
  getOrder
);

/**
 * @route   PUT /api/customers/orders/:orderId/cancel
 * @desc    Cancel order
 * @access  Private (Customer)
 */
router.put(
  '/orders/:orderId/cancel',
  protect,
  [
    param('orderId')
      .isMongoId()
      .withMessage('Invalid order ID'),
    ...cancelOrderValidation
  ],
  cancelOrder
);

// ============================================================
// WISHLIST ROUTES
// ============================================================

/**
 * @route   GET /api/customers/wishlist
 * @desc    Get customer wishlist
 * @access  Private (Customer)
 */
router.get('/wishlist', protect, getWishlist);

/**
 * @route   POST /api/customers/wishlist/:productId
 * @desc    Add product to wishlist
 * @access  Private (Customer)
 */
router.post(
  '/wishlist/:productId',
  protect,
  [
    param('productId')
      .isMongoId()
      .withMessage('Invalid product ID')
  ],
  addToWishlist
);

/**
 * @route   DELETE /api/customers/wishlist/:productId
 * @desc    Remove product from wishlist
 * @access  Private (Customer)
 */
router.delete(
  '/wishlist/:productId',
  protect,
  [
    param('productId')
      .isMongoId()
      .withMessage('Invalid product ID')
  ],
  removeFromWishlist
);

/**
 * @route   DELETE /api/customers/wishlist
 * @desc    Clear entire wishlist
 * @access  Private (Customer)
 */
router.delete('/wishlist', protect, clearWishlist);

// ============================================================
// MEASUREMENT ROUTES
// ============================================================

/**
 * @route   GET /api/customers/measurements
 * @desc    Get customer measurements
 * @access  Private (Customer)
 */
router.get('/measurements', protect, getMeasurements);

/**
 * @route   GET /api/customers/measurements/:measurementId
 * @desc    Get single measurement
 * @access  Private (Customer)
 */
router.get(
  '/measurements/:measurementId',
  protect,
  [
    param('measurementId')
      .isMongoId()
      .withMessage('Invalid measurement ID')
  ],
  getMeasurement
);

// ============================================================
// REVIEW ROUTES
// ============================================================

/**
 * @route   GET /api/customers/reviews
 * @desc    Get customer reviews
 * @access  Private (Customer)
 */
router.get(
  '/reviews',
  protect,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50')
  ],
  getReviews
);

// ============================================================
// DASHBOARD & ACTIVITY ROUTES
// ============================================================

/**
 * @route   GET /api/customers/dashboard
 * @desc    Get customer dashboard data
 * @access  Private (Customer)
 */
router.get('/dashboard', protect, getDashboard);

/**
 * @route   GET /api/customers/activity
 * @desc    Get customer activity log
 * @access  Private (Customer)
 */
router.get(
  '/activity',
  protect,
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],
  getActivity
);

module.exports = router;