# Lab Assignment 3: Admin Dashboard Routes and Controllers

## Overview
This document provides the complete routes and controllers implementation for the Admin Dashboard of LaraibCreative E-Commerce Platform built with Express.js and MongoDB.

---

## Project Structure

```
backend/
├── src/
│   ├── routes/
│   │   ├── index.js                    # Main route aggregator
│   │   ├── dashboard.routes.js         # Dashboard analytics routes
│   │   ├── adminProduct.routes.js      # Admin product management
│   │   ├── adminOrder.routes.js        # Admin order management
│   │   ├── category.routes.js          # Category management
│   │   ├── aiRoutes.js                 # AI content generation
│   │   └── settings.routes.js          # System settings
│   ├── controllers/
│   │   ├── dashboardController.js      # Dashboard analytics
│   │   ├── productController.js        # Product CRUD operations
│   │   ├── orderController.js          # Order management
│   │   ├── categoryController.js       # Category management
│   │   ├── aiController.js             # AI content generation
│   │   └── settingsController.js       # System settings
│   └── middleware/
│       ├── auth.middleware.js          # Authentication & Authorization
│       └── upload.middleware.js        # File upload handling
```

---

## Route Configuration

### Main Route Index (`backend/src/routes/index.js`)

```javascript
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
const uploadRoutes = require('./upload.routes');
const analyticsRoutes = require('./analytics.routes');
const dashboardRoutes = require('./dashboard.routes');
const settingsRoutes = require('./settings.routes');
const adminProductRoutes = require('./adminProduct.routes');
const adminOrderRoutes = require('./adminOrder.routes');
const aiRoutes = require('./aiRoutes');

// Health check routes
const healthRoutes = require('./health.routes');
router.use('/health', healthRoutes);

// API version prefix
const API_VERSION = '/v1';

// Mount public routes
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/products`, productRoutes);
router.use(`${API_VERSION}/categories`, categoryRoutes);
router.use(`${API_VERSION}/orders`, orderRoutes);
router.use(`${API_VERSION}/customers`, customerRoutes);
router.use(`${API_VERSION}/reviews`, reviewRoutes);
router.use(`${API_VERSION}/blogs`, blogRoutes);
router.use(`${API_VERSION}/measurements`, measurementRoutes);
router.use(`${API_VERSION}/upload`, uploadRoutes);

// Mount admin routes
router.use(`${API_VERSION}/analytics`, analyticsRoutes);
router.use(`${API_VERSION}/admin/dashboard`, dashboardRoutes);
router.use(`${API_VERSION}/admin/products`, adminProductRoutes);
router.use(`${API_VERSION}/admin/orders`, adminOrderRoutes);
router.use(`${API_VERSION}/admin/ai`, aiRoutes);
router.use(`${API_VERSION}/settings`, settingsRoutes);

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
      dashboard: '/api/v1/admin/dashboard',
      adminProducts: '/api/v1/admin/products',
      adminOrders: '/api/v1/admin/orders',
      ai: '/api/v1/admin/ai'
    }
  });
});

// 404 handler
router.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

module.exports = router;
```

---

## Admin Dashboard Routes & Controllers

### 1. Dashboard Routes (`backend/src/routes/dashboard.routes.js`)

```javascript
/**
 * Dashboard Routes
 * Routes for admin dashboard analytics
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const analyticsController = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// All dashboard routes require admin authentication
router.use(protect, adminOnly);

/**
 * @route GET /api/v1/admin/dashboard
 * @desc Get complete dashboard data
 * @access Private (Admin)
 */
router.get('/', dashboardController.getDashboard);

/**
 * @route GET /api/v1/admin/dashboard/revenue-trends
 * @desc Get revenue trends for chart
 * @access Private (Admin)
 */
router.get('/revenue-trends', analyticsController.getRevenueTrends);

/**
 * @route GET /api/v1/admin/dashboard/order-distribution
 * @desc Get order distribution by status
 * @access Private (Admin)
 */
router.get('/order-distribution', analyticsController.getOrderDistribution);

