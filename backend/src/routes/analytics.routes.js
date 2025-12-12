const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// All routes require authentication and admin access
router.use(protect);
router.use(adminOnly);

/**
 * @route   GET /api/v1/analytics/dashboard
 * @desc    Get comprehensive business metrics
 * @access  Admin
 */
router.get('/dashboard', analyticsController.getDashboard);

/**
 * @route   GET /api/v1/analytics/revenue
 * @desc    Get revenue metrics
 * @access  Admin
 */
router.get('/revenue', analyticsController.getRevenue);

/**
 * @route   GET /api/v1/analytics/customers
 * @desc    Get customer metrics
 * @access  Admin
 */
router.get('/customers', analyticsController.getCustomers);

/**
 * @route   GET /api/v1/analytics/products
 * @desc    Get product metrics
 * @access  Admin
 */
router.get('/products', analyticsController.getProducts);

/**
 * @route   GET /api/v1/analytics/seo
 * @desc    Get SEO analytics data
 * @access  Admin
 */
router.get('/seo', analyticsController.getSeo);

module.exports = router;
