const express = require('express');
const router = express.Router();
const {
  getPublicSettings,
  getAllSettings,
  updateGeneralSettings,
  updatePaymentSettings,
  updateShippingSettings,
  updateEmailSettings,
  updateSEOSettings: updateSeoSettings,
  updateNotificationSettings,
  updateOrderSettings,
  updateFeatureSettings,
  updateMaintenanceSettings,
  resetSettings,
  importSettings,
  exportSettings,
  testEmailSettings: sendTestEmail
} = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth.middleware');

// ============================================================
// PUBLIC ROUTES
// ============================================================

/**
 * @route   GET /api/v1/settings/public
 * @desc    Get public settings (for frontend)
 * @access  Public
 */
router.get('/public', getPublicSettings);

// ============================================================
// ADMIN ROUTES (Protected)
// ============================================================

// All admin routes require authentication and admin role
router.use(protect, authorize('admin', 'superadmin'));

/**
 * @route   GET /api/v1/settings
 * @desc    Get all settings (admin)
 * @access  Private (Admin)
 */
router.get('/', getAllSettings);

/**
 * @route   PUT /api/v1/settings/general
 * @desc    Update general settings
 * @access  Private (Admin)
 */
router.put('/general', updateGeneralSettings);

/**
 * @route   PUT /api/v1/settings/payment
 * @desc    Update payment settings
 * @access  Private (Admin)
 */
router.put('/payment', updatePaymentSettings);

/**
 * @route   PUT /api/v1/settings/shipping
 * @desc    Update shipping settings
 * @access  Private (Admin)
 */
router.put('/shipping', updateShippingSettings);

/**
 * @route   PUT /api/v1/settings/email
 * @desc    Update email settings
 * @access  Private (Admin)
 */
router.put('/email', updateEmailSettings);

/**
 * @route   PUT /api/v1/settings/seo
 * @desc    Update SEO settings
 * @access  Private (Admin)
 */
router.put('/seo', updateSeoSettings);

/**
 * @route   PUT /api/v1/settings/notifications
 * @desc    Update notification settings
 * @access  Private (Admin)
 */
router.put('/notifications', updateNotificationSettings);

/**
 * @route   PUT /api/v1/settings/orders
 * @desc    Update order settings
 * @access  Private (Admin)
 */
router.put('/orders', updateOrderSettings);

/**
 * @route   PUT /api/v1/settings/features
 * @desc    Update feature settings
 * @access  Private (Admin)
 */
router.put('/features', updateFeatureSettings);

/**
 * @route   PUT /api/v1/settings/maintenance
 * @desc    Update maintenance settings
 * @access  Private (Admin)
 */
router.put('/maintenance', updateMaintenanceSettings);

/**
 * @route   POST /api/v1/settings/reset
 * @desc    Reset settings to defaults
 * @access  Private (Admin)
 */
router.post('/reset', resetSettings);

/**
 * @route   POST /api/v1/settings/import
 * @desc    Import settings from JSON
 * @access  Private (Admin)
 */
router.post('/import', importSettings);

/**
 * @route   GET /api/v1/settings/export
 * @desc    Export settings to JSON
 * @access  Private (Admin)
 */
router.get('/export', exportSettings);

/**
 * @route   POST /api/v1/settings/test-email
 * @desc    Send test email
 * @access  Private (Admin)
 */
router.post('/test-email', sendTestEmail);

module.exports = router;