/**
 * @route GET /api/v1/admin/dashboard/top-products
 * @desc Get top performing products
 * @access Private (Admin)
 */
router.get('/top-products', analyticsController.getTopProducts);

/**
 * @route GET /api/v1/admin/dashboard/inventory-alerts
 * @desc Get low stock alerts
 * @access Private (Admin)
 */
router.get('/inventory-alerts', analyticsController.getInventoryAlerts);

/**
 * @route GET /api/v1/admin/dashboard/export
 * @desc Export dashboard data
 * @access Private (Admin)
 */
router.get('/export', dashboardController.exportDashboard);

module.exports = router;
```

### Dashboard Controller (`backend/src/controllers/dashboardController.js`)

```javascript
/**
 * Dashboard Controller
 * Unified dashboard endpoint that combines all analytics data
 */

const analyticsService = require('../services/analyticsService');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Get complete dashboard data
 * @route GET /api/admin/dashboard
 * @access Private (Admin)
 */
exports.getDashboard = async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;

    // Convert period to date range
    const dateRange = getDateRangeFromPeriod(period, startDate, endDate);

    // Fetch all dashboard data in parallel
    const [
      stats,
      revenueTrends,
      orderDistribution,
      popularProducts,
      recentOrders,
      lowStockAlerts,
      suitTypeSales
    ] = await Promise.all([
      getDashboardStats(dateRange),
      getRevenueTrends(dateRange),
      getOrderDistribution(dateRange),
      getPopularProducts(dateRange),
      getRecentOrders(10),
      getLowStockAlerts(),
      getSuitTypeSales(dateRange)
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats,
        revenueTrends,
        orderDistribution,
        popularProducts,
        recentOrders,
        lowStockAlerts,
        suitTypeSales,
        dateRange: {
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString(),
          period
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Export dashboard data
 * @route GET /api/admin/dashboard/export
 * @access Private (Admin)
 */
exports.exportDashboard = async (req, res) => {
  try {
    const { format = 'csv', period = 'month', startDate, endDate } = req.query;
    const dateRange = getDateRangeFromPeriod(period, startDate, endDate);

    // Fetch dashboard data
    const [
      stats,
      revenueTrends,
      orderDistribution,
      popularProducts,
      recentOrders,
      lowStockAlerts
    ] = await Promise.all([
      getDashboardStats(dateRange),
      getRevenueTrends(dateRange),
      getOrderDistribution(dateRange),
      getPopularProducts(dateRange),
      getRecentOrders(100),
      getLowStockAlerts(100)
    ]);

    if (format === 'csv') {
      return exportDashboardToCSV(res, {
        stats, revenueTrends, orderDistribution,
        popularProducts, recentOrders, lowStockAlerts
      }, period);
    }

    if (format === 'pdf') {
      const { generateDashboardPDF } = require('../utils/pdfGenerator');
      return await generateDashboardPDF(res, {
        stats, revenueTrends, orderDistribution,
        popularProducts, recentOrders, lowStockAlerts, dateRange
      }, period);
    }

    // JSON export (default)
    res.status(200).json({
      success: true,
      data: { stats, revenueTrends, orderDistribution, popularProducts, recentOrders, lowStockAlerts },
      exportedAt: new Date()
    });
  } catch (error) {
    logger.error('Error exporting dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export dashboard data'
    });
  }
};

/**
 * Get dashboard statistics
 */
async function getDashboardStats(dateRange) {
  const { startDate, endDate } = dateRange;
  
  // Previous period for comparison
  const periodDiff = endDate - startDate;
  const prevStartDate = new Date(startDate.getTime() - periodDiff);

  const [currentRevenue, previousRevenue, orderStats, customerStats, productStats] = await Promise.all([
    // Current period revenue
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          'payment.status': 'verified',
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.total' },
          count: { $sum: 1 },
          avg: { $avg: '$pricing.total' }
        }
      }
    ]),
    // Previous period revenue for comparison
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: prevStartDate, $lte: startDate },
          'payment.status': 'verified',
          status: { $ne: 'cancelled' }
        }
      },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]),
    // Order statistics by status
    Order.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    // Customer statistics
    User.aggregate([
      { $match: { role: 'customer', createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, newCustomers: { $sum: 1 } } }
    ]),
    // Product statistics
    Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: 1 }, lowStock: { $sum: { $cond: [{ $lte: ['$stock', 5] }, 1, 0] } } } }
    ])
  ]);

  return {
    revenue: {
      current: currentRevenue[0]?.total || 0,
      previous: previousRevenue[0]?.total || 0,
      growth: calculateGrowth(currentRevenue[0]?.total, previousRevenue[0]?.total)
    },
    orders: {
      total: currentRevenue[0]?.count || 0,
      avgValue: currentRevenue[0]?.avg || 0,
      byStatus: orderStats
    },
    customers: {
      newThisPeriod: customerStats[0]?.newCustomers || 0
    },
    products: {
      total: productStats[0]?.total || 0,
      lowStock: productStats[0]?.lowStock || 0
    }
  };
}

