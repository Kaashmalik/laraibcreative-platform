const Order = require('../models/Order');
const FabricInventory = require('../models/FabricInventory');
const { sendEmail } = require('../utils/emailService');
const { sendWhatsApp } = require('../utils/whatsappService');
const logger = require('../utils/logger');

/**
 * Alert Service
 * Monitors and sends alerts for critical events
 */

/**
 * Check for failed payments
 */
exports.checkFailedPayments = async () => {
  try {
    const failedPayments = await Order.find({
      'payment.status': 'failed',
      'payment.failedAt': {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      }
    }).populate('customer', 'email fullName phone');

    if (failedPayments.length > 0) {
      // Send alert
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@laraibcreative.studio',
        subject: `Alert: ${failedPayments.length} Failed Payment(s)`,
        html: `
          <h2>Failed Payments Alert</h2>
          <p>There are ${failedPayments.length} failed payment(s) in the last 24 hours:</p>
          <ul>
            ${failedPayments.map(order => `
              <li>
                Order #${order.orderNumber}: ${order.total} PKR
                <br>Customer: ${order.customer?.fullName || 'N/A'}
                <br>Reason: ${order.payment.failureReason || 'Unknown'}
              </li>
            `).join('')}
          </ul>
        `
      });

      logger.warn(`Alert: ${failedPayments.length} failed payments detected`);
    }

    return { count: failedPayments.length, orders: failedPayments };
  } catch (error) {
    logger.error('Error checking failed payments:', error);
    throw error;
  }
};

/**
 * Check for stockouts
 */
exports.checkStockouts = async () => {
  try {
    const stockouts = await FabricInventory.find({
      status: 'out-of-stock',
      'alerts.outOfStockAlerted': false
    });

    if (stockouts.length > 0) {
      // Send alert
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@laraibcreative.studio',
        subject: `Alert: ${stockouts.length} Fabric Stockout(s)`,
        html: `
          <h2>Stockout Alert</h2>
          <p>The following fabrics are out of stock:</p>
          <ul>
            ${stockouts.map(fabric => `
              <li>${fabric.name} (${fabric.type}) - ${fabric.color || 'N/A'}</li>
            `).join('')}
          </ul>
        `
      });

      // Mark as alerted
      await FabricInventory.updateMany(
        { _id: { $in: stockouts.map(f => f._id) } },
        { $set: { 'alerts.outOfStockAlerted': true, 'alerts.lastAlertDate': new Date() } }
      );

      logger.warn(`Alert: ${stockouts.length} stockouts detected`);
    }

    return { count: stockouts.length, fabrics: stockouts };
  } catch (error) {
    logger.error('Error checking stockouts:', error);
    throw error;
  }
};

/**
 * Check for high abandonment rate
 */
exports.checkAbandonment = async () => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const abandonedCarts = await Order.countDocuments({
      status: 'cart',
      updatedAt: { $lt: thirtyMinutesAgo },
      'payment.status': { $ne: 'completed' }
    });

    const totalCarts = await Order.countDocuments({
      status: 'cart',
      updatedAt: { $gte: thirtyMinutesAgo }
    });

    const abandonmentRate = totalCarts > 0
      ? (abandonedCarts / totalCarts) * 100
      : 0;

    // Alert if abandonment rate > 50%
    if (abandonmentRate > 50 && abandonedCarts > 10) {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@laraibcreative.studio',
        subject: `Alert: High Cart Abandonment Rate (${abandonmentRate.toFixed(1)}%)`,
        html: `
          <h2>High Cart Abandonment Alert</h2>
          <p>Cart abandonment rate is ${abandonmentRate.toFixed(1)}%</p>
          <p>Abandoned carts: ${abandonedCarts}</p>
          <p>Total carts: ${totalCarts}</p>
        `
      });

      logger.warn(`Alert: High abandonment rate: ${abandonmentRate.toFixed(1)}%`);
    }

    return {
      abandonmentRate: abandonmentRate.toFixed(2),
      abandonedCarts,
      totalCarts
    };
  } catch (error) {
    logger.error('Error checking abandonment:', error);
    throw error;
  }
};

/**
 * Run all alert checks
 */
exports.runAllChecks = async () => {
  try {
    const [payments, stockouts, abandonment] = await Promise.all([
      exports.checkFailedPayments(),
      exports.checkStockouts(),
      exports.checkAbandonment()
    ]);

    return {
      payments,
      stockouts,
      abandonment,
      checkedAt: new Date()
    };
  } catch (error) {
    logger.error('Error running alert checks:', error);
    throw error;
  }
};

