// backend/src/routes/index.js
const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const categoryRoutes = require('./category.routes');
const orderRoutes = require('./order.routes');
const customerRoutes = require('./customer.routes');
const reviewRoutes = require('./review.routes');
const blogRoutes = require('./blog.routes');
const measurementRoutes = require('./measurement.routes');
const measurementProfileRoutes = require('./measurementProfile.routes');
const uploadRoutes = require('./upload.routes');
const analyticsRoutes = require('./analytics.routes');
const dashboardRoutes = require('./dashboard.routes');
const settingsRoutes = require('./settings.routes');
const adminProductRoutes = require('./adminProduct.routes');
const adminOrderRoutes = require('./adminOrder.routes');
const productionQueueRoutes = require('./productionQueue.routes');
const referralRoutes = require('./referral.routes');
const loyaltyRoutes = require('./loyalty.routes');

// Health check routes (mounted at root level - no version)
const healthRoutes = require('./health.routes');
router.use('/health', healthRoutes);

// API version prefix - empty for compatibility
// Routes are mounted at /api/ level, version is handled by server.js
const API_VERSION = '';

// Mount routes WITHOUT API version (server.js already adds /api prefix)
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/products`, productRoutes);
router.use(`${API_VERSION}/categories`, categoryRoutes);
router.use(`${API_VERSION}/orders`, orderRoutes);
router.use(`${API_VERSION}/orders/custom`, require('./customOrder.routes'));
router.use(`${API_VERSION}/customers`, customerRoutes);
router.use(`${API_VERSION}/reviews`, reviewRoutes);
router.use(`${API_VERSION}/blog`, blogRoutes);
router.use(`${API_VERSION}/measurements`, measurementRoutes);
router.use(`${API_VERSION}/measurement-profiles`, measurementProfileRoutes);
router.use(`${API_VERSION}/upload`, uploadRoutes);
router.use(`${API_VERSION}/analytics`, analyticsRoutes);
router.use(`${API_VERSION}/admin/dashboard`, dashboardRoutes);
router.use(`${API_VERSION}/admin/products`, adminProductRoutes);
router.use(`${API_VERSION}/admin/orders`, adminOrderRoutes);
router.use(`${API_VERSION}/settings`, settingsRoutes);
router.use(`${API_VERSION}/production-queue`, productionQueueRoutes);
router.use(`${API_VERSION}/referrals`, referralRoutes);
router.use(`${API_VERSION}/loyalty`, loyaltyRoutes);
router.use(`${API_VERSION}/alerts`, require('./alerts.routes'));
router.use(`${API_VERSION}/facebook`, require('./facebook-conversion.routes'));

// Root endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to LaraibCreative API',
    version: 'v1',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders',
      customers: '/api/customers',
      reviews: '/api/reviews',
      blog: '/api/blog',
      measurements: '/api/measurements',
      upload: '/api/upload',
      analytics: '/api/analytics',
      dashboard: '/api/admin/dashboard',
      settings: '/api/settings'
    }
  });
});

// 404 handler for undefined API routes
router.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/api/auth',
      '/api/products',
      '/api/categories',
      '/api/orders',
      '/api/customers',
      '/api/reviews',
      '/api/blog',
      '/api/measurements',
      '/api/upload',
      '/api/analytics',
      '/api/admin/dashboard',
      '/api/settings'
    ]
  });
});

module.exports = router;