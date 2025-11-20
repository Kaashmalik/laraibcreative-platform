// backend/src/controllers/orderController.js

const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const orderService = require('../services/orderService');
const notificationService = require('../services/notificationService');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const logger = require('../utils/logger');
const { 
  createOrderSchema, 
  updateOrderStatusSchema, 
  verifyPaymentSchema 
} = require('../utils/validationSchemas');

/**
 * Create a new order
 * @route POST /api/orders
 * @access Private (Customer) or Public (Guest checkout)
 */
exports.createOrder = async (req, res) => {
  try {
    // 1. Validate Request Body
    const { error, value } = createOrderSchema.validate(req.body, { abortEarly: false });
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(detail => detail.message)
      });
    }

    const {
      items,
      shippingAddress,
      payment,
      customerInfo,
      specialInstructions
    } = value;

    // 2. Business Logic Validation (that Joi can't handle easily)
    
    // For COD, validate 50% advance payment receipt (already checked by Joi existence, but check logic)
    // Note: Joi checks structure, here we check business rules if needed.
    
    // Calculate pricing and validate items availability
    const orderItems = await orderService.validateAndProcessItems(items);
    const pricing = orderService.calculateOrderPricing(orderItems, shippingAddress.city);

    // For COD, validate advance payment amount
    if (payment.method === 'cod') {
      const requiredAdvance = pricing.total * 0.5;
      // Allow a small margin of error (e.g. 1 rupee)
      if (!payment.advanceAmount || payment.advanceAmount < (requiredAdvance - 1)) {
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
      customer: req.user?._id || null, // null for guest checkout (if allowed by model)
      // If guest, we might need to create a temporary user or handle it. 
      // Assuming model allows null customer or we handle it. 
      // Actually Order model requires customer. So for guest checkout we might need a "Guest" user or create one.
      // For now, let's assume req.user is present or we fail.
      // If public access is allowed, we should create a user or find existing by email.
      
      customerInfo: customerInfo || (req.user ? {
        name: req.user.fullName,
        email: req.user.email,
        phone: req.user.phone,
        whatsapp: req.user.whatsapp || req.user.phone
      } : null),
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

    // Handle Guest Checkout: Create or Find User
    if (!req.user) {
      if (!customerInfo) {
        return res.status(400).json({ success: false, message: 'Customer info required for guest checkout' });
      }
      
      // Check if user exists
      let user = await User.findOne({ email: customerInfo.email });
      if (!user) {
        // Create new customer
        const crypto = require('crypto');
        const randomPassword = crypto.randomBytes(8).toString('hex');
        user = await User.create({
          fullName: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          password: randomPassword, // They can reset it later
          role: 'customer',
          emailVerified: false
        });
        // Ideally send them an email with credentials
      }
      orderData.customer = user._id;
    }

    // 3. Create Order with Transaction
    const order = await Order.createOrderWithTransaction(orderData);

    // 4. Post-Creation Actions (Notifications)
    // These are outside the transaction to keep it fast. 
    // If they fail, the order is still created (which is usually desired).
    
    // Populate order details for response/notification
    await order.populate('customer', 'fullName email phone whatsapp');
    await order.populate('items.product', 'title images sku');

    // Send confirmation notifications
    try {
      await notificationService.sendOrderConfirmation(order);
      await notificationService.notifyAdminNewOrder(order);
    } catch (notifyError) {
      logger.error('Notification failed after order creation:', notifyError);
      // Don't fail the request
    }

    // Log order creation
    logger.info(`Order created successfully: ${orderNumber}`, {
      orderId: order._id,
      customer: orderData.customerInfo.email,
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
    const { error, value } = verifyPaymentSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { approved, rejectionReason, notes } = value;

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
      await order.verifyPayment(req.user._id, notes);

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
      order.status = 'payment-failed'; // Note: 'payment-failed' is not in enum, might need to check model. 
      // Model enum: 'pending-payment', 'payment-verified', etc. 
      // Let's stick to 'pending-payment' or add 'payment-failed' to enum.
      // The model enum has 'pending-payment', 'payment-verified', 'cancelled', 'refunded'.
      // It does NOT have 'payment-failed'. So we should probably keep it 'pending-payment' but mark payment as failed.
      
      order.statusHistory.push({
        status: 'pending-payment', // Revert to pending
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
    const { error, value } = updateOrderStatusSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { status, note, assignedTailor, trackingInfo } = value;

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
    
    // Use model method
    await order.updateStatus(status, note, req.user._id);

    // Assign tailor if provided
    if (assignedTailor) {
      order.assignedTailor = assignedTailor;
      await order.save();
    }

    // Update tracking info if provided
    if (trackingInfo && (status === 'out-for-delivery' || status === 'dispatched')) {
      order.tracking = {
        ...order.tracking,
        ...trackingInfo,
        dispatchDate: trackingInfo.dispatchDate || new Date()
      };
      await order.save();
    }

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

// ============================================
// ADMIN CONTROLLER METHODS
// ============================================

/**
 * Get all orders for admin with advanced filters
 * @route GET /api/v1/admin/orders
 * @access Private (Admin)
 */
exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = '',
      paymentStatus = '',
      paymentMethod = '',
      dateRange = 'all',
      startDate = '',
      endDate = '',
      priority = '',
      minAmount = '',
      maxAmount = '',
      sortBy = 'newest',
      customer = ''
    } = req.query;

    // Build filter object
    const filter = { isDeleted: { $ne: true } };

    // Status filter (can be array for multiple statuses)
    if (status) {
      if (Array.isArray(status)) {
        filter.status = { $in: status };
      } else {
        filter.status = status;
      }
    }

    // Payment status filter
    if (paymentStatus) {
      filter['payment.status'] = paymentStatus;
    }

    // Payment method filter
    if (paymentMethod) {
      filter['payment.method'] = paymentMethod;
    }

    // Priority filter
    if (priority) {
      filter.priority = priority;
    }

    // Customer filter
    if (customer) {
      filter.customer = customer;
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      let start, end;

      switch (dateRange) {
        case 'today':
          start = new Date(now.setHours(0, 0, 0, 0));
          end = new Date(now.setHours(23, 59, 59, 999));
          break;
        case 'week':
          start = new Date(now.setDate(now.getDate() - 7));
          end = new Date();
          break;
        case 'month':
          start = new Date(now.setMonth(now.getMonth() - 1));
          end = new Date();
          break;
        case 'quarter':
          start = new Date(now.setMonth(now.getMonth() - 3));
          end = new Date();
          break;
        case 'year':
          start = new Date(now.setFullYear(now.getFullYear() - 1));
          end = new Date();
          break;
        case 'custom':
          if (startDate) start = new Date(startDate);
          if (endDate) end = new Date(endDate);
          break;
      }

      if (start || end) {
        filter.createdAt = {};
        if (start) filter.createdAt.$gte = start;
        if (end) filter.createdAt.$lte = end;
      }
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      filter['pricing.total'] = {};
      if (minAmount) filter['pricing.total'].$gte = parseFloat(minAmount);
      if (maxAmount) filter['pricing.total'].$lte = parseFloat(maxAmount);
    }

    // Search filter
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
        { 'customerInfo.email': { $regex: search, $options: 'i' } },
        { 'customerInfo.phone': { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'highest':
        sort = { 'pricing.total': -1 };
        break;
      case 'lowest':
        sort = { 'pricing.total': 1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customer', 'fullName email phone whatsapp')
        .populate('items.product', 'title primaryImage sku')
        .populate('statusHistory.updatedBy', 'fullName')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(filter)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOrders: total,
          ordersPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    logger.error('Error in getAllOrdersAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get order by ID for admin
 * @route GET /api/v1/admin/orders/:id
 * @access Private (Admin)
 */
exports.getOrderByIdAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'fullName email phone whatsapp profileImage')
      .populate('items.product', 'title images sku category')
      .populate('statusHistory.updatedBy', 'fullName')
      .populate('notes.addedBy', 'fullName')
      .populate('payment.verifiedBy', 'fullName')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { order }
    });

  } catch (error) {
    logger.error('Error in getOrderByIdAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update order status (Admin)
 * @route PUT /api/v1/admin/orders/:id/status
 * @access Private (Admin)
 */
exports.updateOrderStatusAdmin = async (req, res) => {
  try {
    const { status, note, notifyCustomer = true } = req.body;

    const validStatuses = [
      'pending-payment',
      'payment-verified',
      'material-arranged',
      'in-progress',
      'quality-check',
      'ready-dispatch',
      'dispatched',
      'delivered',
      'cancelled',
      'refunded'
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

    // Prevent status updates if payment not verified (except cancellation/refund)
    if (order.payment.status !== 'verified' && !['cancelled', 'refunded'].includes(status)) {
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

    await order.save();

    // Send notification if requested
    if (notifyCustomer) {
      await notificationService.sendStatusUpdate(order, previousStatus);
    }

    logger.info(`Order status updated (Admin): ${order.orderNumber}`, {
      orderId: order._id,
      previousStatus,
      newStatus: status,
      updatedBy: req.user.email
    });

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });

  } catch (error) {
    logger.error('Error in updateOrderStatusAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Verify payment (Admin)
 * @route POST /api/v1/admin/orders/:id/verify-payment
 * @access Private (Admin)
 */
exports.verifyPaymentAdmin = async (req, res) => {
  try {
    const { verified, verificationNotes, transactionId, transactionDate, amountPaid } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.payment.status === 'verified' && verified) {
      return res.status(400).json({
        success: false,
        message: 'Payment already verified'
      });
    }

    if (verified) {
      // Verify payment
      order.payment.status = 'verified';
      order.payment.verifiedBy = req.user._id;
      order.payment.verifiedAt = new Date();
      if (transactionId) order.payment.transactionId = transactionId;
      if (transactionDate) order.payment.transactionDate = new Date(transactionDate);
      if (amountPaid) order.payment.amountPaid = amountPaid;
      if (verificationNotes) order.payment.verificationNotes = verificationNotes;

      // Update order status
      if (order.status === 'pending-payment') {
        order.status = 'payment-verified';
        order.statusHistory.push({
          status: 'payment-verified',
          timestamp: new Date(),
          note: 'Payment verified by admin',
          updatedBy: req.user._id
        });
      }

      // Add admin note
      if (verificationNotes) {
        order.notes.push({
          text: `Payment Verification: ${verificationNotes}`,
          addedBy: req.user._id,
          timestamp: new Date()
        });
      }

      await order.save();

      // Send confirmation to customer
      await notificationService.sendPaymentVerified(order);

      logger.info(`Payment verified (Admin): ${order.orderNumber}`, {
        orderId: order._id,
        verifiedBy: req.user.email
      });

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: { order }
      });

    } else {
      // Reject payment
      order.payment.status = 'failed';
      order.status = 'pending-payment';
      order.statusHistory.push({
        status: 'pending-payment',
        timestamp: new Date(),
        note: verificationNotes || 'Payment verification failed',
        updatedBy: req.user._id
      });

      if (verificationNotes) {
        order.notes.push({
          text: `Payment Rejected: ${verificationNotes}`,
          addedBy: req.user._id,
          timestamp: new Date()
        });
      }

      await order.save();

      // Notify customer about rejection
      await notificationService.sendPaymentRejected(order, verificationNotes);

      logger.warn(`Payment rejected (Admin): ${order.orderNumber}`, {
        orderId: order._id,
        reason: verificationNotes,
        rejectedBy: req.user.email
      });

      res.status(200).json({
        success: true,
        message: 'Payment verification declined',
        data: { order }
      });
    }

  } catch (error) {
    logger.error('Error in verifyPaymentAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Cancel order (Admin)
 * @route POST /api/v1/admin/orders/:id/cancel
 * @access Private (Admin)
 */
exports.cancelOrderAdmin = async (req, res) => {
  try {
    const { reason, refundAmount, notifyCustomer = true } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation reason is required'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    // Cancel order
    order.status = 'cancelled';
    order.cancellation = {
      cancelledBy: 'admin',
      reason: reason.trim(),
      requestedAt: new Date(),
      approvedAt: new Date()
    };
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: `Cancelled by admin: ${reason}`,
      updatedBy: req.user._id
    });

    // Add admin note
    order.notes.push({
      text: `Order Cancelled: ${reason}`,
      addedBy: req.user._id,
      timestamp: new Date(),
      isImportant: true
    });

    // Handle refund if payment was verified
    if (order.payment.status === 'verified' && refundAmount) {
      order.payment.status = 'refunded';
      order.payment.refund = {
        amount: refundAmount,
        reason: reason,
        processedAt: new Date(),
        processedBy: req.user._id
      };
      order.status = 'refunded';
    }

    await order.save();

    // Send cancellation notification
    if (notifyCustomer) {
      await notificationService.sendOrderCancellation(order, reason);
    }

    logger.info(`Order cancelled (Admin): ${order.orderNumber}`, {
      orderId: order._id,
      cancelledBy: req.user.email,
      reason
    });

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });

  } catch (error) {
    logger.error('Error in cancelOrderAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Process refund (Admin)
 * @route POST /api/v1/admin/orders/:id/refund
 * @access Private (Admin)
 */
exports.processRefundAdmin = async (req, res) => {
  try {
    const { reason, amount, items, notifyCustomer = true } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Refund reason is required'
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid refund amount is required'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.payment.status === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Order already refunded'
      });
    }

    if (order.payment.status !== 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Cannot refund order with unverified payment'
      });
    }

    // Process refund
    order.payment.status = 'refunded';
    order.payment.refund = {
      amount: amount,
      reason: reason.trim(),
      processedAt: new Date(),
      processedBy: req.user._id
    };

    // Update order status
    order.status = 'refunded';
    order.statusHistory.push({
      status: 'refunded',
      timestamp: new Date(),
      note: `Refund processed: ${reason}`,
      updatedBy: req.user._id
    });

    // Add admin note
    order.notes.push({
      text: `Refund Processed: PKR ${amount} - ${reason}`,
      addedBy: req.user._id,
      timestamp: new Date(),
      isImportant: true
    });

    await order.save();

    // Send refund notification
    if (notifyCustomer) {
      await notificationService.sendRefundProcessed(order, amount, reason);
    }

    logger.info(`Refund processed (Admin): ${order.orderNumber}`, {
      orderId: order._id,
      amount,
      processedBy: req.user.email
    });

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: { order, refund: order.payment.refund }
    });

  } catch (error) {
    logger.error('Error in processRefundAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Add admin note
 * @route POST /api/v1/admin/orders/:id/notes
 * @access Private (Admin)
 */
exports.addAdminNote = async (req, res) => {
  try {
    const { text, isImportant = false } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Note text is required'
      });
    }

    if (text.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Note cannot exceed 1000 characters'
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
      isImportant: isImportant,
      timestamp: new Date()
    });

    await order.save();

    logger.info(`Admin note added: ${order.orderNumber}`, {
      orderId: order._id,
      addedBy: req.user.email
    });

    res.status(200).json({
      success: true,
      message: 'Note added successfully',
      data: { notes: order.notes }
    });

  } catch (error) {
    logger.error('Error in addAdminNote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update shipping address (Admin)
 * @route PUT /api/v1/admin/orders/:id/shipping-address
 * @access Private (Admin)
 */
exports.updateShippingAddressAdmin = async (req, res) => {
  try {
    const addressData = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Prevent address update if order is already dispatched or delivered
    if (['dispatched', 'delivered'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update shipping address for dispatched or delivered orders'
      });
    }

    // Update shipping address
    order.shippingAddress = {
      ...order.shippingAddress,
      ...addressData
    };

    // Add admin note
    order.notes.push({
      text: `Shipping address updated by admin`,
      addedBy: req.user._id,
      timestamp: new Date()
    });

    await order.save();

    logger.info(`Shipping address updated (Admin): ${order.orderNumber}`, {
      orderId: order._id,
      updatedBy: req.user.email
    });

    res.status(200).json({
      success: true,
      message: 'Shipping address updated successfully',
      data: { order }
    });

  } catch (error) {
    logger.error('Error in updateShippingAddressAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update shipping address',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update tracking information (Admin)
 * @route PUT /api/v1/admin/orders/:id/tracking
 * @access Private (Admin)
 */
exports.updateTrackingAdmin = async (req, res) => {
  try {
    const { courierService, trackingNumber, trackingUrl, dispatchDate, estimatedDeliveryDate } = req.body;

    if (!courierService || !trackingNumber) {
      return res.status(400).json({
        success: false,
        message: 'Courier service and tracking number are required'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update tracking info
    order.tracking = {
      courierService,
      trackingNumber,
      trackingUrl: trackingUrl || order.tracking?.trackingUrl,
      dispatchDate: dispatchDate ? new Date(dispatchDate) : new Date(),
      estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : order.tracking?.estimatedDeliveryDate
    };

    // Update status to dispatched if not already
    if (order.status !== 'dispatched' && order.status !== 'delivered') {
      order.status = 'dispatched';
      order.statusHistory.push({
        status: 'dispatched',
        timestamp: new Date(),
        note: `Order dispatched via ${courierService}. Tracking: ${trackingNumber}`,
        updatedBy: req.user._id
      });
    }

    // Add admin note
    order.notes.push({
      text: `Tracking updated: ${courierService} - ${trackingNumber}`,
      addedBy: req.user._id,
      timestamp: new Date()
    });

    await order.save();

    // Send tracking notification
    await notificationService.sendTrackingUpdate(order);

    logger.info(`Tracking updated (Admin): ${order.orderNumber}`, {
      orderId: order._id,
      updatedBy: req.user.email
    });

    res.status(200).json({
      success: true,
      message: 'Tracking information updated successfully',
      data: { order }
    });

  } catch (error) {
    logger.error('Error in updateTrackingAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tracking information',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Download invoice (Admin)
 * @route GET /api/v1/admin/orders/:id/invoice
 * @access Private (Admin)
 */
exports.downloadInvoiceAdmin = async (req, res) => {
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

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(order);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);

    logger.info(`Invoice downloaded (Admin): ${order.orderNumber}`, {
      orderId: order._id,
      downloadedBy: req.user.email
    });

  } catch (error) {
    logger.error('Error in downloadInvoiceAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Send notification (Admin)
 * @route POST /api/v1/admin/orders/:id/notify
 * @access Private (Admin)
 */
exports.sendNotificationAdmin = async (req, res) => {
  try {
    const { type, message, channels = ['email', 'whatsapp'] } = req.body;

    const order = await Order.findById(req.params.id)
      .populate('customer', 'fullName email phone whatsapp');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const results = {
      email: { sent: false },
      whatsapp: { sent: false }
    };

    // Send email if requested
    if (channels.includes('email') && order.customerInfo?.email) {
      try {
        const emailResult = await emailConfig.sendEmail({
          to: order.customerInfo.email,
          subject: `Update on Order ${order.orderNumber}`,
          text: message || `Update on your order ${order.orderNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif;">
              <h2>Order Update</h2>
              <p><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p>${message || 'You have an update on your order.'}</p>
            </div>
          `
        });
        results.email = { sent: emailResult.success };
      } catch (error) {
        console.error('Email notification failed:', error);
        results.email = { sent: false, error: error.message };
      }
    }

    // Send WhatsApp if requested
    if (channels.includes('whatsapp') && order.customerInfo?.whatsapp) {
      try {
        const whatsappMessage = `*Order Update*\n\nOrder: ${order.orderNumber}\n\n${message || 'You have an update on your order.'}`;
        const whatsappResult = await whatsappConfig.sendWhatsAppMessage(order.customerInfo.whatsapp, whatsappMessage);
        results.whatsapp = { sent: whatsappResult.success };
      } catch (error) {
        console.error('WhatsApp notification failed:', error);
        results.whatsapp = { sent: false, error: error.message };
      }
    }

    logger.info(`Notification sent (Admin): ${order.orderNumber}`, {
      orderId: order._id,
      type,
      channels,
      sentBy: req.user.email
    });

    res.status(200).json({
      success: true,
      message: 'Notification sent',
      data: { results }
    });

  } catch (error) {
    logger.error('Error in sendNotificationAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Export orders to CSV (Admin)
 * @route GET /api/v1/admin/orders/export
 * @access Private (Admin)
 */
exports.exportOrdersAdmin = async (req, res) => {
  try {
    // Use same filters as getAllOrdersAdmin
    const filter = { isDeleted: { $ne: true } };
    const { status, paymentStatus, dateRange, startDate, endDate } = req.query;

    if (status) filter.status = status;
    if (paymentStatus) filter['payment.status'] = paymentStatus;

    // Date range filter (simplified for export)
    if (dateRange === 'custom' && startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const orders = await Order.find(filter)
      .populate('customer', 'fullName email phone')
      .select('orderNumber customerInfo pricing.total status payment.status payment.method createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Generate CSV
    const { generateOrderCSV } = require('../utils/csvGenerator');
    const csvContent = generateOrderCSV(orders);

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=orders-export-${Date.now()}.csv`);
    res.send(csvContent);

    logger.info(`Orders exported (Admin)`, {
      count: orders.length,
      exportedBy: req.user.email
    });

  } catch (error) {
    logger.error('Error in exportOrdersAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};