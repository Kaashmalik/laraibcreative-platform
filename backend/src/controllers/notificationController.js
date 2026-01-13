/**
 * Notification Service
 * Real-time notification management using Server-Sent Events (SSE)
 */

const logger = require('../utils/logger');
const Order = require('../models/Order');
const User = require('../models/User');

// Active SSE connections
const activeConnections = new Map();

/**
 * Set up SSE connection for a user
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.setupSSEConnection = (req, res) => {
  const userId = req.userId;

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Notifications connected' })}\n\n`);

  // Store connection
  activeConnections.set(userId, res);

  // Send keepalive messages every 30 seconds
  const keepalive = setInterval(() => {
    try {
      res.write(`data: ${JSON.stringify({ type: 'keepalive' })}\n\n`);
    } catch (error) {
      logger.error('SSE keepalive error:', { error, userId });
      clearInterval(keepalive);
      activeConnections.delete(userId);
    }
  }, 30000);

  // Clean up on disconnect
  req.on('close', () => {
    clearInterval(keepalive);
    activeConnections.delete(userId);
    logger.info('SSE connection closed', { userId });
  });

  req.on('end', () => {
    clearInterval(keepalive);
    activeConnections.delete(userId);
  });
};

/**
 * Send notification to a specific user
 * @param {String} userId - User ID
 * @param {Object} notification - Notification data
 */
exports.sendNotificationToUser = (userId, notification) => {
  const connection = activeConnections.get(userId);
  
  if (connection) {
    try {
      connection.write(`data: ${JSON.stringify(notification)}\n\n`);
      logger.info('Notification sent to user', { userId, type: notification.type });
      return true;
    } catch (error) {
      logger.error('Failed to send SSE notification:', { error, userId });
      activeConnections.delete(userId);
      return false;
    }
  }
  
  return false;
};

/**
 * Send notification to all admin users
 * @param {Object} notification - Notification data
 */
exports.sendNotificationToAdmins = async (notification) => {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'super-admin'] } });
    
    let sentCount = 0;
    admins.forEach(admin => {
      if (exports.sendNotificationToUser(admin._id.toString(), notification)) {
        sentCount++;
      }
    });

    logger.info('Admin notification sent', { sentCount, total: admins.length, type: notification.type });
    return sentCount;
  } catch (error) {
    logger.error('Failed to send admin notifications:', error);
    return 0;
  }
};

/**
 * Send order status update notification
 * @param {String} orderId - Order ID
 * @param {String} newStatus - New status
 * @param {String} previousStatus - Previous status
 */
exports.sendStatusUpdateNotification = async (orderId, newStatus, previousStatus) => {
  try {
    const order = await Order.findById(orderId).populate('customer');
    
    if (!order) {
      logger.error('Order not found for status notification', { orderId });
      return;
    }

    const notification = {
      type: 'order_status',
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      status: newStatus,
      previousStatus,
      timestamp: new Date().toISOString(),
      message: `Order ${order.orderNumber} status updated to ${newStatus}`
    };

    // Send to customer
    if (order.customer) {
      exports.sendNotificationToUser(order.customer._id.toString(), notification);
    }

    // Send to admins
    await exports.sendNotificationToAdmins(notification);

  } catch (error) {
    logger.error('Failed to send status update notification:', { error, orderId });
  }
};

/**
 * Send new order notification to admins
 * @param {String} orderId - Order ID
 */
exports.sendNewOrderNotification = async (orderId) => {
  try {
    const order = await Order.findById(orderId);
    
    if (!order) {
      logger.error('Order not found for new order notification', { orderId });
      return;
    }

    const notification = {
      type: 'new_order',
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      customerName: order.customerInfo.fullName,
      total: order.pricing.total,
      timestamp: new Date().toISOString(),
      message: `New order ${order.orderNumber} received from ${order.customerInfo.fullName}`
    };

    await exports.sendNotificationToAdmins(notification);

  } catch (error) {
    logger.error('Failed to send new order notification:', { error, orderId });
  }
};

/**
 * Send payment verification notification
 * @param {String} orderId - Order ID
 */
exports.sendPaymentVerificationNotification = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('customer');
    
    if (!order) {
      logger.error('Order not found for payment notification', { orderId });
      return;
    }

    const notification = {
      type: 'payment_verified',
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      amount: order.pricing.total,
      timestamp: new Date().toISOString(),
      message: `Payment verified for order ${order.orderNumber}`
    };

    // Send to customer
    if (order.customer) {
      exports.sendNotificationToUser(order.customer._id.toString(), notification);
    }

    // Send to admins
    await exports.sendNotificationToAdmins(notification);

  } catch (error) {
    logger.error('Failed to send payment verification notification:', { error, orderId });
  }
};

/**
 * Get active connections count
 * @returns {Number} Number of active connections
 */
exports.getActiveConnectionsCount = () => {
  return activeConnections.size;
};
