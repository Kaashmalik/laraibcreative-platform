// backend/src/routes/settings.routes.js

const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const { body, query } = require('express-validator');

/**
 * Settings Routes
 * Separate public and admin routes
 */

// ==================== VALIDATION RULES ====================

const settingsValidation = {
  general: [
    body('siteName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Site name must be between 2 and 100 characters'),
    
    body('siteDescription')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Site description cannot exceed 500 characters'),
    
    body('contactEmail')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Invalid email address'),
    
    body('contactPhone')
      .optional()
      .trim()
      .matches(/^[\d\s\+\-\(\)]+$/)
      .withMessage('Invalid phone number format'),
    
    body('whatsappNumber')
      .optional()
      .trim()
      .matches(/^\+?[\d\s\-\(\)]+$/)
      .withMessage('Invalid WhatsApp number format'),
    
    body('currency')
      .optional()
      .isIn(['PKR', 'USD', 'EUR', 'GBP'])
      .withMessage('Invalid currency'),
    
    body('socialMedia.facebook')
      .optional()
      .trim()
      .isURL()
      .withMessage('Invalid Facebook URL'),
    
    body('socialMedia.instagram')
      .optional()
      .trim()
      .isURL()
      .withMessage('Invalid Instagram URL'),
    
    body('socialMedia.twitter')
      .optional()
      .trim()
      .isURL()
      .withMessage('Invalid Twitter URL')
  ],

  payment: [
    body('cashOnDelivery.enabled')
      .optional()
      .isBoolean()
      .withMessage('Cash on delivery enabled must be boolean'),
    
    body('bankTransfer.enabled')
      .optional()
      .isBoolean()
      .withMessage('Bank transfer enabled must be boolean'),
    
    body('bankTransfer.bankName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Bank name must be between 2 and 100 characters'),
    
    body('bankTransfer.accountTitle')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Account title must be between 2 and 100 characters'),
    
    body('bankTransfer.accountNumber')
      .optional()
      .trim()
      .matches(/^[\d\-]+$/)
      .withMessage('Invalid account number format'),
    
    body('onlinePayment.enabled')
      .optional()
      .isBoolean()
      .withMessage('Online payment enabled must be boolean'),
    
    body('onlinePayment.gateway')
      .optional()
      .isIn(['stripe', 'paypal', 'razorpay', 'jazzcash', 'easypaisa'])
      .withMessage('Invalid payment gateway')
  ],

  shipping: [
    body('freeShippingThreshold')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Free shipping threshold must be a positive number'),
    
    body('defaultShippingCost')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Default shipping cost must be a positive number'),
    
    body('estimatedDeliveryDays.min')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Minimum delivery days must be at least 1'),
    
    body('estimatedDeliveryDays.max')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Maximum delivery days must be at least 1')
      .custom((value, { req }) => {
        if (req.body.estimatedDeliveryDays?.min && value < req.body.estimatedDeliveryDays.min) {
          throw new Error('Maximum delivery days must be greater than or equal to minimum');
        }
        return true;
      }),
    
    body('shippingZones')
      .optional()
      .isArray()
      .withMessage('Shipping zones must be an array'),
    
    body('shippingMethods')
      .optional()
      .isArray()
      .withMessage('Shipping methods must be an array')
  ],

  email: [
    body('host')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Email host is required'),
    
    body('port')
      .optional()
      .isInt({ min: 1, max: 65535 })
      .withMessage('Port must be between 1 and 65535'),
    
    body('username')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Email username is required'),
    
    body('password')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Email password is required'),
    
    body('fromEmail')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Invalid from email address'),
    
    body('fromName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('From name must be between 2 and 100 characters'),
    
    body('secure')
      .optional()
      .isBoolean()
      .withMessage('Secure must be boolean')
  ],

  seo: [
    body('defaultMetaTitle')
      .optional()
      .trim()
      .isLength({ max: 60 })
      .withMessage('Meta title should not exceed 60 characters'),
    
    body('defaultMetaDescription')
      .optional()
      .trim()
      .isLength({ min: 120, max: 160 })
      .withMessage('Meta description should be between 120 and 160 characters'),
    
    body('defaultMetaKeywords')
      .optional()
      .isArray({ max: 10 })
      .withMessage('Meta keywords must be an array with maximum 10 items'),
    
    body('googleAnalyticsId')
      .optional()
      .trim()
      .matches(/^(G|UA|GT)-[A-Z0-9]+$/)
      .withMessage('Invalid Google Analytics ID format'),
    
    body('facebookPixelId')
      .optional()
      .trim()
      .matches(/^\d+$/)
      .withMessage('Facebook Pixel ID must be numeric'),
    
    body('twitterHandle')
      .optional()
      .trim()
      .matches(/^@?[\w]+$/)
      .withMessage('Invalid Twitter handle format')
  ],

  notifications: [
    body('email.newOrder')
      .optional()
      .isBoolean()
      .withMessage('New order notification must be boolean'),
    
    body('email.orderStatusChange')
      .optional()
      .isBoolean()
      .withMessage('Order status change notification must be boolean'),
    
    body('whatsapp.enabled')
      .optional()
      .isBoolean()
      .withMessage('WhatsApp enabled must be boolean')
  ],

  orders: [
    body('orderPrefix')
      .optional()
      .trim()
      .isLength({ min: 2, max: 10 })
      .withMessage('Order prefix must be between 2 and 10 characters')
      .matches(/^[A-Z0-9]+$/)
      .withMessage('Order prefix must contain only uppercase letters and numbers'),
    
    body('autoArchiveDays')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('Auto archive days must be between 1 and 365'),
    
    body('enableGuestCheckout')
      .optional()
      .isBoolean()
      .withMessage('Enable guest checkout must be boolean')
  ],

  features: [
    body('customOrders')
      .optional()
      .isBoolean()
      .withMessage('Custom orders feature must be boolean'),
    
    body('guestCheckout')
      .optional()
      .isBoolean()
      .withMessage('Guest checkout feature must be boolean'),
    
    body('productReviews')
      .optional()
      .isBoolean()
      .withMessage('Product reviews feature must be boolean'),
    
    body('wishlist')
      .optional()
      .isBoolean()
      .withMessage('Wishlist feature must be boolean'),
    
    body('blog')
      .optional()
      .isBoolean()
      .withMessage('Blog feature must be boolean'),
    
    body('newsletter')
      .optional()
      .isBoolean()
      .withMessage('Newsletter feature must be boolean')
  ],

  maintenance: [
    body('enabled')
      .optional()
      .isBoolean()
      .withMessage('Maintenance mode enabled must be boolean'),
    
    body('message')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Maintenance message cannot exceed 500 characters'),
    
    body('allowedIPs')
      .optional()
      .isArray()
      .withMessage('Allowed IPs must be an array'),
    
    body('allowedIPs.*')
      .optional()
      .matches(/^(\d{1,3}\.){3}\d{1,3}$/)
      .withMessage('Invalid IP address format')
  ],

  testEmail: [
    body('testEmail')
      .trim()
      .notEmpty()
      .withMessage('Test email address is required')
      .isEmail()
      .withMessage('Invalid email address')
  ],

  reset: [
    body('section')
      .optional()
      .isIn(['general', 'payment', 'shipping', 'email', 'seo', 'notifications', 'orders', 'features', 'maintenance'])
      .withMessage('Invalid settings section')
  ]
};

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/settings/public
 * @desc    Get public settings (for frontend)
 * @access  Public
 */
router.get('/public', settingsController.getPublicSettings);

// ==================== ADMIN ROUTES ====================

/**
 * @route   GET /api/admin/settings
 * @desc    Get all settings
 * @access  Private (Admin)
 */
router.get(
  '/admin',
  protect,
  restrictTo('admin', 'superadmin'),
  settingsController.getAllSettings
);

/**
 * @route   PUT /api/admin/settings/general
 * @desc    Update general settings
 * @access  Private (Admin)
 */
router.put(
  '/admin/general',
  protect,
  restrictTo('admin', 'superadmin'),
  [
    ...settingsValidation.general,
    validateRequest
  ],
  settingsController.updateGeneralSettings
);

/**
 * @route   PUT /api/admin/settings/payment
 * @desc    Update payment settings
 * @access  Private (Admin)
 */
router.put(
  '/admin/payment',
  protect,
  restrictTo('admin', 'superadmin'),
  [
    ...settingsValidation.payment,
    validateRequest
  ],
  settingsController.updatePaymentSettings
);

/**
 * @route   PUT /api/admin/settings/shipping
 * @desc    Update shipping settings
 * @access  Private (Admin)
 */
router.put(
  '/admin/shipping',
  protect,
  restrictTo('admin', 'superadmin'),
  [
    ...settingsValidation.shipping,
    validateRequest
  ],
  settingsController.updateShippingSettings
);

/**
 * @route   PUT /api/admin/settings/email
 * @desc    Update email settings
 * @access  Private (Admin)
 */
router.put(
  '/admin/email',
  protect,
  restrictTo('admin', 'superadmin'),
  [
    ...settingsValidation.email,
    validateRequest
  ],
  settingsController.updateEmailSettings
);

/**
 * @route   PUT /api/admin/settings/seo
 * @desc    Update SEO settings
 * @access  Private (Admin)
 */
router.put(
  '/admin/seo',
  protect,
  restrictTo('admin', 'superadmin'),
  [
    ...settingsValidation.seo,
    validateRequest
  ],
  settingsController.updateSEOSettings
);

/**
 * @route   PUT /api/admin/settings/notifications
 * @desc    Update notification settings
 * @access  Private (Admin)
 */
router.put(
  '/admin/notifications',
  protect,
  restrictTo('admin', 'superadmin'),
  [
    ...settingsValidation.notifications,
    validateRequest
  ],
  settingsController.updateNotificationSettings
);

/**
 * @route   PUT /api/admin/settings/orders
 * @desc    Update order settings
 * @access  Private (Admin)
 */
router.put(
  '/admin/orders',
  protect,
  restrictTo('admin', 'superadmin'),
  [
    ...settingsValidation.orders,
    validateRequest
  ],
  settingsController.updateOrderSettings
);

/**
 * @route   PUT /api/admin/settings/features
 * @desc    Update feature toggles
 * @access  Private (Admin)
 */
router.put(
  '/admin/features',
  protect,
  restrictTo('admin', 'superadmin'),
  [
    ...settingsValidation.features,
    validateRequest
  ],
  settingsController.updateFeatureSettings
);

/**
 * @route   PUT /api/admin/settings/maintenance
 * @desc    Update maintenance mode settings
 * @access  Private (Admin)
 */
router.put(
  '/admin/maintenance',
  protect,
  restrictTo('admin', 'superadmin'),
  [
    ...settingsValidation.maintenance,
    validateRequest
  ],
  settingsController.updateMaintenanceSettings
);

/**
 * @route   POST /api/admin/settings/email/test
 * @desc    Test email configuration
 * @access  Private (Admin)
 */
router.post(
  '/admin/email/test',
  protect,
  restrictTo('admin', 'superadmin'),
  [
    ...settingsValidation.testEmail,
    validateRequest
  ],
  settingsController.testEmailSettings
);

/**
 * @route   POST /api/admin/settings/reset
 * @desc    Reset settings to defaults
 * @access  Private (Admin)
 */
router.post(
  '/admin/reset',
  protect,
  restrictTo('admin', 'superadmin'),
  [
    ...settingsValidation.reset,
    validateRequest
  ],
  settingsController.resetSettings
);

/**
 * @route   GET /api/admin/settings/export
 * @desc    Export settings as JSON
 * @access  Private (Admin)
 */
router.get(
  '/admin/export',
  protect,
  restrictTo('admin', 'superadmin'),
  settingsController.exportSettings
);

/**
 * @route   POST /api/admin/settings/import
 * @desc    Import settings from JSON
 * @access  Private (Admin)
 */
router.post(
  '/admin/import',
  protect,
  restrictTo('admin', 'superadmin'),
  settingsController.importSettings
);

/**
 * @route   GET /api/admin/settings/history
 * @desc    Get settings change history
 * @access  Private (Admin)
 */
router.get(
  '/admin/history',
  protect,
  restrictTo('admin', 'superadmin'),
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    validateRequest
  ],
  settingsController.getSettingsHistory
);

module.exports = router;