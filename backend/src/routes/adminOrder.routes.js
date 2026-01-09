/**
 * Admin Order Routes
 * Handles all admin order management endpoints
 * 
 * All routes require admin authentication
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
 * @desc    Get all orders for admin (with advanced filters, search, pagination)
 * @access  Private (Admin)
 */
router.get('/', orderController.getAllOrdersAdmin);

/**
 * @route   GET /api/v1/admin/orders/export
 * @desc    Export orders to CSV
 * @access  Private (Admin)
 */
router.get('/export', orderController.exportOrdersAdmin);

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
 * @desc    Cancel order (admin)
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

module.exports = router;

