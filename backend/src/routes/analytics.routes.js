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
  exportAnalytics,
  getSuitTypeSales,
  getReplicaConversion
} = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// All analytics routes require admin authentication
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardOverview);
router.get('/sales', getSalesReport);
router.get('/customers', getCustomerReport);
router.get('/products', getProductReport);
router.get('/funnel', getConversionFunnel);
router.get('/revenue-trends', getRevenueTrends);
router.get('/order-distribution', getOrderDistribution);
router.get('/top-products', getTopProducts);
router.get('/inventory-alerts', getInventoryAlerts);
router.get('/suit-type-sales', getSuitTypeSales);
router.get('/replica-conversion', getReplicaConversion);
router.get('/export', exportAnalytics);

module.exports = router;
