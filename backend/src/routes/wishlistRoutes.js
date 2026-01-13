/**
 * Wishlist Routes
 */

const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// Get user's wishlist
router.get('/', wishlistController.getWishlist);

// Add item to wishlist
router.post('/', wishlistController.addToWishlist);

// Remove item from wishlist
router.delete('/:productId', wishlistController.removeFromWishlist);

// Clear wishlist
router.delete('/', wishlistController.clearWishlist);

// Sync wishlist (merge local with backend)
router.post('/sync', wishlistController.syncWishlist);

// Check if product is in wishlist
router.get('/check/:productId', wishlistController.checkInWishlist);

module.exports = router;
