// backend/src/services/notificationService.js
// ==========================================
// UNIFIED NOTIFICATION SERVICE
// ==========================================
// Orchestrates email and WhatsApp notifications
// Handles all customer and admin notifications
// ==========================================

const emailConfig = require('../config/email');
const whatsappConfig = require('../config/whatsapp');

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Extract customer contact info from order
 * @param {Object} order - Order object
 * @returns {Object} Contact info
 */
const getCustomerContact = (order) => {
  return {
    email: order.customerInfo?.email || order.customer?.email || null,
    whatsapp: order.customerInfo?.whatsapp || order.customer?.whatsapp || order.customerInfo?.phone || order.customer?.phone || null,
    name: order.customerInfo?.name || order.customer?.name || 'Customer',
  };
};

/**
 * Log notification result
 * @param {String} type - Notification type
 * @param {String} recipient - Recipient identifier
 * @param {Boolean} success - Success status
 */
const logNotification = (type, recipient, success) => {
  const status = success ? '✅' : '❌';
  console.log(`${status} Notification [${type}] to ${recipient}: ${success ? 'Success' : 'Failed'}`);
};

// ==========================================
// ORDER NOTIFICATIONS
// ==========================================

/**
 * Send order confirmation notifications (Email + WhatsApp)
 * @param {Object} order - Order object
 * @returns {Promise<Object>} Notification results
 */
