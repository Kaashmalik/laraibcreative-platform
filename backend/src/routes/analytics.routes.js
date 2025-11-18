const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getSalesReport,
  getCustomerReport,
  getProductReport,
  getConversionFunnel
} = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// All analytics routes require admin authentication
router.use(protect, adminOnly);

router.get('/dashboard', getDashboard);
router.get('/sales', getSalesReport);
router.get('/customers', getCustomerReport);
router.get('/products', getProductReport);
router.get('/funnel', getConversionFunnel);

module.exports = router;
