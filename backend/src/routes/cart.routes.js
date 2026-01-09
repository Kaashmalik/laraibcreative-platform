/**
 * Cart Routes
 * Handles cart operations
 */

const express = require('express');
const router = express.Router();
const {
  getCart,
  syncCart,
  applyPromoCode,
  calculateShipping,
  validateCart,
  clearCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Private
 */
router.get('/', protect, getCart);

/**
 * @route   POST /api/cart/sync
 * @desc    Sync cart with backend (merge guest cart)
 * @access  Private
 */
router.post('/sync', protect, syncCart);

/**
 * @route   POST /api/cart/promo
 * @desc    Apply promo code
 * @access  Private
 */
router.post('/promo', protect, applyPromoCode);

/**
 * @route   POST /api/cart/shipping
 * @desc    Calculate shipping cost
 * @access  Private
 */
router.post('/shipping', protect, calculateShipping);

/**
 * @route   POST /api/cart/validate
 * @desc    Validate cart items
 * @access  Private
 */
router.post('/validate', protect, validateCart);

/**
 * @route   DELETE /api/cart
 * @desc    Clear cart
 * @access  Private
 */
router.delete('/', protect, clearCart);

module.exports = router;