function calculateGrowth(current, previous) {
  if (!previous) return current > 0 ? 100 : 0;
  return ((current - previous) / previous * 100).toFixed(2);
}

function getDateRangeFromPeriod(period, startDate, endDate) {
  const end = endDate ? new Date(endDate) : new Date();
  let start;

  switch (period) {
    case 'week': start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000); break;
    case 'month': start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000); break;
    case 'quarter': start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000); break;
    case 'year': start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000); break;
    default: start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return { startDate: start, endDate: end };
}
```

---

### 2. Admin Product Routes (`backend/src/routes/adminProduct.routes.js`)

```javascript
/**
 * Admin Product Routes
 * Handles all admin product management endpoints
 * Mounted at: /api/v1/admin/products
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { uploadMultiple } = require('../middleware/upload.middleware');

// All routes require admin authentication
router.use(protect, adminOnly);

/**
 * @route   GET /api/v1/admin/products
 * @desc    Get all products for admin (with filters, search, pagination)
 * @access  Private (Admin)
 */
router.get('/', productController.getAllProductsAdmin);

/**
 * @route   POST /api/v1/admin/products
 * @desc    Create new product
 * @access  Private (Admin)
 */
router.post('/', uploadMultiple('images', 10), productController.createProductAdmin);

/**
 * @route   GET /api/v1/admin/products/:id/edit
 * @desc    Get product for editing
 * @access  Private (Admin)
 */
router.get('/:id/edit', productController.getProductById);

/**
 * @route   PUT /api/v1/admin/products/:id
 * @desc    Update existing product
 * @access  Private (Admin)
 */
router.put('/:id', uploadMultiple('images', 10), productController.updateProductAdmin);

/**
 * @route   DELETE /api/v1/admin/products/:id
 * @desc    Delete product
 * @access  Private (Admin)
 */
router.delete('/:id', productController.deleteProductAdmin);

/**
 * @route   DELETE /api/v1/admin/products/bulk-delete
 * @desc    Bulk delete products
 * @access  Private (Admin)
 */
router.delete('/bulk-delete', productController.bulkDeleteProducts);

/**
 * @route   PATCH /api/v1/admin/products/bulk-update
 * @desc    Bulk update products
 * @access  Private (Admin)
 */
router.patch('/bulk-update', productController.bulkUpdateProducts);

/**
 * @route   POST /api/v1/admin/products/:id/duplicate
 * @desc    Duplicate existing product
 * @access  Private (Admin)
 */
router.post('/:id/duplicate', productController.duplicateProduct);

/**
 * @route   GET /api/v1/admin/products/export
 * @desc    Export products to CSV
 * @access  Private (Admin)
 */
router.get('/export', productController.exportProducts);

module.exports = router;
```

### Product Controller (Admin Methods) (`backend/src/controllers/productController.js`)

```javascript
/**
 * Product Controller
 * Handles all product-related business logic
 */

