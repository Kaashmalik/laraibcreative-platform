// backend/src/services/notificationService.js

const nodemailer = require('nodemailer');
const whatsappService = require('../utils/whatsappService');
const emailTemplates = require('../utils/emailTemplates');
const logger = require('../utils/logger');

/**
 * Email transporter configuration
 */
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

/**
 * Send order confirmation notifications
 */
exports.sendOrderConfirmation = async (order) => {
  try {
    const customerEmail = order.customerInfo.email || order.customer.email;
    const customerWhatsApp = order.customerInfo.whatsapp || order.customer.whatsapp;

    // Send email
    if (customerEmail) {
      await sendEmail({
        to: customerEmail,
        subject: `Order Confirmation - ${order.orderNumber}`,
        html: emailTemplates.orderConfirmation(order)
      });
    }

    // Send WhatsApp notification
    if (customerWhatsApp) {
      await whatsappService.sendOrderConfirmation(customerWhatsApp, order);
    }

    logger.info(`Order confirmation sent for ${order.orderNumber}`);
    return true;

  } catch (error) {
    logger.error('Error sending order confirmation:', error);
    // Don't throw error - notification failure shouldn't stop order creation
    return false;
  }
};

/**
 * Notify admin about new order
 */
exports.notifyAdminNewOrder = async (order) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminWhatsApp = process.env.ADMIN_WHATSAPP;

    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `New Order Received - ${order.orderNumber}`,
        html: emailTemplates.adminNewOrder(order)
      });
    }

    if (adminWhatsApp) {
      await whatsappService.notifyAdminNewOrder(adminWhatsApp, order);
    }

    logger.info(`Admin notified of new order ${order.orderNumber}`);
    return true;

  } catch (error) {
    logger.error('Error notifying admin:', error);
    return false;
  }
};

/**
 * Send payment verification notification
 */
exports.sendPaymentVerified = async (order) => {
  try {
    const customerEmail = order.customerInfo.email || order.customer.email;
    const customerWhatsApp = order.customerInfo.whatsapp || order.customer.whatsapp;

    // Send email
    if (customerEmail) {
      await sendEmail({
        to: customerEmail,
        subject: `Payment Verified - ${order.orderNumber}`,
        html: emailTemplates.paymentVerified(order)
      });
    }

    // Send WhatsApp notification
    if (customerWhatsApp) {
      await whatsappService.sendPaymentVerified(customerWhatsApp, order);
    }

    logger.info(`Payment verification notification sent for ${order.orderNumber}`);
    return true;

  } catch (error) {
    logger.error('Error sending payment verification:', error);
    return false;
  }
};

/**
 * Send payment rejection notification
 */
exports.sendPaymentRejected = async (order, reason) => {
  try {
    const customerEmail = order.customerInfo.email || order.customer.email;
    const customerWhatsApp = order.customerInfo.whatsapp || order.customer.whatsapp;

    // Send email
    if (customerEmail) {
      await sendEmail({
        to: customerEmail,
        subject: `Payment Verification Issue - ${order.orderNumber}`,
        html: emailTemplates.paymentRejected(order, reason)
      });
    }

    // Send WhatsApp notification
    if (customerWhatsApp) {
      await whatsappService.sendPaymentRejected(customerWhatsApp, order, reason);
    }

    logger.info(`Payment rejection notification sent for ${order.orderNumber}`);
    return true;

  } catch (error) {
    logger.error('Error sending payment rejection:', error);
    return false;
  }
};

/**
 * Send order status update notification
 */
exports.sendStatusUpdate = async (order, previousStatus) => {
  try {
    const customerEmail = order.customerInfo.email || order.customer.email;
    const customerWhatsApp = order.customerInfo.whatsapp || order.customer.whatsapp;

    const statusMessages = {
      'payment-verified': 'Your payment has been verified successfully!',
      'fabric-arranged': 'Fabric has been arranged for your order.',
      'stitching-in-progress': 'Your order is now being stitched by our expert tailors.',
      'quality-check': 'Your order is in quality check phase.',
      'ready-for-dispatch': 'Your order is ready and will be dispatched soon.',
      'out-for-delivery': 'Your order is out for delivery!',
      'delivered': 'Your order has been delivered. Thank you for choosing LaraibCreative!'
    };

    const message = statusMessages[order.status];

    if (!message) {
      return false; // No notification for certain statuses
    }

    // Send email
    if (customerEmail) {
      await sendEmail({
        to: customerEmail,
        subject: `Order Update - ${order.orderNumber}`,
        html: emailTemplates.statusUpdate(order, message)
      });
    }

    // Send WhatsApp notification
    if (customerWhatsApp) {
      await whatsappService.sendStatusUpdate(customerWhatsApp, order, message);
    }

    logger.info(`Status update notification sent for ${order.orderNumber}: ${order.status}`);
    return true;

  } catch (error) {
    logger.error('Error sending status update:', error);
    return false;
  }
};