exports.sendOrderConfirmation = async (order) => {
  try {
    if (!order || !order.orderNumber) {
      throw new Error('Invalid order object');
    }

    const contact = getCustomerContact(order);
    const results = {
      email: { sent: false },
      whatsapp: { sent: false },
    };

    // Send email if available
    if (contact.email) {
      try {
        const emailResult = await emailConfig.sendOrderConfirmation(contact.email, order);
        results.email = { sent: emailResult.success, messageId: emailResult.messageId };
        logNotification('Order Confirmation Email', contact.email, emailResult.success);
      } catch (error) {
        console.error('Email notification failed:', error.message);
        results.email = { sent: false, error: error.message };
      }
    }

    // Send WhatsApp if available
    if (contact.whatsapp) {
      try {
        const whatsappResult = await whatsappConfig.sendOrderConfirmation(contact.whatsapp, order);
        results.whatsapp = { sent: whatsappResult.success, sid: whatsappResult.sid };
        logNotification('Order Confirmation WhatsApp', contact.whatsapp, whatsappResult.success);
      } catch (error) {
        console.error('WhatsApp notification failed:', error.message);
        results.whatsapp = { sent: false, error: error.message };
      }
    }

    return {
      success: results.email.sent || results.whatsapp.sent,
      results,
    };

  } catch (error) {
    console.error('Error in sendOrderConfirmation:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Notify admin about new order
 * @param {Object} order - Order object
 * @returns {Promise<Object>} Notification results
 */
exports.notifyAdminNewOrder = async (order) => {
  try {
    if (!order || !order.orderNumber) {
      throw new Error('Invalid order object');
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminWhatsApp = process.env.ADMIN_WHATSAPP;
    
    const results = {
      email: { sent: false },
      whatsapp: { sent: false },
    };

    // Email admin
    if (adminEmail) {
      try {
        const emailData = {
          orderNumber: order.orderNumber,
          total: order.pricing?.total || order.total || 0,
        };
        const emailResult = await emailConfig.sendEmail({
          to: adminEmail,
          subject: `🔔 New Order - ${order.orderNumber}`,
          text: `New order received: ${order.orderNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif;">
              <h2>New Order Received</h2>
              <p><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p><strong>Customer:</strong> ${order.customerInfo?.name || 'N/A'}</p>
              <p><strong>Total:</strong> Rs. ${(order.pricing?.total || order.total || 0).toLocaleString()}</p>
              <p><strong>Items:</strong> ${order.items?.length || 0}</p>
            </div>
          `,
        });
        results.email = { sent: emailResult.success };
        logNotification('Admin New Order Email', adminEmail, emailResult.success);
      } catch (error) {
        console.error('Admin email notification failed:', error.message);
        results.email = { sent: false, error: error.message };
      }
    }

    // WhatsApp admin
    if (adminWhatsApp) {
      try {
        const message = `🔔 *New Order*\n\nOrder: ${order.orderNumber}\nCustomer: ${order.customerInfo?.name || 'N/A'}\nTotal: Rs. ${(order.pricing?.total || order.total || 0).toLocaleString()}`;
        const whatsappResult = await whatsappConfig.sendWhatsAppMessage(adminWhatsApp, message);
        results.whatsapp = { sent: whatsappResult.success };
        logNotification('Admin New Order WhatsApp', adminWhatsApp, whatsappResult.success);
      } catch (error) {
        console.error('Admin WhatsApp notification failed:', error.message);
        results.whatsapp = { sent: false, error: error.message };
      }
    }

    return {
      success: results.email.sent || results.whatsapp.sent,
      results,
    };

  } catch (error) {
    console.error('Error in notifyAdminNewOrder:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ==========================================
// PAYMENT NOTIFICATIONS
// ==========================================

/**
 * Send payment verification notification
 * @param {Object} order - Order object
 * @returns {Promise<Object>} Notification results
 */
exports.sendPaymentVerified = async (order) => {
  try {
    if (!order || !order.orderNumber) {
      throw new Error('Invalid order object');
    }

    const contact = getCustomerContact(order);
    const results = {
      email: { sent: false },
      whatsapp: { sent: false },
    };

    // Send email
    if (contact.email) {
      try {
        const emailResult = await emailConfig.sendPaymentVerification(contact.email, order);
        results.email = { sent: emailResult.success };
        logNotification('Payment Verified Email', contact.email, emailResult.success);
      } catch (error) {
        console.error('Payment email failed:', error.message);
        results.email = { sent: false, error: error.message };
      }
    }

    // Send WhatsApp
    if (contact.whatsapp) {
      try {
        const whatsappResult = await whatsappConfig.sendPaymentVerification(contact.whatsapp, order);
        results.whatsapp = { sent: whatsappResult.success };
        logNotification('Payment Verified WhatsApp', contact.whatsapp, whatsappResult.success);
      } catch (error) {
        console.error('Payment WhatsApp failed:', error.message);
        results.whatsapp = { sent: false, error: error.message };
      }
    }

    return {
      success: results.email.sent || results.whatsapp.sent,
      results,
    };

  } catch (error) {
    console.error('Error in sendPaymentVerified:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Send payment rejection notification
 * @param {Object} order - Order object
 * @param {String} reason - Rejection reason
 * @returns {Promise<Object>} Notification results
 */
exports.sendPaymentRejected = async (order, reason = '') => {
  try {
    if (!order || !order.orderNumber) {
      throw new Error('Invalid order object');
    }

    const contact = getCustomerContact(order);
    const results = {
      email: { sent: false },
      whatsapp: { sent: false },
    };

    // Send email
    if (contact.email) {
      try {
        const emailResult = await emailConfig.sendEmail({
          to: contact.email,
          subject: `Payment Issue - ${order.orderNumber}`,
          text: `Payment verification issue for order ${order.orderNumber}. ${reason}`,
          html: `
            <div style="font-family: Arial, sans-serif;">
              <h2 style="color: #EF4444;">Payment Verification Issue</h2>
              <p><strong>Order Number:</strong> ${order.orderNumber}</p>
              ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
              <p>Please re-upload a clear payment receipt or contact us.</p>
            </div>
          `,
        });
        results.email = { sent: emailResult.success };
        logNotification('Payment Rejected Email', contact.email, emailResult.success);
      } catch (error) {
        console.error('Payment rejection email failed:', error.message);
        results.email = { sent: false, error: error.message };
      }
    }

    // Send WhatsApp
    if (contact.whatsapp) {
      try {
        const message = `⚠️ *Payment Issue*\n\nOrder: ${order.orderNumber}\n${reason ? `Reason: ${reason}\n` : ''}Please re-upload your payment receipt.`;
        const whatsappResult = await whatsappConfig.sendWhatsAppMessage(contact.whatsapp, message);
        results.whatsapp = { sent: whatsappResult.success };
        logNotification('Payment Rejected WhatsApp', contact.whatsapp, whatsappResult.success);
      } catch (error) {
        console.error('Payment rejection WhatsApp failed:', error.message);
        results.whatsapp = { sent: false, error: error.message };
      }
    }

    return {
      success: results.email.sent || results.whatsapp.sent,
      results,
    };

  } catch (error) {
    console.error('Error in sendPaymentRejected:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ==========================================
// STATUS UPDATE NOTIFICATIONS
// ==========================================

/**
 * Send order status update notification
 * @param {Object} order - Order object
 * @param {String} previousStatus - Previous status (optional)
 * @returns {Promise<Object>} Notification results
 */
exports.sendStatusUpdate = async (order, previousStatus = null) => {
  try {
    if (!order || !order.orderNumber || !order.status) {
      throw new Error('Invalid order object or status');
    }

    // Define which statuses should trigger notifications
    const notifiableStatuses = [
      'payment-verified',
      'fabric-arranged',
      'stitching-in-progress',
      'quality-check',
      'ready-for-dispatch',
      'out-for-delivery',
      'delivered',
    ];

    if (!notifiableStatuses.includes(order.status)) {
      return { success: false, reason: 'Status not notifiable' };
    }

    const contact = getCustomerContact(order);
    const results = {
      email: { sent: false },
      whatsapp: { sent: false },
    };

    // Send email
    if (contact.email) {
      try {
        const emailResult = await emailConfig.sendStatusUpdate(contact.email, order, order.status);
        results.email = { sent: emailResult.success };
        logNotification('Status Update Email', contact.email, emailResult.success);
      } catch (error) {
        console.error('Status update email failed:', error.message);
        results.email = { sent: false, error: error.message };
      }
    }

    // Send WhatsApp
    if (contact.whatsapp) {
      try {
        const whatsappResult = await whatsappConfig.sendStatusUpdate(contact.whatsapp, order, order.status);
        results.whatsapp = { sent: whatsappResult.success };
        logNotification('Status Update WhatsApp', contact.whatsapp, whatsappResult.success);
      } catch (error) {
        console.error('Status update WhatsApp failed:', error.message);
        results.whatsapp = { sent: false, error: error.message };
      }
    }

    return {
      success: results.email.sent || results.whatsapp.sent,
      results,
    };

  } catch (error) {
    console.error('Error in sendStatusUpdate:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Send order cancellation notification
 * @param {Object} order - Order object
 * @param {String} reason - Cancellation reason
 * @returns {Promise<Object>} Notification results
 */
exports.sendOrderCancellation = async (order, reason = '') => {
  try {
    if (!order || !order.orderNumber) {
      throw new Error('Invalid order object');
    }

    const contact = getCustomerContact(order);
    const results = {
      email: { sent: false },
      whatsapp: { sent: false },
    };

    // Send email
    if (contact.email) {
      try {
        const emailResult = await emailConfig.sendEmail({
          to: contact.email,
          subject: `Order Cancelled - ${order.orderNumber}`,
          text: `Order ${order.orderNumber} has been cancelled. ${reason}`,
          html: `
            <div style="font-family: Arial, sans-serif;">
              <h2 style="color: #EF4444;">Order Cancelled</h2>
              <p><strong>Order Number:</strong> ${order.orderNumber}</p>
              ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
              <p>If you have any questions, please contact us.</p>
            </div>
          `,
        });
        results.email = { sent: emailResult.success };
        logNotification('Cancellation Email', contact.email, emailResult.success);
      } catch (error) {
        console.error('Cancellation email failed:', error.message);
        results.email = { sent: false, error: error.message };
      }
    }

    // Send WhatsApp
    if (contact.whatsapp) {
      try {
        const message = `❌ *Order Cancelled*\n\nOrder: ${order.orderNumber}\n${reason ? `Reason: ${reason}\n` : ''}Contact us if you have questions.`;
        const whatsappResult = await whatsappConfig.sendWhatsAppMessage(contact.whatsapp, message);
        results.whatsapp = { sent: whatsappResult.success };
        logNotification('Cancellation WhatsApp', contact.whatsapp, whatsappResult.success);
      } catch (error) {
        console.error('Cancellation WhatsApp failed:', error.message);
        results.whatsapp = { sent: false, error: error.message };
      }
    }

    return {
      success: results.email.sent || results.whatsapp.sent,
      results,
    };

  } catch (error) {
    console.error('Error in sendOrderCancellation:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ==========================================
// CUSTOMER ENGAGEMENT
// ==========================================

/**
 * Send welcome message to new customer
 * @param {String} email - Customer email
 * @param {String} phone - Customer phone
 * @param {String} name - Customer name
 * @returns {Promise<Object>} Notification results
 */
exports.sendWelcome = async (email, phone, name) => {
  try {
    if (!email && !phone) {
      throw new Error('Either email or phone is required');
    }

    const results = {
      email: { sent: false },
      whatsapp: { sent: false },
    };

    // Send welcome email
    if (email) {
      try {
        const emailResult = await emailConfig.sendWelcomeEmail(email, name || 'Customer');
        results.email = { sent: emailResult.success };
        logNotification('Welcome Email', email, emailResult.success);
      } catch (error) {
        console.error('Welcome email failed:', error.message);
        results.email = { sent: false, error: error.message };
      }
    }

    // Send welcome WhatsApp
    if (phone) {
      try {
        const whatsappResult = await whatsappConfig.sendWelcomeMessage(phone, name || 'Customer');
        results.whatsapp = { sent: whatsappResult.success };
        logNotification('Welcome WhatsApp', phone, whatsappResult.success);
      } catch (error) {
        console.error('Welcome WhatsApp failed:', error.message);
        results.whatsapp = { sent: false, error: error.message };
      }
    }

    return {
      success: results.email.sent || results.whatsapp.sent,
      results,
    };

  } catch (error) {
    console.error('Error in sendWelcome:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ==========================================
// BULK NOTIFICATIONS
// ==========================================

/**
 * Send bulk notifications to multiple customers
 * @param {Array} customers - Array of customer objects
 * @param {String} subject - Email subject
 * @param {String} message - Message content
 * @returns {Promise<Object>} Notification results
 */
exports.sendBulkNotification = async (customers, subject, message) => {
  try {
    if (!Array.isArray(customers) || customers.length === 0) {
      throw new Error('Customers array is required');
    }

    const results = {
      total: customers.length,
      email: { sent: 0, failed: 0 },
      whatsapp: { sent: 0, failed: 0 },
    };

    for (const customer of customers) {
      // Send email
      if (customer.email) {
        try {
          const emailResult = await emailConfig.sendEmail({
            to: customer.email,
            subject,
            text: message,
            html: `<div style="font-family: Arial, sans-serif;"><p>${message}</p></div>`,
          });
          if (emailResult.success) results.email.sent++;
          else results.email.failed++;
        } catch (error) {
          results.email.failed++;
        }
      }

      // Send WhatsApp
      if (customer.phone || customer.whatsapp) {
        try {
          const phone = customer.whatsapp || customer.phone;
          const whatsappResult = await whatsappConfig.sendWhatsAppMessage(phone, message);
          if (whatsappResult.success) results.whatsapp.sent++;
          else results.whatsapp.failed++;
        } catch (error) {
          results.whatsapp.failed++;
        }
      }

      // Rate limiting: wait 1 second between customers
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`📊 Bulk Notification Complete: Email ${results.email.sent}/${customers.length}, WhatsApp ${results.whatsapp.sent}/${customers.length}`);

    return {
      success: true,
      results,
    };

  } catch (error) {
    console.error('Error in sendBulkNotification:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = exports;