const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const { generateSlug } = require('../utils/helpers');
const { deleteFromCloudinary } = require('../config/cloudinary');

/**
 * GET /api/v1/admin/products
 * Get all products for admin with advanced filtering
 */
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      search = '',
      category = '',
      status = '',
      stock = ''
    } = req.query;

    // Build filter - include all products for admin
    const filter = { isDeleted: { $ne: true } };

    // Search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) filter.category = category;

    // Status filter
    if (status) filter.status = status;

    // Stock filter
    if (stock === 'low') filter['availability.quantity'] = { $lte: 5 };
    if (stock === 'out') filter['availability.quantity'] = 0;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        productsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products', error: error.message });
  }
};

/**
 * POST /api/v1/admin/products
 * Create new product
 */
exports.createProductAdmin = async (req, res) => {
  try {
    const productData = req.body;

    // Generate unique slug
    productData.slug = await generateSlug(productData.title, Product);

    // Process uploaded images
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map((file, index) => ({
        url: file.path,
        publicId: file.filename,
        alt: `${productData.title} - Image ${index + 1}`,
        isPrimary: index === 0
      }));
    }

    const product = await Product.create(productData);
    await product.populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create product', error: error.message });
  }
};

/**
 * PUT /api/v1/admin/products/:id
 * Update existing product
 */
exports.updateProductAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Regenerate slug if title changed
    if (updates.title && updates.title !== product.title) {
      updates.slug = await generateSlug(updates.title, Product, id);
    }

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: file.path,
        publicId: file.filename,
        alt: `${updates.title || product.title} - Image ${index + 1}`
      }));
      updates.images = [...(product.images || []), ...newImages];
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
      .populate('category', 'name slug');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update product', error: error.message });
  }
};

/**
 * DELETE /api/v1/admin/products/:id
 * Soft delete product
 */
exports.deleteProductAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date(),
      isActive: false
    }, { new: true });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete product', error: error.message });
  }
};

/**
 * DELETE /api/v1/admin/products/bulk-delete
 * Bulk delete products
 */
exports.bulkDeleteProducts = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Product IDs required' });
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { isDeleted: true, deletedAt: new Date(), isActive: false }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} products deleted successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Bulk delete failed', error: error.message });
  }
};

/**
 * POST /api/v1/admin/products/:id/duplicate
 * Duplicate product
 */
exports.duplicateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const original = await Product.findById(id).lean();
    if (!original) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Remove unique fields and create copy
    delete original._id;
    delete original.createdAt;
    delete original.updatedAt;
    original.title = `${original.title} (Copy)`;
    original.slug = await generateSlug(original.title, Product);
    original.sku = `${original.sku}-COPY-${Date.now()}`;
    original.status = 'draft';

    const duplicated = await Product.create(original);

    res.status(201).json({
      success: true,
      message: 'Product duplicated successfully',
      data: duplicated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to duplicate product', error: error.message });
  }
};
```

---

### 3. Admin Order Routes (`backend/src/routes/adminOrder.routes.js`)

```javascript
/**
 * Admin Order Routes
 * Handles all admin order management endpoints
 * Mounted at: /api/v1/admin/orders
 */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// All routes require admin authentication
router.use(protect, adminOnly);

/**
 * @route   GET /api/v1/admin/orders
 * @desc    Get all orders for admin
 * @access  Private (Admin)
 */
router.get('/', orderController.getAllOrdersAdmin);

/**
 * @route   GET /api/v1/admin/orders/:id
 * @desc    Get order by ID for admin
 * @access  Private (Admin)
 */
router.get('/:id', orderController.getOrderByIdAdmin);

/**
 * @route   PUT /api/v1/admin/orders/:id/status
 * @desc    Update order status
 * @access  Private (Admin)
 */
router.put('/:id/status', orderController.updateOrderStatusAdmin);

/**
 * @route   POST /api/v1/admin/orders/:id/verify-payment
 * @desc    Verify payment
 * @access  Private (Admin)
 */
router.post('/:id/verify-payment', orderController.verifyPaymentAdmin);

