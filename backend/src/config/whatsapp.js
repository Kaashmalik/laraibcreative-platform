// backend/src/config/whatsapp.js
// ==========================================
// WHATSAPP API CONFIGURATION (TWILIO)
// ==========================================
// Send WhatsApp notifications for orders, payments, and status updates
// Uses Twilio WhatsApp Business API
// ==========================================

const twilio = require('twilio');

// ==========================================
// VERIFY WHATSAPP CONFIGURATION
// ==========================================

const verifyWhatsAppConfig = () => {
  const required = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_WHATSAPP_NUMBER'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️  WhatsApp Config Warning: Missing ${missing.join(', ')}`);
    console.warn('⚠️  WhatsApp notifications will be disabled');
    return false;
  }

  console.log('✅ WhatsApp: Configuration verified');
  return true;
};

// ==========================================
// CREATE TWILIO CLIENT
// ==========================================

let twilioClient = null;

const createTwilioClient = () => {
  try {
    // Check if WhatsApp is disabled
    if (process.env.MOCK_WHATSAPP === 'true') {
      console.log('💬 WhatsApp: Running in MOCK mode (messages will be logged, not sent)');
      return null;
    }

    if (!verifyWhatsAppConfig()) {
      return null;
    }

    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    console.log('✅ WhatsApp: Twilio client initialized');
    return twilioClient;

  } catch (error) {
    console.error('❌ WhatsApp Client Error:', error.message);
    return null;
  }
};

// Initialize Twilio client
twilioClient = createTwilioClient();

// ==========================================
// WHATSAPP NUMBER FORMATTING
// ==========================================

/**
 * Format phone number for WhatsApp (Pakistani numbers)
 * @param {String} phone - Phone number (with or without country code)
 * @returns {String} Formatted WhatsApp number
 */
const formatWhatsAppNumber = (phone) => {
  if (!phone) {
    throw new Error('Phone number is required');
  }

  // Remove all non-digit characters
  let cleaned = phone.toString().replace(/\D/g, '');

  // If number starts with 0, remove it and add country code
  if (cleaned.startsWith('0')) {
    cleaned = '92' + cleaned.substring(1);
  }

  // If number doesn't start with country code, add it
  if (!cleaned.startsWith('92')) {
    cleaned = '92' + cleaned;
  }

  return `whatsapp:+${cleaned}`;
};

/**
 * Validate Pakistani phone number
 * @param {String} phone - Phone number
 * @returns {Boolean} Valid or not
 */
const isValidPakistaniNumber = (phone) => {
  if (!phone) return false;

  const cleaned = phone.toString().replace(/\D/g, '');
  
  // Pakistani mobile numbers: 03XX-XXXXXXX (11 digits with 0, or 10 without)
  return /^(92)?3[0-9]{9}$/.test(cleaned) || /^03[0-9]{9}$/.test(cleaned);
};

// ==========================================
// SEND WHATSAPP MESSAGE
// ==========================================

/**
 * Send WhatsApp message
 * @param {String} to - Recipient phone number
 * @param {String} message - Message text
 * @param {String} [mediaUrl] - Optional media URL (image)
 * @returns {Promise<Object>} Send result
 */
