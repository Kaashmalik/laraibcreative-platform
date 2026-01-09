/**
 * Admin Promo Code Routes
 * Handles all admin promo code management endpoints
 * 
 * All routes require admin authentication
 * Mounted at: /api/v1/admin/promo-codes
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');

// ============================================================
// CONTROLLERS
// ============================================================

const {
  getAllPromoCodes,
  getPromoCodeById,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  validatePromoCode,
  getActivePromoCodes,
  bulkDeletePromoCodes,
  bulkUpdateStatus,
  getPromoCodeStats,
  duplicatePromoCode
} = require('../controllers/promoCodeController');

// ============================================================
// ALL ROUTES REQUIRE ADMIN AUTHENTICATION
// ============================================================

router.use(protect, authorize('admin', 'superadmin'));

// ============================================================
// PROMO CODE CRUD
// ============================================================

/**
 * @route   GET /api/v1/admin/promo-codes
 * @desc    Get all promo codes with pagination and filters
 * @access  Private (Admin)
 */
router.get('/', getAllPromoCodes);

/**
 * @route   GET /api/v1/admin/promo-codes/active
 * @desc    Get all active promo codes
 * @access  Private (Admin)
 */
router.get('/active', getActivePromoCodes);

/**
 * @route   GET /api/v1/admin/promo-codes/stats
 * @desc    Get promo code statistics
 * @access  Private (Admin)
 */
router.get('/stats', getPromoCodeStats);

/**
 * @route   GET /api/v1/admin/promo-codes/:id
 * @desc    Get promo code by ID
 * @access  Private (Admin)
 */
router.get('/:id', getPromoCodeById);

/**
 * @route   POST /api/v1/admin/promo-codes
 * @desc    Create new promo code
 * @access  Private (Admin)
 */
router.post('/', createPromoCode);

/**
 * @route   PUT /api/v1/admin/promo-codes/:id
 * @desc    Update promo code
 * @access  Private (Admin)
 */
router.put('/:id', updatePromoCode);

/**
 * @route   DELETE /api/v1/admin/promo-codes/:id
 * @desc    Delete promo code
 * @access  Private (Admin)
 */
router.delete('/:id', deletePromoCode);

/**
 * @route   POST /api/v1/admin/promo-codes/:id/duplicate
 * @desc    Duplicate promo code
 * @access  Private (Admin)
 */
router.post('/:id/duplicate', duplicatePromoCode);

/**
 * @route   POST /api/v1/admin/promo-codes/validate
 * @desc    Validate promo code (test)
 * @access  Private (Admin)
 */
router.post('/validate', validatePromoCode);

// ============================================================
// BULK OPERATIONS
// ============================================================

/**
 * @route   DELETE /api/v1/admin/promo-codes/bulk-delete
 * @desc    Bulk delete promo codes
 * @access  Private (Admin)
 */
router.delete('/bulk-delete', bulkDeletePromoCodes);

/**
 * @route   PUT /api/v1/admin/promo-codes/bulk-update-status
 * @desc    Bulk update promo code status
 * @access  Private (Admin)
 */
router.put('/bulk-update-status', bulkUpdateStatus);

module.exports = router;
