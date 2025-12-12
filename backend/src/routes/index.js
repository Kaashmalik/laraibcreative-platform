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
const aiRoutes = require('./aiRoutes');

// Health check routes (mounted at root level - no version)
const healthRoutes = require('./health.routes');
router.use('/health', healthRoutes);

// API version prefix
const API_VERSION = '/v1';

// Mount routes WITHOUT API version (server.js already adds /api prefix)
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/products`, productRoutes);
router.use(`${API_VERSION}/categories`, categoryRoutes);
router.use(`${API_VERSION}/orders`, orderRoutes);
router.use(`${API_VERSION}/orders/custom`, require('./customOrder.routes'));
router.use(`${API_VERSION}/customers`, customerRoutes);
router.use(`${API_VERSION}/reviews`, reviewRoutes);
router.use(`${API_VERSION}/blogs`, blogRoutes);
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
router.use(`${API_VERSION}/admin/ai`, aiRoutes);

// Root endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to LaraibCreative API',
    version: 'v1',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/v1/auth',
      products: '/api/v1/products',
      categories: '/api/v1/categories',
      orders: '/api/v1/orders',
      customers: '/api/v1/customers',
      reviews: '/api/v1/reviews',
      blogs: '/api/v1/blogs',
      measurements: '/api/v1/measurements',
      upload: '/api/v1/upload',
      analytics: '/api/v1/analytics',
      dashboard: '/api/v1/admin/dashboard',
      settings: '/api/v1/settings'
    }
  });
});

// 404 handler for undefined API routes
router.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/api/v1/auth',
      '/api/v1/products',
      '/api/v1/categories',
      '/api/v1/orders',
      '/api/v1/customers',
      '/api/v1/reviews',
      '/api/v1/blogs',
      '/api/v1/measurements',
      '/api/v1/upload',
      '/api/v1/analytics',
      '/api/v1/admin/dashboard',
      '/api/v1/settings'
    ]
  });
});

module.exports = router;