/**
 * Send order cancellation notification
 */
exports.sendOrderCancellation = async (order, reason) => {
  try {
    const customerEmail = order.customerInfo.email || order.customer.email;
    const customerWhatsApp = order.customerInfo.whatsapp || order.customer.whatsapp;

    // Send email
    if (customerEmail) {
      await sendEmail({
        to: customerEmail,
        subject: `Order Cancelled - ${order.orderNumber}`,
        html: emailTemplates.orderCancellation(order, reason)
      });
    }

    // Send WhatsApp notification
    if (customerWhatsApp) {
      await whatsappService.sendOrderCancellation(customerWhatsApp, order, reason);
    }

    logger.info(`Order cancellation notification sent for ${order.orderNumber}`);
    return true;

  } catch (error) {
    logger.error('Error sending cancellation notification:', error);
    return false;
  }
};

/**
 * Send delivery confirmation request
 */
exports.requestDeliveryConfirmation = async (order) => {
  try {
    const customerEmail = order.customerInfo.email || order.customer.email;
    const customerWhatsApp = order.customerInfo.whatsapp || order.customer.whatsapp;

    // Send email
    if (customerEmail) {
      await sendEmail({
        to: customerEmail,
        subject: `Please Confirm Delivery - ${order.orderNumber}`,
        html: emailTemplates.deliveryConfirmation(order)
      });
    }

    // Send WhatsApp notification
    if (customerWhatsApp) {
      await whatsappService.requestDeliveryConfirmation(customerWhatsApp, order);
    }

    logger.info(`Delivery confirmation requested for ${order.orderNumber}`);
    return true;

  } catch (error) {
    logger.error('Error requesting delivery confirmation:', error);
    return false;
  }
};

/**
 * Send review request after delivery
 */
exports.sendReviewRequest = async (order) => {
  try {
    const customerEmail = order.customerInfo.email || order.customer.email;

    if (!customerEmail) {
      return false;
    }

    // Wait 2 days after delivery before sending review request
    const deliveryDate = order.actualCompletion || new Date();
    const daysSinceDelivery = Math.floor((Date.now() - deliveryDate) / (1000 * 60 * 60 * 24));

    if (daysSinceDelivery < 2) {
      return false; // Too early for review
    }

    await sendEmail({
      to: customerEmail,
      subject: `We'd Love Your Feedback - ${order.orderNumber}`,
      html: emailTemplates.reviewRequest(order)
    });

    logger.info(`Review request sent for ${order.orderNumber}`);
    return true;

  } catch (error) {
    logger.error('Error sending review request:', error);
    return false;
  }
};

/**
 * Send low stock alert to admin
 */
exports.sendLowStockAlert = async (fabric, currentStock) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      return false;
    }

    await sendEmail({
      to: adminEmail,
      subject: `Low Stock Alert - ${fabric.type}`,
      html: emailTemplates.lowStockAlert(fabric, currentStock)
    });

    logger.info(`Low stock alert sent for ${fabric.type}`);
    return true;

  } catch (error) {
    logger.error('Error sending low stock alert:', error);
    return false;
  }
};

/**
 * Helper function to send email
 */
async function sendEmail({ to, subject, html, attachments = [] }) {
  try {
    const transporter = createEmailTransporter();

    const mailOptions = {
      from: {
        name: 'LaraibCreative',
        address: process.env.EMAIL_USER
      },
      to,
      subject,
      html,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId} to ${to}`);
    return info;

  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send bulk notification to multiple customers
 */
exports.sendBulkNotification = async (customers, subject, message) => {
  try {
    const emailPromises = customers
      .filter(c => c.email)
      .map(customer => 
        sendEmail({
          to: customer.email,
          subject,
          html: emailTemplates.bulkNotification(customer, message)
        }).catch(err => {
          logger.error(`Failed to send to ${customer.email}:`, err);
          return null;
        })
      );

    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;

    logger.info(`Bulk notification sent: ${successful}/${customers.length} successful`);
    return { total: customers.length, successful };

  } catch (error) {
    logger.error('Error sending bulk notification:', error);
    throw error;
  }
};

/**
 * Send weekly order summary to admin
 */
exports.sendWeeklySummary = async (stats) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      return false;
    }

    await sendEmail({
      to: adminEmail,
      subject: `Weekly Summary - LaraibCreative`,
      html: emailTemplates.weeklySummary(stats)
    });

    logger.info('Weekly summary sent to admin');
    return true;

  } catch (error) {
    logger.error('Error sending weekly summary:', error);
    return false;
  }
};

module.exports = exports;