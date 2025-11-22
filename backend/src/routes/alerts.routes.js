const express = require('express');
const router = express.Router();
const alertService = require('../services/alertService');
const { authenticate, adminOnly } = require('../middleware/auth.middleware');

// All routes require authentication and admin access
router.use(authenticate);
router.use(adminOnly);

/**
 * @route   POST /api/v1/alerts/check
 * @desc    Run all alert checks
 * @access  Admin
 */
router.post('/check', async (req, res) => {
  try {
    const results = await alertService.runAllChecks();
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to run alert checks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/v1/alerts/payments
 * @desc    Check failed payments
 * @access  Admin
 */
router.get('/payments', async (req, res) => {
  try {
    const results = await alertService.checkFailedPayments();
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check payments'
    });
  }
});

/**
 * @route   GET /api/v1/alerts/stockouts
 * @desc    Check stockouts
 * @access  Admin
 */
router.get('/stockouts', async (req, res) => {
  try {
    const results = await alertService.checkStockouts();
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check stockouts'
    });
  }
});

/**
 * @route   GET /api/v1/alerts/abandonment
 * @desc    Check cart abandonment
 * @access  Admin
 */
router.get('/abandonment', async (req, res) => {
  try {
    const results = await alertService.checkAbandonment();
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check abandonment'
    });
  }
});

module.exports = router;