/**
 * @route   POST /api/v1/admin/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private (Admin)
 */
router.post('/:id/cancel', orderController.cancelOrderAdmin);

/**
 * @route   POST /api/v1/admin/orders/:id/refund
 * @desc    Process refund
 * @access  Private (Admin)
 */
router.post('/:id/refund', orderController.processRefundAdmin);

/**
 * @route   POST /api/v1/admin/orders/:id/notes
 * @desc    Add internal note
 * @access  Private (Admin)
 */
router.post('/:id/notes', orderController.addAdminNote);

/**
 * @route   PUT /api/v1/admin/orders/:id/shipping-address
 * @desc    Update shipping address
 * @access  Private (Admin)
 */
router.put('/:id/shipping-address', orderController.updateShippingAddressAdmin);

/**
 * @route   PUT /api/v1/admin/orders/:id/tracking
 * @desc    Update tracking information
 * @access  Private (Admin)
 */
router.put('/:id/tracking', orderController.updateTrackingAdmin);

/**
 * @route   GET /api/v1/admin/orders/:id/invoice
 * @desc    Generate and download invoice PDF
 * @access  Private (Admin)
 */
router.get('/:id/invoice', orderController.downloadInvoiceAdmin);

/**
 * @route   POST /api/v1/admin/orders/:id/notify
 * @desc    Send notification (email/WhatsApp)
 * @access  Private (Admin)
 */
router.post('/:id/notify', orderController.sendNotificationAdmin);

/**
 * @route   GET /api/v1/admin/orders/export
 * @desc    Export orders to CSV
 * @access  Private (Admin)
 */
router.get('/export', orderController.exportOrdersAdmin);

module.exports = router;
```

### Order Controller (Admin Methods) (`backend/src/controllers/orderController.js`)

```javascript
/**
 * Order Controller - Admin Methods
 */

const Order = require('../models/Order');
const User = require('../models/User');
const notificationService = require('../services/notificationService');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const logger = require('../utils/logger');

/**
 * GET /api/v1/admin/orders
 * Get all orders for admin
 */
exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      status = '',
      paymentStatus = '',
      search = '',
      startDate,
      endDate
    } = req.query;

    const filter = {};

    // Status filter
    if (status) filter.status = status;

    // Payment status filter
    if (paymentStatus) filter['payment.status'] = paymentStatus;

    // Search by order number or customer
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
        { 'customerInfo.email': { $regex: search, $options: 'i' } }
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customer', 'fullName email phone')
        .populate('items.product', 'title images sku')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalOrders: total
      }
    });
  } catch (error) {
    logger.error('Error fetching admin orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

/**
 * PUT /api/v1/admin/orders/:id/status
 * Update order status
 */
exports.updateOrderStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Update status
    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: req.user._id,
      note: note || `Status updated to ${status}`
    });

    await order.save();

    // Send notification to customer
    try {
      await notificationService.sendOrderStatusUpdate(order);
    } catch (notifyError) {
      logger.error('Failed to send status notification:', notifyError);
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    logger.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
};

/**
 * POST /api/v1/admin/orders/:id/verify-payment
 * Verify payment
 */
exports.verifyPaymentAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified, note, transactionId } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.payment.status = verified ? 'verified' : 'rejected';
    order.payment.verifiedAt = new Date();
    order.payment.verifiedBy = req.user._id;
    if (transactionId) order.payment.transactionId = transactionId;

    if (verified) {
      order.status = 'processing';
      order.statusHistory.push({
        status: 'processing',
        timestamp: new Date(),
        updatedBy: req.user._id,
        note: note || 'Payment verified, order is now processing'
      });
    }

    await order.save();

    // Notify customer
    await notificationService.sendPaymentVerification(order, verified);

    res.status(200).json({
      success: true,
      message: verified ? 'Payment verified successfully' : 'Payment rejected',
      data: order
    });
  } catch (error) {
    logger.error('Error verifying payment:', error);
    res.status(500).json({ success: false, message: 'Failed to verify payment' });
  }
};

