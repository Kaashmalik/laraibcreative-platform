// backend/src/utils/whatsappService.js

const axios = require('axios');
const logger = require('./logger');

/**
 * WhatsApp Business API Configuration
 * Using Twilio WhatsApp API (you can switch to other providers like WhatsApp Business API, etc.)
 * 
 * Setup Instructions:
 * 1. Sign up for Twilio: https://www.twilio.com/
 * 2. Get WhatsApp sandbox number or apply for production access
 * 3. Set environment variables:
 *    - TWILIO_ACCOUNT_SID
 *    - TWILIO_AUTH_TOKEN
 *    - TWILIO_WHATSAPP_NUMBER
 */

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Twilio sandbox number

/**
 * Format phone number for WhatsApp
 * Ensures number is in international format with country code
 */
function formatPhoneNumber(phone) {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // If number doesn't start with country code, assume Pakistan (+92)
  if (!cleaned.startsWith('92')) {
    // Remove leading 0 if present
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    cleaned = '92' + cleaned;
  }

  return `whatsapp:+${cleaned}`;
}

/**
 * Send WhatsApp message using Twilio
 */
async function sendWhatsAppMessage(to, message) {
  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      logger.warn('Twilio credentials not configured. WhatsApp message not sent.');
      return { success: false, message: 'WhatsApp not configured' };
    }

    const formattedTo = formatPhoneNumber(to);

    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    const response = await axios.post(
      url,
      new URLSearchParams({
        From: TWILIO_WHATSAPP_FROM,
        To: formattedTo,
        Body: message
      }),
      {
        auth: {
          username: TWILIO_ACCOUNT_SID,
          password: TWILIO_AUTH_TOKEN
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    logger.info(`WhatsApp message sent to ${to}`, { sid: response.data.sid });
    return { success: true, sid: response.data.sid };

  } catch (error) {
    logger.error('Error sending WhatsApp message:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send order confirmation via WhatsApp
 */
exports.sendOrderConfirmation = async (phone, order) => {
  const message = `🎉 *Order Confirmation - LaraibCreative*

Thank you for your order!

*Order Number:* ${order.orderNumber}
*Total Amount:* PKR ${order.pricing.total.toLocaleString()}
*Payment Method:* ${order.payment.method.replace('-', ' ').toUpperCase()}

${order.payment.method === 'cod' ? 
  `*Advance Paid:* PKR ${order.payment.advanceAmount.toLocaleString()}\n*Remaining:* PKR ${order.payment.remainingAmount.toLocaleString()}\n` : 
  '*Status:* Payment verification pending\n'}
*Estimated Delivery:* ${new Date(order.estimatedCompletion).toLocaleDateString('en-PK', { 
  day: 'numeric', 
  month: 'long', 
  year: 'numeric' 
})}

Track your order: ${process.env.FRONTEND_URL}/track-order/${order.orderNumber}

We'll keep you updated on your order status! 💕

_LaraibCreative - Turning emotions into reality_`;

  return sendWhatsAppMessage(phone, message);
};

/**
 * Notify admin about new order
 */
exports.notifyAdminNewOrder = async (phone, order) => {
  const message = `🔔 *New Order Received*

*Order:* ${order.orderNumber}
*Customer:* ${order.customerInfo.name}
*Phone:* ${order.customerInfo.phone}
*Total:* PKR ${order.pricing.total.toLocaleString()}
*Payment:* ${order.payment.method.toUpperCase()}
*Items:* ${order.items.length}

${order.items.map((item, i) => 
  `${i + 1}. ${item.productSnapshot.title} ${item.isCustom ? '(Custom)' : ''}`
).join('\n')}

View: ${process.env.ADMIN_URL}/orders/${order._id}`;

  return sendWhatsAppMessage(phone, message);
};

/**
 * Send payment verified notification
 */
exports.sendPaymentVerified = async (phone, order) => {
  const message = `✅ *Payment Verified - LaraibCreative*

Great news! Your payment has been verified.

*Order Number:* ${order.orderNumber}
*Amount Verified:* PKR ${order.pricing.total.toLocaleString()}

Your order is now being processed! 🎊

We'll notify you as it moves through each stage:
1. ✅ Payment Verified (Current)
2. ⏳ Fabric Arrangement
3. ⏳ Stitching in Progress
4. ⏳ Quality Check
5. ⏳ Ready for Dispatch
6. ⏳ Out for Delivery
7. ⏳ Delivered

Track: ${process.env.FRONTEND_URL}/track-order/${order.orderNumber}`;

  return sendWhatsAppMessage(phone, message);
};

/**
 * Send payment rejected notification
 */
exports.sendPaymentRejected = async (phone, order, reason) => {
  const message = `⚠️ *Payment Verification Issue - LaraibCreative*

*Order Number:* ${order.orderNumber}

We couldn't verify your payment.
${reason ? `\n*Reason:* ${reason}\n` : ''}
Please re-upload a clear payment receipt or contact us:

📞 Call: ${process.env.BUSINESS_PHONE}
💬 WhatsApp: ${process.env.BUSINESS_WHATSAPP}

We're here to help! 🙏`;

  return sendWhatsAppMessage(phone, message);
};

/**
 * Send status update notification
 */
exports.sendStatusUpdate = async (phone, order, statusMessage) => {
  const statusEmojis = {
    'payment-verified': '✅',
    'fabric-arranged': '🧵',
    'stitching-in-progress': '✂️',
    'quality-check': '🔍',
    'ready-for-dispatch': '📦',
    'out-for-delivery': '🚚',
    'delivered': '🎉'
  };

  const emoji = statusEmojis[order.status] || '📌';

  const message = `${emoji} *Order Update - ${order.orderNumber}*

${statusMessage}

${order.status === 'out-for-delivery' && order.tracking?.trackingNumber ? 
  `*Tracking:* ${order.tracking.trackingNumber}\n*Courier:* ${order.tracking.courierService}\n` : ''}

${order.status === 'delivered' ? 
  `Thank you for choosing LaraibCreative! 💕\n\nWe'd love to hear your feedback! Please leave us a review.\n` : 
  `Track: ${process.env.FRONTEND_URL}/track-order/${order.orderNumber}`}`;

  return sendWhatsAppMessage(phone, message);
};

/**
 * Send order cancellation notification
 */
exports.sendOrderCancellation = async (phone, order, reason) => {
  const message = `❌ *Order Cancelled - ${order.orderNumber}*

Your order has been cancelled.
${reason ? `\n*Reason:* ${reason}\n` : ''}
${order.payment.status === 'verified' ? 
  `\nRefund will be processed within 3-5 business days.\n` : ''}

If you have any questions, please contact us:
📞 ${process.env.BUSINESS_PHONE}
💬 WhatsApp: ${process.env.BUSINESS_WHATSAPP}

We hope to serve you again soon! 🙏`;

  return sendWhatsAppMessage(phone, message);
};

/**
 * Request delivery confirmation
 */
exports.requestDeliveryConfirmation = async (phone, order) => {
  const message = `📦 *Delivery Confirmation Request*

*Order:* ${order.orderNumber}

Has your order been delivered?

Please confirm by replying:
✅ "Yes, received"
❌ "No, not yet"

Or contact us:
📞 ${process.env.BUSINESS_PHONE}

Thank you! 🙏`;

  return sendWhatsAppMessage(phone, message);
};

/**
 * Send measurement reminder
 */
exports.sendMeasurementReminder = async (phone, customerName) => {
  const message = `📏 *Measurement Reminder - LaraibCreative*

Hi ${customerName}!

Don't forget to save your measurements in your account for quick custom orders!

How to measure: ${process.env.FRONTEND_URL}/size-guide

Need help? Contact us:
📞 ${process.env.BUSINESS_PHONE}
💬 WhatsApp: ${process.env.BUSINESS_WHATSAPP}`;

  return sendWhatsAppMessage(phone, message);
};

/**
 * Send fabric arrival notification
 */
exports.sendFabricArrivalNotification = async (phone, order) => {
  const message = `🧵 *Fabric Update - ${order.orderNumber}*

Good news! The fabric for your order has arrived and quality checked.

We'll start stitching soon! ✂️

Track: ${process.env.FRONTEND_URL}/track-order/${order.orderNumber}`;

  return sendWhatsAppMessage(phone, message);
};

/**
 * Send quality check completion notification
 */
exports.sendQualityCheckComplete = async (phone, order) => {
  const message = `🔍 *Quality Check Complete - ${order.orderNumber}*

Your order has passed our quality check with flying colors! ✨

It's now being packed and will be dispatched soon. 📦

Track: ${process.env.FRONTEND_URL}/track-order/${order.orderNumber}`;

  return sendWhatsAppMessage(phone, message);
};

/**
 * Send dispatch notification
 */
exports.sendDispatchNotification = async (phone, order) => {
  const message = `🚚 *Your Order is On The Way!*

*Order:* ${order.orderNumber}
*Courier:* ${order.tracking?.courierService || 'TCS/Leopards'}
*Tracking:* ${order.tracking?.trackingNumber || 'Will be updated soon'}

Expected delivery: 2-3 business days

Track: ${process.env.FRONTEND_URL}/track-order/${order.orderNumber}

Thank you for your patience! 💕`;

  return sendWhatsAppMessage(phone, message);
};

/**
 * Send promotional message (use sparingly)
 */
exports.sendPromotionalMessage = async (phone, customerName, offer) => {
  const message = `🎉 *Special Offer - LaraibCreative*

Hi ${customerName}!

${offer.message}

${offer.code ? `Use code: *${offer.code}*\n` : ''}
${offer.validUntil ? `Valid until: ${new Date(offer.validUntil).toLocaleDateString('en-PK')}\n` : ''}

Shop now: ${process.env.FRONTEND_URL}

_Terms and conditions apply_`;

  return sendWhatsAppMessage(phone, message);
};

/**
 * Send order reminder for abandoned cart
 */
exports.sendCartReminder = async (phone, customerName) => {
  const message = `🛍️ *You left something behind! - LaraibCreative*

Hi ${customerName}!

You have items waiting in your cart. Complete your order now! 💕

Your cart: ${process.env.FRONTEND_URL}/cart

Need help? Contact us:
📞 ${process.env.BUSINESS_PHONE}`;

  return sendWhatsAppMessage(phone, message);
};

/**
 * Send bulk WhatsApp messages (with rate limiting)
 */
exports.sendBulkMessages = async (recipients, messageTemplate) => {
  const results = [];
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    
    try {
      const message = typeof messageTemplate === 'function' 
        ? messageTemplate(recipient) 
        : messageTemplate;

      const result = await sendWhatsAppMessage(recipient.phone, message);
      results.push({ phone: recipient.phone, success: result.success });

      // Rate limiting: 1 message per second to avoid blocking
      if (i < recipients.length - 1) {
        await delay(1000);
      }

    } catch (error) {
      logger.error(`Failed to send WhatsApp to ${recipient.phone}:`, error);
      results.push({ phone: recipient.phone, success: false, error: error.message });
    }
  }

  const successful = results.filter(r => r.success).length;
  logger.info(`Bulk WhatsApp sent: ${successful}/${recipients.length} successful`);

  return { total: recipients.length, successful, results };
};

/**
 * Verify WhatsApp number format
 */
exports.isValidWhatsAppNumber = (phone) => {
  // Basic validation for Pakistani numbers
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};

/**
 * Test WhatsApp connection
 */
exports.testConnection = async () => {
  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return { success: false, message: 'Twilio credentials not configured' };
    }

    // Send test message to admin number
    const testPhone = process.env.ADMIN_WHATSAPP;
    if (!testPhone) {
      return { success: false, message: 'Admin WhatsApp number not configured' };
    }

    const result = await sendWhatsAppMessage(
      testPhone,
      '✅ WhatsApp connection test successful - LaraibCreative'
    );

    return result;

  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = exports;