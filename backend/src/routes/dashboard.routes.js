/**
 * Dashboard Routes
 * Routes for admin dashboard
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const analyticsController = require('../controllers/analyticsController');
const { authenticate, adminOnly } = require('../middleware/auth.middleware');

// All dashboard routes require admin authentication
router.use(authenticate, adminOnly);

/**
 * @route GET /api/admin/dashboard
 * @desc Get complete dashboard data
 * @access Private (Admin)
 */
router.get('/', dashboardController.getDashboard);

/**
 * @route GET /api/admin/dashboard/revenue-trends
 * @desc Get revenue trends for chart
 * @access Private (Admin)
 */
router.get('/revenue-trends', analyticsController.getRevenueTrends);

/**
 * @route GET /api/admin/dashboard/order-distribution
 * @desc Get order distribution by status
 * @access Private (Admin)
 */
router.get('/order-distribution', analyticsController.getOrderDistribution);

/**
 * @route GET /api/admin/dashboard/top-products
 * @desc Get top performing products
 * @access Private (Admin)
 */
router.get('/top-products', analyticsController.getTopProducts);

/**
 * @route GET /api/admin/dashboard/inventory-alerts
 * @desc Get low stock alerts
 * @access Private (Admin)
 */
router.get('/inventory-alerts', analyticsController.getInventoryAlerts);

/**
 * @route GET /api/admin/dashboard/export
 * @desc Export dashboard data
 * @access Private (Admin)
 */
router.get('/export', dashboardController.exportDashboard);

module.exports = router;

