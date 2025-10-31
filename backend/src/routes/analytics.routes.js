// backend/src/routes/analytics.routes.js

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/auth.middleware');
const { rateLimiter } = require('../middleware/rateLimiter');

// Apply authentication and admin middleware to all routes
router.use(protect);
router.use(admin);

// Apply rate limiting for analytics routes (higher limit for admin)
const analyticsLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window
  message: 'Too many analytics requests, please try again later'
});

router.use(analyticsLimiter);

// ==================== MAIN ANALYTICS ROUTES ====================

/**
 * @route   GET /api/analytics/overview
 * @desc    Get dashboard overview with key metrics
 * @access  Admin
 * @query   {String} period - Time period (today, last7days, last30days, etc.)
 * @query   {Date} startDate - Custom start date (optional)
 * @query   {Date} endDate - Custom end date (optional)
 * @example GET /api/analytics/overview?period=last30days
 * @example GET /api/analytics/overview?startDate=2025-01-01&endDate=2025-01-31
 */
router.get('/overview', analyticsController.getDashboardOverview);

/**
 * @route   GET /api/analytics/sales
 * @desc    Get detailed sales report
 * @access  Admin
 * @query   {String} period - Time period
 * @query   {String} groupBy - Grouping (hour, day, week, month, year)
 * @query   {Boolean} export - Export flag
 * @example GET /api/analytics/sales?period=last30days&groupBy=day
 * @example GET /api/analytics/sales?groupBy=month&export=true
 */
router.get('/sales', analyticsController.getSalesReport);

/**
 * @route   GET /api/analytics/customers
 * @desc    Get customer analytics report
 * @access  Admin
 * @query   {String} period - Time period
 * @example GET /api/analytics/customers?period=last30days
 */
router.get('/customers', analyticsController.getCustomerReport);

/**
 * @route   GET /api/analytics/products
 * @desc    Get product performance report
 * @access  Admin
 * @query   {String} period - Time period
 * @query   {String} sortBy - Sort by (revenue, quantity, views)
 * @query   {Number} limit - Number of results
 * @example GET /api/analytics/products?period=last30days&sortBy=revenue&limit=20
 */
router.get('/products', analyticsController.getProductReport);

// ==================== CHART DATA ROUTES ====================

/**
 * @route   GET /api/analytics/revenue-trends
 * @desc    Get revenue trends over time (for line charts)
 * @access  Admin
 * @query   {String} period - Time period
 * @query   {String} groupBy - Grouping (day, week, month)
 * @example GET /api/analytics/revenue-trends?period=last30days&groupBy=day
 */
router.get('/revenue-trends', analyticsController.getRevenueTrends);

/**
 * @route   GET /api/analytics/order-distribution
 * @desc    Get order status distribution (for pie charts)
 * @access  Admin
 * @query   {String} period - Time period
 * @example GET /api/analytics/order-distribution?period=last30days
 */
router.get('/order-distribution', analyticsController.getOrderDistribution);

/**
 * @route   GET /api/analytics/top-products
 * @desc    Get top performing products
 * @access  Admin
 * @query   {String} period - Time period
 * @query   {Number} limit - Number of products
 * @query   {String} sortBy - Sort by (revenue, quantity)
 * @example GET /api/analytics/top-products?period=last30days&limit=10&sortBy=revenue
 */
router.get('/top-products', analyticsController.getTopProducts);

/**
 * @route   GET /api/analytics/customer-growth
 * @desc    Get customer growth over time
 * @access  Admin
 * @query   {String} period - Time period
 * @query   {String} groupBy - Grouping (day, week, month)
 * @example GET /api/analytics/customer-growth?period=last12months&groupBy=month
 */
router.get('/customer-growth', analyticsController.getCustomerGrowth);

/**
 * @route   GET /api/analytics/conversion-funnel
 * @desc    Get conversion funnel data
 * @access  Admin
 * @query   {String} period - Time period
 * @example GET /api/analytics/conversion-funnel?period=last30days
 */
router.get('/conversion-funnel', analyticsController.getConversionFunnel);

// ==================== REAL-TIME & ALERTS ====================

/**
 * @route   GET /api/analytics/realtime
 * @desc    Get real-time statistics (today's data)
 * @access  Admin
 * @example GET /api/analytics/realtime
 */
router.get('/realtime', analyticsController.getRealtimeStats);

/**
 * @route   GET /api/analytics/inventory-alerts
 * @desc    Get inventory alerts (low stock, out of stock)
 * @access  Admin
 * @example GET /api/analytics/inventory-alerts
 */
router.get('/inventory-alerts', analyticsController.getInventoryAlerts);

// ==================== EXPORT ROUTES ====================

/**
 * @route   GET /api/analytics/export
 * @desc    Export analytics data
 * @access  Admin
 * @query   {String} type - Report type (sales, customers, products)
 * @query   {String} period - Time period
 * @query   {String} format - Export format (json, csv)
 * @example GET /api/analytics/export?type=sales&period=last30days&format=csv
 */
router.get('/export', analyticsController.exportAnalytics);

// ==================== ERROR HANDLING ====================

// Handle 404 for analytics routes
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Analytics endpoint not found',
    availableEndpoints: [
      '/api/analytics/overview',
      '/api/analytics/sales',
      '/api/analytics/customers',
      '/api/analytics/products',
      '/api/analytics/revenue-trends',
      '/api/analytics/order-distribution',
      '/api/analytics/top-products',
      '/api/analytics/customer-growth',
      '/api/analytics/conversion-funnel',
      '/api/analytics/realtime',
      '/api/analytics/inventory-alerts',
      '/api/analytics/export'
    ]
  });
});

module.exports = router;