/**
 * GET /api/v1/admin/orders/:id/invoice
 * Generate invoice PDF
 */
exports.downloadInvoiceAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('customer', 'fullName email phone')
      .populate('items.product', 'title sku');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await generateInvoicePDF(res, order);
  } catch (error) {
    logger.error('Error generating invoice:', error);
    res.status(500).json({ success: false, message: 'Failed to generate invoice' });
  }
};
```

---

### 4. Category Routes (`backend/src/routes/category.routes.js`)

```javascript
/**
 * Category Routes
 * Handles category management
 * Mounted at: /api/v1/categories
 */

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/v1/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', categoryController.getAllCategories);

/**
 * @route   GET /api/v1/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * @route   GET /api/v1/categories/slug/:slug
 * @desc    Get category by slug
 * @access  Public
 */
router.get('/slug/:slug', categoryController.getCategoryBySlug);

// ==================== ADMIN ROUTES ====================

/**
 * @route   POST /api/v1/categories
 * @desc    Create new category
 * @access  Private (Admin)
 */
router.post('/', protect, adminOnly, uploadSingle('image'), categoryController.createCategory);

/**
 * @route   PUT /api/v1/categories/:id
 * @desc    Update category
 * @access  Private (Admin)
 */
router.put('/:id', protect, adminOnly, uploadSingle('image'), categoryController.updateCategory);

/**
 * @route   DELETE /api/v1/categories/:id
 * @desc    Delete category
 * @access  Private (Admin)
 */
router.delete('/:id', protect, adminOnly, categoryController.deleteCategory);

module.exports = router;
```

### Category Controller (`backend/src/controllers/categoryController.js`)

```javascript
/**
 * Category Controller
 */

const Category = require('../models/Category');
const Product = require('../models/Product');
const { generateSlug } = require('../utils/helpers');

/**
 * GET /api/v1/categories
 * Get all categories
 */
exports.getAllCategories = async (req, res) => {
  try {
    const { includeInactive = 'false', includeProductCount = 'true' } = req.query;

    const filter = {};
    if (includeInactive !== 'true') filter.isActive = true;

    const categories = await Category.find(filter)
      .populate('parentCategory', 'name slug')
      .sort('displayOrder name')
      .lean();

    if (includeProductCount === 'true') {
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const productCount = await Product.countDocuments({
            category: category._id,
            availability: { $ne: 'deleted' }
          });
          return { ...category, productCount };
        })
      );
      return res.status(200).json({ success: true, data: categoriesWithCount });
    }

    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories', error: error.message });
  }
};

/**
 * POST /api/v1/categories
 * Create new category
 */
exports.createCategory = async (req, res) => {
  try {
    const { name, description, parentCategory, isActive, displayOrder } = req.body;

    // Generate slug
    const slug = await generateSlug(name, Category);

    const categoryData = {
      name,
      slug,
      description,
      parentCategory: parentCategory || null,
      isActive: isActive !== false,
      displayOrder: displayOrder || 0
    };

    // Handle image upload
    if (req.file) {
      categoryData.image = {
        url: req.file.path,
        publicId: req.file.filename
      };
    }

    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create category', error: error.message });
  }
};

/**
 * PUT /api/v1/categories/:id
 * Update category
 */
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Regenerate slug if name changed
    if (updates.name && updates.name !== category.name) {
      updates.slug = await generateSlug(updates.name, Category, id);
    }

    // Handle image upload
    if (req.file) {
      updates.image = {
        url: req.file.path,
        publicId: req.file.filename
      };
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update category', error: error.message });
  }
};

/**
 * DELETE /api/v1/categories/:id
 * Delete category
 */
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has products
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${productCount} products. Move products first.`
      });
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete category', error: error.message });
  }
};
```

---

### 5. AI Content Routes (`backend/src/routes/aiRoutes.js`)

