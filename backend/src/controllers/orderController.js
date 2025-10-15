// backend/src/controllers/orderController.js

const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const orderService = require('../services/orderService');
const notificationService = require('../services/notificationService');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const logger = require('../utils/logger');

/**
 * Create a new order
 * @route POST /api/orders
 * @access Private (Customer)
 */
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      payment,
      customerInfo,
      specialInstructions
    } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    if (!shippingAddress || !shippingAddress.fullAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    // Validate payment method
    const validPaymentMethods = ['bank-transfer', 'jazzcash', 'easypaisa', 'cod'];
    if (!payment?.method || !validPaymentMethods.includes(payment.method)) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment method is required (bank-transfer, jazzcash, easypaisa, or cod)'
      });
    }

    // For COD, validate 50% advance payment receipt
    if (payment.method === 'cod' && !payment.receiptImage) {
      return res.status(400).json({
        success: false,
        message: 'COD orders require 50% advance payment with receipt upload'
      });
    }

    // Calculate pricing and validate items
    const orderItems = await orderService.validateAndProcessItems(items);
    const pricing = orderService.calculateOrderPricing(orderItems, shippingAddress.city);

    // For COD, validate advance payment amount
    if (payment.method === 'cod') {
      const requiredAdvance = pricing.total * 0.5;
      if (!payment.advanceAmount || payment.advanceAmount < requiredAdvance) {
        return res.status(400).json({
          success: false,
          message: `COD requires 50% advance payment (PKR ${requiredAdvance.toFixed(2)})`
        });
      }
    }

    // Generate unique order number
    const orderNumber = await orderService.generateOrderNumber();

    // Prepare order data
    const orderData = {
      orderNumber,
      customer: req.user._id,
      customerInfo: customerInfo || {
        name: req.user.fullName,
        email: req.user.email,
        phone: req.user.phone,
        whatsapp: req.user.whatsapp || req.user.phone
      },
      items: orderItems,
      shippingAddress,
      payment: {
        method: payment.method,
        status: 'pending',
        receiptImage: payment.receiptImage || null,
        transactionId: payment.transactionId || null,
        transactionDate: payment.transactionDate || new Date(),
        advanceAmount: payment.method === 'cod' ? payment.advanceAmount : null,
        remainingAmount: payment.method === 'cod' ? (pricing.total - payment.advanceAmount) : null
      },
      pricing,
      status: 'pending-payment',
      statusHistory: [{
        status: 'pending-payment',
        timestamp: new Date(),
        note: 'Order received, awaiting payment verification'
      }],
      estimatedCompletion: orderService.calculateEstimatedDelivery(orderItems),
      specialInstructions
    };

    // Create order
    const order = await Order.create(orderData);

    // Populate order details
    await order.populate('customer', 'fullName email phone whatsapp');
    await order.populate('items.product', 'title images sku');

    // Send confirmation notifications
    await notificationService.sendOrderConfirmation(order);

    // Notify admin about new order
    await notificationService.notifyAdminNewOrder(order);

    // Log order creation
    logger.info(`Order created successfully: ${orderNumber}`, {
      orderId: order._id,
      customer: req.user.email,
      total: pricing.total
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        order,
        trackingUrl: `/track-order/${orderNumber}`
      }
    });

  } catch (error) {
    logger.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all orders (Customer: own orders, Admin: all orders)
 * @route GET /api/orders
 * @access Private
 */
exports.getOrders = async (req, res) => {
  try {
    const {
      status,
      paymentStatus,
      dateFrom,
      dateTo,
      search,
      page = 1,
      limit = 10,
      sortBy = '-createdAt'
    } = req.query;

    // Build query
    let query = {};

    // If customer, only show their orders
    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by payment status
    if (paymentStatus) {
      query['payment.status'] = paymentStatus;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Search by order number or customer name
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
        { 'customerInfo.phone': { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('customer', 'fullName email phone whatsapp')
        .populate('items.product', 'title images sku')
        .sort(sortBy)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(query)
    ]);

    // Calculate stats for admin
    let stats = null;
    if (req.user.role === 'admin') {
      stats = await orderService.getOrderStats();
    }

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        },
        stats
      }
    });

  } catch (error) {
    logger.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get single order by ID
 * @route GET /api/orders/:id
 * @access Private
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'fullName email phone whatsapp profileImage')
      .populate('items.product', 'title images sku category')
      .populate('statusHistory.updatedBy', 'fullName')
      .populate('notes.addedBy', 'fullName');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization (customers can only view their own orders)
    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      data: { order }
    });

  } catch (error) {
    logger.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Track order by order number (Public access)
 * @route GET /api/orders/track/:orderNumber
 * @access Public
 */
exports.trackOrder = async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const order = await Order.findOne({ orderNumber })
      .select('orderNumber status statusHistory estimatedCompletion actualCompletion tracking payment.status')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found. Please check your order number.'
      });
    }

    // Format status history for timeline display
    const timeline = order.statusHistory.map(status => ({
      status: status.status,
      timestamp: status.timestamp,
      note: status.note,
      isComplete: true
    }));

    res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        currentStatus: order.status,
        paymentStatus: order.payment.status,
        timeline,
        estimatedCompletion: order.estimatedCompletion,
        actualCompletion: order.actualCompletion,
        tracking: order.tracking
      }
    });

  } catch (error) {
    logger.error('Error tracking order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Verify payment (Admin only)
 * @route PUT /api/orders/:id/verify-payment
 * @access Private (Admin)
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { approved, rejectionReason, notes } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if payment is already verified
    if (order.payment.status === 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Payment already verified'
      });
    }

    if (approved) {
      // Approve payment
      order.payment.status = 'verified';
      order.payment.verifiedBy = req.user._id;
      order.payment.verifiedAt = new Date();
      
      // Update order status
      order.status = 'payment-verified';
      order.statusHistory.push({
        status: 'payment-verified',
        timestamp: new Date(),
        note: 'Payment verified by admin',
        updatedBy: req.user._id
      });

      // Add admin note if provided
      if (notes) {
        order.notes.push({
          text: `Payment Verification: ${notes}`,
          addedBy: req.user._id,
          timestamp: new Date()
        });
      }

      await order.save();

      // Send confirmation to customer
      await notificationService.sendPaymentVerified(order);

      logger.info(`Payment verified for order ${order.orderNumber}`, {
        orderId: order._id,
        verifiedBy: req.user.email
      });

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: { order }
      });

    } else {
      // Reject payment
      order.payment.status = 'failed';
      order.status = 'payment-failed';
      order.statusHistory.push({
        status: 'payment-failed',
        timestamp: new Date(),
        note: rejectionReason || 'Payment verification failed',
        updatedBy: req.user._id
      });

      if (rejectionReason) {
        order.notes.push({
          text: `Payment Rejected: ${rejectionReason}`,
          addedBy: req.user._id,
          timestamp: new Date()
        });
      }

      await order.save();

      // Notify customer about rejection
      await notificationService.sendPaymentRejected(order, rejectionReason);

      logger.warn(`Payment rejected for order ${order.orderNumber}`, {
        orderId: order._id,
        reason: rejectionReason,
        rejectedBy: req.user.email
      });

      res.json({
        success: true,
        message: 'Payment verification declined',
        data: { order }
      });
    }

  } catch (error) {
    logger.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update order status (Admin only)
 * @route PUT /api/orders/:id/status
 * @access Private (Admin)
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note, assignedTailor, trackingInfo } = req.body;

    // Valid status transitions
    const validStatuses = [
      'pending-payment',
      'payment-verified',
      'fabric-arranged',
      'stitching-in-progress',
      'quality-check',
      'ready-for-dispatch',
      'out-for-delivery',
      'delivered',
      'cancelled'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
        validStatuses
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Prevent status updates if payment not verified (except cancellation)
    if (order.payment.status !== 'verified' && status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update status until payment is verified'
      });
    }

    // Update status
    const previousStatus = order.status;
    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated from ${previousStatus} to ${status}`,
      updatedBy: req.user._id
    });

    // If delivered, set actual completion date
    if (status === 'delivered') {
      order.actualCompletion = new Date();
    }

    // Assign tailor if provided
    if (assignedTailor) {
      order.assignedTailor = assignedTailor;
    }

    // Update tracking info if provided
    if (trackingInfo && status === 'out-for-delivery') {
      order.tracking = {
        ...order.tracking,
        ...trackingInfo,
        dispatchDate: trackingInfo.dispatchDate || new Date()
      };
    }

    await order.save();

    // Send status update notification
    await notificationService.sendStatusUpdate(order, previousStatus);

    logger.info(`Order status updated: ${order.orderNumber}`, {
      orderId: order._id,
      previousStatus,
      newStatus: status,
      updatedBy: req.user.email
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });

  } catch (error) {
    logger.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Add admin note to order (Admin only)
 * @route POST /api/orders/:id/notes
 * @access Private (Admin)
 */
exports.addAdminNote = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Note text is required'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.notes.push({
      text: text.trim(),
      addedBy: req.user._id,
      timestamp: new Date()
    });

    await order.save();

    res.json({
      success: true,
      message: 'Note added successfully',
      data: { notes: order.notes }
    });

  } catch (error) {
    logger.error('Error adding admin note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Cancel order (Customer before processing, Admin anytime)
 * @route PUT /api/orders/:id/cancel
 * @access Private
 */
exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (req.user.role === 'customer') {
      if (order.customer.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to cancel this order'
        });
      }

      // Customers can only cancel before processing starts
      const nonCancellableStatuses = [
        'stitching-in-progress',
        'quality-check',
        'ready-for-dispatch',
        'out-for-delivery',
        'delivered'
      ];

      if (nonCancellableStatuses.includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel order after stitching has started. Please contact support.'
        });
      }
    }

    // Already cancelled
    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    // Cancel order
    order.status = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: reason || 'Order cancelled by ' + (req.user.role === 'admin' ? 'admin' : 'customer'),
      updatedBy: req.user._id
    });

    await order.save();

    // Send cancellation notification
    await notificationService.sendOrderCancellation(order, reason);

    logger.info(`Order cancelled: ${order.orderNumber}`, {
      orderId: order._id,
      cancelledBy: req.user.email,
      reason
    });

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });

  } catch (error) {
    logger.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Generate and download invoice (Customer: own orders, Admin: all)
 * @route GET /api/orders/:id/invoice
 * @access Private
 */
exports.downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'fullName email phone')
      .populate('items.product', 'title sku');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this invoice'
      });
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(order);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);

    logger.info(`Invoice downloaded: ${order.orderNumber}`, {
      orderId: order._id,
      downloadedBy: req.user.email
    });

  } catch (error) {
    logger.error('Error generating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get order statistics (Admin only)
 * @route GET /api/orders/analytics/stats
 * @access Private (Admin)
 */
exports.getOrderStatistics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    const stats = await orderService.getDetailedStats(period);

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    logger.error('Error fetching order statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};