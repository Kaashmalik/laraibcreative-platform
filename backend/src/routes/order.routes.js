// backend/src/routes/order.routes.js

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const { body, param, query } = require('express-validator');

/**
 * Validation schemas
 */

// Create order validation
const createOrderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.product').isMongoId().withMessage('Invalid product ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.isCustom').optional().isBoolean(),
  body('items.*.measurements').optional().isObject(),
  body('items.*.referenceImages').optional().isArray(),
  body('items.*.specialInstructions').optional().isString().trim(),
  body('items.*.fabric').optional().isString().trim(),
  
  body('shippingAddress.fullAddress').notEmpty().withMessage('Full address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.province').notEmpty().withMessage('Province is required'),
  body('shippingAddress.postalCode').optional().isPostalCode('any'),
  body('shippingAddress.phone').notEmpty().withMessage('Contact phone is required'),
  
  body('payment.method').isIn(['bank-transfer', 'jazzcash', 'easypaisa', 'cod'])
    .withMessage('Invalid payment method'),
  body('payment.receiptImage').optional().isURL().withMessage('Invalid receipt image URL'),
  body('payment.transactionId').optional().isString().trim(),
  body('payment.transactionDate').optional().isISO8601(),
  body('payment.advanceAmount').optional().isFloat({ min: 0 }),
  
  body('customerInfo.name').optional().notEmpty().withMessage('Customer name is required'),
  body('customerInfo.email').optional().isEmail().withMessage('Invalid email'),
  body('customerInfo.phone').optional().isMobilePhone('any'),
  body('customerInfo.whatsapp').optional().isMobilePhone('any')
];

// Update status validation
const updateStatusValidation = [
  body('status').isIn([
    'pending-payment',
    'payment-verified',
    'fabric-arranged',
    'stitching-in-progress',
    'quality-check',
    'ready-for-dispatch',
    'out-for-delivery',
    'delivered',
    'cancelled'
  ]).withMessage('Invalid status'),
  body('note').optional().isString().trim(),
  body('assignedTailor').optional().isString().trim(),
  body('trackingInfo.courierService').optional().isString().trim(),
  body('trackingInfo.trackingNumber').optional().isString().trim(),
  body('trackingInfo.dispatchDate').optional().isISO8601()
];

// Verify payment validation
const verifyPaymentValidation = [
  body('approved').isBoolean().withMessage('Approval status is required'),
  body('rejectionReason').optional().isString().trim(),
  body('notes').optional().isString().trim()
];

// Add note validation
const addNoteValidation = [
  body('text').notEmpty().trim().withMessage('Note text is required')
    .isLength({ min: 3, max: 1000 }).withMessage('Note must be between 3 and 1000 characters')
];

// Cancel order validation
const cancelOrderValidation = [
  body('reason').optional().isString().trim()
    .isLength({ max: 500 }).withMessage('Reason must not exceed 500 characters')
];

// Query validation for listing orders
const listOrdersValidation = [
  query('status').optional().isString(),
  query('paymentStatus').optional().isIn(['pending', 'verified', 'failed']),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601(),
  query('search').optional().isString().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sortBy').optional().isString()
];

/**
 * Public Routes
 */

// Track order by order number (no authentication required)
router.get(
  '/track/:orderNumber',
  param('orderNumber').matches(/^LC-\d{4}-\d+$/).withMessage('Invalid order number format'),
  validateRequest,
  orderController.trackOrder
);

/**
 * Customer Routes (Authenticated)
 */

// Create new order
router.post(
  '/',
  authenticate,
  createOrderValidation,
  validateRequest,
  orderController.createOrder
);

// Get user's orders (or all orders for admin)
router.get(
  '/',
  authenticate,
  listOrdersValidation,
  validateRequest,
  orderController.getOrders
);

// Get single order by ID
router.get(
  '/:id',
  authenticate,
  param('id').isMongoId().withMessage('Invalid order ID'),
  validateRequest,
  orderController.getOrderById
);

// Cancel order (customer can cancel before processing, admin anytime)
router.put(
  '/:id/cancel',
  authenticate,
  param('id').isMongoId().withMessage('Invalid order ID'),
  cancelOrderValidation,
  validateRequest,
  orderController.cancelOrder
);

// Download invoice
router.get(
  '/:id/invoice',
  authenticate,
  param('id').isMongoId().withMessage('Invalid order ID'),
  validateRequest,
  orderController.downloadInvoice
);

/**
 * Admin-Only Routes
 */

// Verify payment
router.put(
  '/:id/verify-payment',
  authenticate,
  requireAdmin,
  param('id').isMongoId().withMessage('Invalid order ID'),
  verifyPaymentValidation,
  validateRequest,
  orderController.verifyPayment
);

// Update order status
router.put(
  '/:id/status',
  authenticate,
  requireAdmin,
  param('id').isMongoId().withMessage('Invalid order ID'),
  updateStatusValidation,
  validateRequest,
  orderController.updateOrderStatus
);

// Add admin note
router.post(
  '/:id/notes',
  authenticate,
  requireAdmin,
  param('id').isMongoId().withMessage('Invalid order ID'),
  addNoteValidation,
  validateRequest,
  orderController.addAdminNote
);

// Get order statistics
router.get(
  '/analytics/stats',
  authenticate,
  requireAdmin,
  query('period').optional().isIn(['day', 'week', 'month', 'year']),
  validateRequest,
  orderController.getOrderStatistics
);

/**
 * Error handling middleware for this router
 */
router.use((error, req, res, next) => {
  console.error('Order route error:', error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'An error occurred in order processing',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

module.exports = router;