```javascript
/**
 * AI Routes
 * Routes for AI-powered content generation
 * Mounted at: /api/v1/admin/ai
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// All routes require admin authentication
router.use(protect, adminOnly);

/**
 * @route   GET /api/v1/admin/ai/status
 * @desc    Check AI service configuration status
 * @access  Private (Admin)
 */
router.get('/status', aiController.getStatus);

/**
 * @route   POST /api/v1/admin/ai/generate-description
 * @desc    Generate product description from title
 * @access  Private (Admin)
 */
router.post('/generate-description', aiController.generateDescription);

/**
 * @route   POST /api/v1/admin/ai/generate-keywords
 * @desc    Generate SEO keywords from product info
 * @access  Private (Admin)
 */
router.post('/generate-keywords', aiController.generateKeywords);

/**
 * @route   POST /api/v1/admin/ai/generate-complete
 * @desc    Generate complete product content
 * @access  Private (Admin)
 */
router.post('/generate-complete', aiController.generateCompleteContent);

/**
 * @route   POST /api/v1/admin/ai/save-draft
 * @desc    Save AI-generated content as draft
 * @access  Private (Admin)
 */
router.post('/save-draft', aiController.saveDraft);

module.exports = router;
```

### AI Controller (`backend/src/controllers/aiController.js`)

```javascript
/**
 * AI Controller
 * Handles AI-powered content generation
 */

const aiService = require('../services/aiService');
const { rateLimiterService } = require('../services/rateLimiterService');

/**
 * Check rate limit
 */
const checkRateLimit = async (userId) => {
  try {
    const result = await rateLimiterService.checkLimit(userId, 'ai');
    return {
      allowed: result.allowed,
      remaining: result.remaining,
      resetIn: result.resetIn
    };
  } catch (error) {
    return { allowed: true, remaining: 10, resetIn: 60 };
  }
};

/**
 * GET /api/v1/admin/ai/status
 * Check AI service status
 */
exports.getStatus = async (req, res) => {
  try {
    const config = aiService.checkConfiguration();
    const testResult = await aiService.testConnection();

    res.status(200).json({
      success: true,
      data: {
        configured: config.configured,
        providers: config.providers,
        activeProvider: config.activeProvider,
        connectionTest: testResult
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to check AI status' });
  }
};

/**
 * POST /api/v1/admin/ai/generate-description
 * Generate product description
 */
exports.generateDescription = async (req, res) => {
  try {
    const userId = req.user?.id || req.ip;

    // Check rate limit
    const rateLimit = await checkRateLimit(userId);
    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please wait.',
        retryAfter: rateLimit.resetIn
      });
    }

    const { title, category, fabricType, occasion } = req.body;

    if (!title || title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Product title is required (minimum 3 characters)'
      });
    }

    const result = await aiService.generateProductDescription({
      title, category, fabricType, occasion
    });

    res.status(200).json({
      success: true,
      message: 'Description generated successfully',
      data: result.data,
      provider: result.provider,
      rateLimit: { remaining: rateLimit.remaining }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate description',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/v1/admin/ai/generate-keywords
 * Generate SEO keywords
 */
exports.generateKeywords = async (req, res) => {
  try {
    const userId = req.user?.id || req.ip;
    const rateLimit = await checkRateLimit(userId);

    if (!rateLimit.allowed) {
      return res.status(429).json({ success: false, message: 'Rate limit exceeded' });
    }

    const { title, description, category, fabricType } = req.body;

    if (!title || title.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Product title required' });
    }

    const result = await aiService.generateSEOKeywords({ title, description, category, fabricType });

    res.status(200).json({
      success: true,
      message: 'Keywords generated successfully',
      data: result.data,
      provider: result.provider
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate keywords' });
  }
};

/**
 * POST /api/v1/admin/ai/generate-complete
 * Generate complete product content
 */
exports.generateCompleteContent = async (req, res) => {
  try {
    const userId = req.user?.id || req.ip;
    const rateLimit = await checkRateLimit(userId);

    if (!rateLimit.allowed) {
      return res.status(429).json({ success: false, message: 'Rate limit exceeded' });
    }

    const { title, category, fabricType, occasion, priceRange } = req.body;

    if (!title || title.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Product title required' });
    }

    const result = await aiService.generateCompleteProductContent({
      title, category, fabricType, occasion, priceRange
    });

    res.status(200).json({
      success: true,
      message: 'Complete content generated successfully',
      data: result.data,
      provider: result.provider,
      generatedAt: result.generatedAt
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate content' });
  }
};
```

