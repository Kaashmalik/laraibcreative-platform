// backend/src/utils/whatsappService.js
// ==========================================
// WHATSAPP SERVICE UTILITY
// ==========================================
// Alternative implementation using direct Twilio API calls
// Provides additional utility functions and templates
// ==========================================

const axios = require('axios');

// ==========================================
// CONFIGURATION
// ==========================================

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Format phone number for WhatsApp
 * Ensures number is in international format with country code
 * @param {String} phone - Phone number
 * @returns {String} Formatted number
 */
function formatPhoneNumber(phone) {
  if (!phone) {
    throw new Error('Phone number is required');
  }

  // Remove all non-digit characters
  let cleaned = phone.toString().replace(/\D/g, '');

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
 * Validate phone number
 * @param {String} phone - Phone number
 * @returns {Boolean} Is valid
 */
function isValidPhone(phone) {
  if (!phone) return false;
  const cleaned = phone.toString().replace(/\D/g, '');
  // Pakistani mobile: 03XX-XXXXXXX (11 digits) or 923XX-XXXXXXX (12 digits)
  return /^(92)?3[0-9]{9}$/.test(cleaned) || /^03[0-9]{9}$/.test(cleaned);
}

// ==========================================
// CORE SEND FUNCTION
// ==========================================

/**
 * Send WhatsApp message using Twilio REST API
 * @param {String} to - Recipient phone number
 * @param {String} message - Message text
 * @param {String} [mediaUrl] - Optional media URL
 * @returns {Promise<Object>} Send result
 */
async function sendWhatsAppMessage(to, message, mediaUrl = null) {
  try {
    // Validate configuration
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      console.warn('⚠️  Twilio credentials not configured. WhatsApp message not sent.');
      return { 
        success: false, 
        error: 'WhatsApp not configured',
        mocked: true,
      };
    }

    // Validate inputs
    if (!to || !message) {
      throw new Error('Phone number and message are required');
    }

    if (!isValidPhone(to)) {
      throw new Error('Invalid phone number format');
    }

    // Format phone number
    const formattedTo = formatPhoneNumber(to);

    // Prepare API request
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    
    const params = new URLSearchParams({
      From: TWILIO_WHATSAPP_FROM,
      To: formattedTo,
      Body: message,
    });

    // Add media if provided
    if (mediaUrl) {
      params.append('MediaUrl', mediaUrl);
    }

    // Send request
    const response = await axios.post(url, params, {
      auth: {
        username: TWILIO_ACCOUNT_SID,
        password: TWILIO_AUTH_TOKEN,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 10000, // 10 seconds timeout
    });

    console.log(`✅ WhatsApp sent to ${to}`, { sid: response.data.sid });

    return { 
      success: true, 
      sid: response.data.sid,
      status: response.data.status,
    };

  } catch (error) {
    console.error('❌ WhatsApp send error:', error.response?.data || error.message);
    
    return { 
      success: false, 
      error: error.response?.data?.message || error.message,
      code: error.response?.data?.code || error.code,
    };
  }
}

/**
 * Send WhatsApp with retry logic
 * @param {String} to - Recipient phone
 * @param {String} message - Message text
 * @param {Number} [maxRetries=3] - Max retry attempts
 * @returns {Promise<Object>} Result
 */
async function sendWithRetry(to, message, maxRetries = 3) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await sendWhatsAppMessage(to, message);
      
      if (result.success) {
        return result;
      }

      lastError = result.error;

    } catch (error) {
      lastError = error.message;
    }

    // Wait before retry (exponential backoff)
    if (attempt < maxRetries) {
      const delay = attempt * 1500; // 1.5s, 3s, 4.5s
      console.log(`⏳ Retry in ${delay / 1000}s (${attempt}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    error: lastError,
    attempts: maxRetries,
  };
}

// ==========================================
// MESSAGE TEMPLATES
// ==========================================

/**
 * Send order confirmation via WhatsApp
 * @param {String} phone - Customer phone
 * @param {Object} order - Order object
 * @returns {Promise<Object>}
 */
exports.sendOrderConfirmation = async (phone, order) => {
  if (!order || !order.orderNumber) {
    throw new Error('Invalid order object');
  }

  const total = order.pricing?.total || order.total || 0;
  const frontendUrl = process.env.FRONTEND_URL || '';

  const message = `
🎉 *Order Confirmation - LaraibCreative*

Dear Valued Customer,

Thank you so much for placing your order with us! We're truly grateful for your trust in our services.

*Order Details:*
📋 Order Number: ${order.orderNumber}
💰 Total Amount: PKR ${total.toLocaleString()}
💳 Payment Method: ${(order.payment?.method || 'cod').toUpperCase()}

${order.payment?.method === 'cod' ? 
  `💵 Advance Paid: PKR ${(order.payment?.advanceAmount || 0).toLocaleString()}\n💵 Remaining Amount: PKR ${(order.payment?.remainingAmount || 0).toLocaleString()}\n` : 
  '⏳ Status: Payment verification pending\n'}
📅 Estimated Delivery: ${order.estimatedCompletion ? new Date(order.estimatedCompletion).toLocaleDateString('en-PK', { 
  day: 'numeric', 
  month: 'long', 
  year: 'numeric' 
}) : 'Will be confirmed soon'}

We've received your order and will begin processing it once your payment is verified. You'll receive an update shortly.

🔗 Track your order: ${frontendUrl}/track-order/${order.orderNumber}

We're here to help! If you have any questions or concerns, please don't hesitate to reply to this message. Our team responds promptly to ensure you have the best experience.

Thank you for choosing LaraibCreative! 💕

_Warm regards,_
_LaraibCreative Team_
  `.trim();

  return sendWithRetry(phone, message);
};

/**
 * Notify admin about new order
 * @param {String} phone - Admin phone
 * @param {Object} order - Order object
 * @returns {Promise<Object>}
 */
exports.notifyAdminNewOrder = async (phone, order) => {
  if (!order || !order.orderNumber) {
    throw new Error('Invalid order object');
  }

  const total = order.pricing?.total || order.total || 0;
  const items = order.items || [];

  const message = `
🔔 *New Order Received*

*Order:* ${order.orderNumber}
*Customer:* ${order.customerInfo?.name || 'N/A'}
*Phone:* ${order.customerInfo?.phone || 'N/A'}
*Total:* PKR ${total.toLocaleString()}
*Payment:* ${(order.payment?.method || 'cod').toUpperCase()}
*Items:* ${items.length}

${items.slice(0, 3).map((item, i) => 
  `${i + 1}. ${item.productSnapshot?.title || item.title || 'Item'} ${item.isCustom ? '(Custom)' : ''}`
).join('\n')}
${items.length > 3 ? `\n...and ${items.length - 3} more` : ''}

View in admin panel
  `.trim();

  return sendWithRetry(phone, message);
};

/**
 * Send payment verified notification
 * @param {String} phone - Customer phone
 * @param {Object} order - Order object
 * @returns {Promise<Object>}
 */
exports.sendPaymentVerified = async (phone, order) => {
  if (!order || !order.orderNumber) {
    throw new Error('Invalid order object');
  }

  const total = order.pricing?.total || order.total || 0;
  const frontendUrl = process.env.FRONTEND_URL || '';

  const message = `
✅ *Payment Verified - LaraibCreative*

Dear Customer,

Great news! Your payment has been successfully verified and confirmed.

*Order Details:*
📋 Order Number: ${order.orderNumber}
💰 Amount Verified: PKR ${total.toLocaleString()}

Your order is now being processed with care and attention to detail. We'll keep you updated at every step of the way.

✨ *What's Next?*
1. ✅ Payment Verified (Completed)
2. ⏳ Fabric/Material Arrangement
3. ⏳ Stitching in Progress
4. ⏳ Quality Check
5. ⏳ Ready for Dispatch
6. ⏳ Out for Delivery
7. ⏳ Delivered

We appreciate your patience and look forward to delivering your beautiful custom outfit!

If you have any questions, feel free to reach out. We're here to help! 💬

🔗 Track: ${frontendUrl}/track-order/${order.orderNumber}

Thank you for choosing LaraibCreative! 💕

_Best regards,_
_LaraibCreative Team_
  `.trim();

  return sendWithRetry(phone, message);
};

/**
 * Send payment rejected notification
 * @param {String} phone - Customer phone
 * @param {Object} order - Order object
 * @param {String} reason - Rejection reason
 * @returns {Promise<Object>}
 */
exports.sendPaymentRejected = async (phone, order, reason = '') => {
  if (!order || !order.orderNumber) {
    throw new Error('Invalid order object');
  }

  const businessPhone = process.env.BUSINESS_PHONE || '';
  const businessWhatsApp = process.env.BUSINESS_WHATSAPP || '';

  const message = `
⚠️ *Payment Verification - Action Required*

Dear Customer,

We hope this message finds you well. We're having trouble verifying your payment for the following order:

*Order Number:* ${order.orderNumber}
${reason ? `\n*Reason:* ${reason}\n` : ''}

We want to ensure your order is processed as quickly as possible. Could you please:

1. Re-upload a clear, high-quality photo of your payment receipt
2. Ensure the receipt shows:
   - Transaction ID
   - Date and time
   - Amount transferred
   - Account details

If you've already made the payment, please don't worry - we're here to help resolve this quickly!

${businessPhone ? `📞 Call us: ${businessPhone}\n` : ''}${businessWhatsApp ? `💬 WhatsApp: ${businessWhatsApp}\n` : ''}

Our team is available to assist you. We respond promptly to ensure your order moves forward smoothly.

Thank you for your patience and understanding! 🙏

_Warm regards,_
_LaraibCreative Team_
  `.trim();

  return sendWithRetry(phone, message);
};

/**
 * Send status update notification
 * @param {String} phone - Customer phone
 * @param {Object} order - Order object
 * @param {String} statusMessage - Status message
 * @returns {Promise<Object>}
 */
exports.sendStatusUpdate = async (phone, order, statusMessage) => {
  if (!order || !order.orderNumber) {
    throw new Error('Invalid order object');
  }

  const frontendUrl = process.env.FRONTEND_URL || '';
  const status = order.status || '';

  const statusEmojis = {
    'payment-verified': '✅',
    'fabric-arranged': '🧵',
    'stitching-in-progress': '✂️',
    'quality-check': '🔍',
    'ready-for-dispatch': '📦',
    'out-for-delivery': '🚚',
    'delivered': '🎉',
  };

  const emoji = statusEmojis[status] || '📌';

  const message = `
${emoji} *Order Update - ${order.orderNumber}*

${statusMessage}

${status === 'out-for-delivery' && order.tracking?.trackingNumber ? 
  `*Tracking:* ${order.tracking.trackingNumber}\n*Courier:* ${order.tracking.courierService}\n` : ''}

${status === 'delivered' ? 
  `Thank you for choosing LaraibCreative! 💕\n\nWe'd love to hear your feedback!` : 
  `Track: ${frontendUrl}/track-order/${order.orderNumber}`}
  `.trim();

  return sendWithRetry(phone, message);
};

/**
 * Send order cancellation notification
 * @param {String} phone - Customer phone
 * @param {Object} order - Order object
 * @param {String} reason - Cancellation reason
 * @returns {Promise<Object>}
 */
exports.sendOrderCancellation = async (phone, order, reason = '') => {
  if (!order || !order.orderNumber) {
    throw new Error('Invalid order object');
  }

  const businessPhone = process.env.BUSINESS_PHONE || '';
  const businessWhatsApp = process.env.BUSINESS_WHATSAPP || '';

  const message = `
❌ *Order Cancellation - ${order.orderNumber}*

Dear Customer,

We're sorry to inform you that your order has been cancelled.

*Order Number:* ${order.orderNumber}
${reason ? `\n*Reason:* ${reason}\n` : ''}

${order.payment?.status === 'verified' ? 
  `\n💰 *Refund Information:*\nYour refund will be processed within 3-5 business days. You'll receive a confirmation once it's initiated. If you have any questions about the refund process, please don't hesitate to reach out.\n` : ''}

We understand this may be disappointing, and we sincerely apologize for any inconvenience this may have caused.

If you have any questions or concerns, or if you'd like to place a new order, please don't hesitate to contact us. We're here to help!

${businessPhone ? `📞 Call us: ${businessPhone}\n` : ''}${businessWhatsApp ? `💬 WhatsApp: ${businessWhatsApp}\n` : ''}

We hope to have the opportunity to serve you again in the future. Thank you for your understanding! 🙏

_Warm regards,_
_LaraibCreative Team_
  `.trim();

  return sendWithRetry(phone, message);
};

/**
 * Request delivery confirmation
 * @param {String} phone - Customer phone
 * @param {Object} order - Order object
 * @returns {Promise<Object>}
 */
exports.requestDeliveryConfirmation = async (phone, order) => {
  if (!order || !order.orderNumber) {
    throw new Error('Invalid order object');
  }

  const businessPhone = process.env.BUSINESS_PHONE || '';

  const message = `
📦 *Delivery Confirmation Request*

Dear Customer,

We hope you're doing well! We'd like to confirm the delivery status of your order.

*Order Number:* ${order.orderNumber}

Has your order been delivered to you?

Please reply with:
✅ "Yes, received" - if you've received your order
❌ "No, not yet" - if you haven't received it yet

Your feedback helps us ensure you've received your order safely and on time. If you have any concerns or need assistance, we're here to help!

${businessPhone ? `📞 Contact us: ${businessPhone}\n` : ''}

Thank you for your cooperation! 🙏

_Warm regards,_
_LaraibCreative Team_
  `.trim();

  return sendWithRetry(phone, message);
};

// ==========================================
// BULK MESSAGING
// ==========================================

/**
 * Send bulk WhatsApp messages with rate limiting
 * @param {Array} recipients - Array of {phone, message}
 * @param {Function|String} messageTemplate - Template function or string
 * @returns {Promise<Object>} Results
 */
exports.sendBulkMessages = async (recipients, messageTemplate) => {
  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw new Error('Recipients array is required');
  }

  const results = {
    total: recipients.length,
    sent: 0,
    failed: 0,
    errors: [],
  };

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    
    try {
      const message = typeof messageTemplate === 'function' 
        ? messageTemplate(recipient) 
        : messageTemplate;

      const result = await sendWhatsAppMessage(recipient.phone, message);
      
      if (result.success) {
        results.sent++;
      } else {
        results.failed++;
        results.errors.push({ 
          phone: recipient.phone, 
          error: result.error,
        });
      }

    } catch (error) {
      results.failed++;
      results.errors.push({ 
        phone: recipient.phone, 
        error: error.message,
      });
    }

    // Rate limiting: 1 message per second
    if (i < recipients.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`📊 Bulk WhatsApp: ${results.sent}/${results.total} sent`);

  return results;
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Verify WhatsApp number format
 * @param {String} phone - Phone number
 * @returns {Boolean} Is valid
 */
exports.isValidWhatsAppNumber = isValidPhone;

/**
 * Test WhatsApp connection
 * @returns {Promise<Object>} Test result
 */
exports.testConnection = async () => {
  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return { 
        success: false, 
        error: 'Twilio credentials not configured',
      };
    }

    const testPhone = process.env.ADMIN_WHATSAPP;
    if (!testPhone) {
      return { 
        success: false, 
        error: 'Admin WhatsApp not configured',
      };
    }

    const result = await sendWhatsAppMessage(
      testPhone,
      '✅ WhatsApp connection test successful - LaraibCreative'
    );

    return result;

  } catch (error) {
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