const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/referrals/code
 * @desc    Get or generate referral code
 * @access  Private
 */
router.get('/code', referralController.generateCode);

/**
 * @route   GET /api/v1/referrals/stats
 * @desc    Get referral statistics
 * @access  Private
 */
router.get('/stats', referralController.getStats);

/**
 * @route   POST /api/v1/referrals/apply
 * @desc    Apply referral code
 * @access  Private
 */
router.post('/apply', referralController.applyCode);

/**
 * @route   POST /api/v1/referrals/complete
 * @desc    Complete referral (when order is placed)
 * @access  Private (or webhook)
 */
router.post('/complete', referralController.completeReferral);

module.exports = router;

