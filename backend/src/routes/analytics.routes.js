const express = require('express');
const router = express.Router();
const {
  getDashboardOverview,
  getSalesReport,
  getCustomerReport,
  getProductReport,
  getConversionFunnel,
  getRevenueTrends,
  getOrderDistribution,
  getTopProducts,
  getInventoryAlerts,
  exportAnalytics
} = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// All analytics routes require admin authentication
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardOverview);
router.get('/sales', getSalesReport);
router.get('/customers', getCustomerReport);
router.get('/products', getProductReport);
router.get('/funnel', getConversionFunnel);

module.exports = router;