---

## API Endpoints Summary

### Dashboard Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/admin/dashboard` | Get dashboard data | Admin |
| GET | `/api/v1/admin/dashboard/revenue-trends` | Revenue chart data | Admin |
| GET | `/api/v1/admin/dashboard/order-distribution` | Order status distribution | Admin |
| GET | `/api/v1/admin/dashboard/top-products` | Top selling products | Admin |
| GET | `/api/v1/admin/dashboard/inventory-alerts` | Low stock alerts | Admin |
| GET | `/api/v1/admin/dashboard/export` | Export dashboard data | Admin |

### Product Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/admin/products` | List all products | Admin |
| POST | `/api/v1/admin/products` | Create product | Admin |
| GET | `/api/v1/admin/products/:id/edit` | Get product for editing | Admin |
| PUT | `/api/v1/admin/products/:id` | Update product | Admin |
| DELETE | `/api/v1/admin/products/:id` | Delete product | Admin |
| DELETE | `/api/v1/admin/products/bulk-delete` | Bulk delete products | Admin |
| PATCH | `/api/v1/admin/products/bulk-update` | Bulk update products | Admin |
| POST | `/api/v1/admin/products/:id/duplicate` | Duplicate product | Admin |
| GET | `/api/v1/admin/products/export` | Export products CSV | Admin |

### Order Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/admin/orders` | List all orders | Admin |
| GET | `/api/v1/admin/orders/:id` | Get order details | Admin |
| PUT | `/api/v1/admin/orders/:id/status` | Update order status | Admin |
| POST | `/api/v1/admin/orders/:id/verify-payment` | Verify payment | Admin |
| POST | `/api/v1/admin/orders/:id/cancel` | Cancel order | Admin |
| POST | `/api/v1/admin/orders/:id/refund` | Process refund | Admin |
| POST | `/api/v1/admin/orders/:id/notes` | Add admin note | Admin |
| PUT | `/api/v1/admin/orders/:id/tracking` | Update tracking | Admin |
| GET | `/api/v1/admin/orders/:id/invoice` | Download invoice PDF | Admin |
| GET | `/api/v1/admin/orders/export` | Export orders CSV | Admin |

### Category Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/categories` | List all categories | Public |
| GET | `/api/v1/categories/:id` | Get category by ID | Public |
| POST | `/api/v1/categories` | Create category | Admin |
| PUT | `/api/v1/categories/:id` | Update category | Admin |
| DELETE | `/api/v1/categories/:id` | Delete category | Admin |

### AI Content Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/admin/ai/status` | Check AI service status | Admin |
| POST | `/api/v1/admin/ai/generate-description` | Generate description | Admin |
| POST | `/api/v1/admin/ai/generate-keywords` | Generate SEO keywords | Admin |
| POST | `/api/v1/admin/ai/generate-complete` | Generate complete content | Admin |
| POST | `/api/v1/admin/ai/save-draft` | Save generated draft | Admin |

---

## Authentication Middleware

```javascript
// backend/src/middleware/auth.middleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - Verify JWT token
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, token invalid'
    });
  }
};

/**
 * Admin only middleware
 */
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};
```

---

## Submission Checklist

- [x] Dashboard routes with analytics endpoints
- [x] Dashboard controller with stats, trends, and exports
- [x] Admin product routes (CRUD, bulk operations)
- [x] Product controller with create, update, delete
- [x] Admin order routes (status, payment, shipping)
- [x] Order controller with management functions
- [x] Category routes and controller
- [x] AI content generation routes and controller
- [x] Authentication middleware (protect, adminOnly)
- [x] API endpoints summary table
- [x] Code documentation