const sendWhatsAppMessage = async (to, message, mediaUrl = null) => {
  // Validate inputs
  if (!to || !message) {
    throw new Error('Phone number and message are required');
  }

  // Check if Twilio client is initialized
  if (!twilioClient) {
    return {
      success: false,
      error: 'WhatsApp service not configured. Please check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER.',
      code: 'NOT_CONFIGURED'
    };
  }

  try {
    // Validate phone number
    if (!isValidPakistaniNumber(to)) {
      throw new Error('Invalid Pakistani phone number format');
    }

    // Format numbers
    const formattedTo = formatWhatsAppNumber(to);
    const from = process.env.TWILIO_WHATSAPP_NUMBER;

    // Prepare message options
    const messageOptions = {
      from,
      to: formattedTo,
      body: message,
    };

    // Add media if provided
    if (mediaUrl) {
      messageOptions.mediaUrl = [mediaUrl];
    }

    // Send message via Twilio
    const result = await twilioClient.messages.create(messageOptions);

    return {
      success: true,
      sid: result.sid,
      status: result.status,
      to: formattedTo,
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
};

/**
 * Send WhatsApp with retry logic
 * @param {String} to - Recipient phone number
 * @param {String} message - Message text
 * @param {String} [mediaUrl] - Optional media URL
 * @param {Number} [maxRetries=3] - Maximum retry attempts
 * @returns {Promise<Object>} Send result
 */
const sendWhatsAppWithRetry = async (to, message, mediaUrl = null, maxRetries = 3) => {
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await sendWhatsAppMessage(to, message, mediaUrl);

      if (result.success) {
        return result;
      }

      lastError = result.error;

    } catch (error) {
      lastError = error.message;
    }

    // Wait before retry
    if (attempt < maxRetries) {
      const delay = attempt * 2000;
      console.log(`⏳ Retrying WhatsApp send in ${delay / 1000}s (Attempt ${attempt}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.error(`❌ Failed to send WhatsApp after ${maxRetries} attempts`);
  return {
    success: false,
    error: lastError,
    attempts: maxRetries,
  };
};

// ==========================================
// BULK WHATSAPP MESSAGES
// ==========================================

/**
 * Send bulk WhatsApp messages (with rate limiting)
 * @param {Array} messageList - Array of {to, message, mediaUrl}
 * @param {Number} [delay=2000] - Delay between messages (ms)
 * @returns {Promise<Object>} Results summary
 */
const sendBulkWhatsApp = async (messageList, delay = 2000) => {
  if (!Array.isArray(messageList) || messageList.length === 0) {
    throw new Error('Message list must be a non-empty array');
  }

  const results = {
    total: messageList.length,
    sent: 0,
    failed: 0,
    errors: [],
  };

  for (let i = 0; i < messageList.length; i++) {
    const { to, message, mediaUrl } = messageList[i];
    
    if (!to || !message) {
      results.failed++;
      results.errors.push({
        to: to || 'unknown',
        error: 'Missing phone number or message',
      });
      continue;
    }

    const result = await sendWhatsAppMessage(to, message, mediaUrl);

    if (result.success) {
      results.sent++;
    } else {
      results.failed++;
      results.errors.push({
        to,
        error: result.error,
      });
    }

    // Add delay to avoid rate limiting
    if (i < messageList.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.log(`📊 Bulk WhatsApp Results: ${results.sent}/${results.total} sent successfully`);

  return results;
};

// ==========================================
// WHATSAPP MESSAGE TEMPLATES
// ==========================================

/**
 * Send order confirmation via WhatsApp
 * @param {String} to - Customer phone number
 * @param {Object} orderData - Order details
 * @returns {Promise<Object>}
 */
const sendOrderConfirmation = async (to, orderData) => {
  if (!orderData || !orderData.orderNumber || !orderData.total) {
    throw new Error('Invalid order data');
  }

  const frontendUrl = process.env.FRONTEND_URL || '';
  const message = `
🎉 *Order Confirmed!*

Thank you for your order at LaraibCreative!

*Order Number:* ${orderData.orderNumber}
*Total Amount:* Rs. ${orderData.total.toLocaleString()}

We will notify you once your payment is verified.

Track your order: ${frontendUrl}/track-order/${orderData.orderNumber}

📞 Need help? Reply to this message!
  `.trim();

  return await sendWhatsAppMessage(to, message);
};

/**
 * Send payment verification via WhatsApp
 * @param {String} to - Customer phone number
 * @param {Object} orderData - Order details
 * @returns {Promise<Object>}
 */
const sendPaymentVerification = async (to, orderData) => {
  if (!orderData || !orderData.orderNumber || !orderData.total) {
    throw new Error('Invalid order data');
  }

  const message = `
✅ *Payment Verified!*

Your payment has been confirmed!

*Order Number:* ${orderData.orderNumber}
*Amount Paid:* Rs. ${orderData.total.toLocaleString()}

We are now processing your order. You will receive updates as we proceed.

Thank you for choosing LaraibCreative! 💖
  `.trim();

  return await sendWhatsAppMessage(to, message);
};

/**
 * Send order status update via WhatsApp
 * @param {String} to - Customer phone number
 * @param {Object} orderData - Order details
 * @param {String} newStatus - New status
 * @returns {Promise<Object>}
 */
const sendStatusUpdate = async (to, orderData, newStatus) => {
  if (!orderData || !orderData.orderNumber || !newStatus) {
    throw new Error('Invalid order data or status');
  }

  const statusMessages = {
    'fabric-arranged': '📦 Fabric/materials arranged',
    'stitching-in-progress': '✂️ Stitching in progress',
    'quality-check': '🔍 Quality check',
    'ready-for-dispatch': '📮 Ready for dispatch',
    'out-for-delivery': '🚚 Out for delivery',
    'delivered': '✅ Delivered',
  };

  const statusText = statusMessages[newStatus] || newStatus;
  const frontendUrl = process.env.FRONTEND_URL || '';

  const message = `
🔔 *Order Update*

*Order Number:* ${orderData.orderNumber}
*Status:* ${statusText}

${newStatus === 'delivered' ? 
  'Thank you for your order! We hope you love your outfit! 💕' : 
  'We will keep you updated on the progress.'}

Track: ${frontendUrl}/track-order/${orderData.orderNumber}
  `.trim();

  return await sendWhatsAppMessage(to, message);
};

/**
 * Send order ready for pickup/delivery
 * @param {String} to - Customer phone number
 * @param {Object} orderData - Order details
 * @returns {Promise<Object>}
 */
const sendOrderReady = async (to, orderData) => {
  if (!orderData || !orderData.orderNumber) {
    throw new Error('Invalid order data');
  }

  const message = `
🎊 *Your Order is Ready!*

Great news! Your custom order is complete!

*Order Number:* ${orderData.orderNumber}

${orderData.deliveryMethod === 'pickup' ? 
  '📍 Ready for pickup at our location.' : 
  '🚚 Will be dispatched shortly.'}

Thank you for your patience! 💖

Questions? Reply here!
  `.trim();

  return await sendWhatsAppMessage(to, message);
};

/**
 * Send welcome message to new customer
 * @param {String} to - Customer phone number
 * @param {String} name - Customer name
 * @returns {Promise<Object>}
 */
const sendWelcomeMessage = async (to, name) => {
  if (!to || !name) {
    throw new Error('Phone number and name are required');
  }

  const frontendUrl = process.env.FRONTEND_URL || '';
  const message = `
👋 *Welcome to LaraibCreative!*

Hi ${name}! 

Thank you for joining us! We specialize in custom stitching and premium ladies suits.

✨ *What We Offer:*
• Custom Stitching
• Designer Replicas
• Bridal Collection
• Party Wear

Visit: ${frontendUrl}

Need assistance? Just reply to this message! 💬
  `.trim();

  return await sendWhatsAppMessage(to, message);
};

/**
 * Send custom message (for admin notifications)
 * @param {String} to - Recipient phone number
 * @param {String} title - Message title
 * @param {String} body - Message body
 * @returns {Promise<Object>}
 */
const sendCustomMessage = async (to, title, body) => {
  if (!to || !title || !body) {
    throw new Error('Phone number, title, and body are required');
  }

  const message = `
*${title}*

${body}

---
LaraibCreative
  `.trim();

  return await sendWhatsAppMessage(to, message);
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Get message delivery status
 * @param {String} messageSid - Twilio message SID
 * @returns {Promise<Object>} Message status
 */
const getMessageStatus = async (messageSid) => {
  if (!twilioClient) {
    return { success: false, error: 'Twilio client not initialized' };
  }

  if (!messageSid) {
    return { success: false, error: 'Message SID is required' };
  }

  try {
    const message = await twilioClient.messages(messageSid).fetch();

    return {
      success: true,
      status: message.status,
      to: message.to,
      from: message.from,
      dateSent: message.dateSent,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
    };
  } catch (error) {
    console.error('❌ Get Message Status Error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  twilioClient,
  formatWhatsAppNumber,
  isValidPakistaniNumber,
  sendWhatsAppMessage,
  sendWhatsAppWithRetry,
  sendBulkWhatsApp,
  getMessageStatus,

  // Template messages
  sendOrderConfirmation,
  sendPaymentVerification,
  sendStatusUpdate,
  sendOrderReady,
  sendWelcomeMessage,
  sendCustomMessage,
};