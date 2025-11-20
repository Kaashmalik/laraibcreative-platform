/**
 * Order Routes
 * Routes for order management
 * 
 * @module routes/order.routes
 */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');

/**
 * @route POST /api/v1/orders
 * @desc Create a new order (supports guest checkout)
 * @access Public (optional auth for logged-in users)
 */
router.post(
  '/',
  optionalAuth, // Allow guest checkout
  orderController.createOrder
);

/**
 * @route GET /api/v1/orders
 * @desc Get all orders (Customer: own orders, Admin: all orders)
 * @access Private
 */
router.get(
  '/',
  authenticate,
  orderController.getOrders
);

/**
 * @route GET /api/v1/orders/:id
 * @desc Get order by ID
 * @access Private
 */
router.get(
  '/:id',
  authenticate,
  orderController.getOrderById
);

/**
 * @route PUT /api/v1/orders/:id/status
 * @desc Update order status
 * @access Private (Admin)
 */
router.put(
  '/:id/status',
  authenticate,
  orderController.updateOrderStatus
);

/**
 * @route GET /api/v1/orders/track/:orderNumber
 * @desc Track order by order number
 * @access Public
 */
router.get(
  '/track/:orderNumber',
  orderController.trackOrder
);

/**
 * @route POST /api/v1/orders/:id/cancel
 * @desc Cancel order
 * @access Private
 */
router.post(
  '/:id/cancel',
  authenticate,
  orderController.cancelOrder
);

/**
 * @route GET /api/v1/orders/:id/invoice
 * @desc Download order invoice
 * @access Private
 */
router.get(
  '/:id/invoice',
  authenticate,
  orderController.downloadInvoice
);

module.exports = router;
