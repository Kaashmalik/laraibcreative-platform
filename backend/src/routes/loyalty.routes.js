const express = require('express');
const router = express.Router();
const loyaltyController = require('../controllers/loyaltyController');
const { authenticate, adminOnly } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/v1/loyalty/account
 * @desc    Get user's loyalty account
 * @access  Private
 */
router.get('/account', authenticate, loyaltyController.getAccount);

/**
 * @route   GET /api/v1/loyalty/transactions
 * @desc    Get loyalty transactions
 * @access  Private
 */
router.get('/transactions', authenticate, loyaltyController.getTransactions);

/**
 * @route   POST /api/v1/loyalty/redeem
 * @desc    Redeem points
 * @access  Private
 */
router.post('/redeem', authenticate, loyaltyController.redeemPoints);

/**
 * @route   POST /api/v1/loyalty/award
 * @desc    Award points (internal/admin)
 * @access  Admin
 */
router.post('/award', authenticate, adminOnly, loyaltyController.awardPoints);

module.exports = router;

