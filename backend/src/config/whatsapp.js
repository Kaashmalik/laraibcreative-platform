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
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

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
  const cleaned = phone.replace(/\D/g, '');
  
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
 * @param {String} mediaUrl - Optional media URL (image)
 * @returns {Promise<Object>} Send result
 */
const sendWhatsAppMessage = async (to, message, mediaUrl = null) => {
  // Mock mode
  if (process.env.MOCK_WHATSAPP === 'true' || !twilioClient) {
    console.log('💬 MOCK WHATSAPP:');
    console.log('   To:', to);
    console.log('   Message:', message.substring(0, 100));
    return { success: true, sid: 'mock-whatsapp-id', mocked: true };
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

    console.log('✅ WhatsApp sent successfully');
    console.log('   SID:', result.sid);
    console.log('   To:', to);
    console.log('   Status:', result.status);

    return {
      success: true,
      sid: result.sid,
      status: result.status,
      to: formattedTo,
    };

  } catch (error) {
    console.error('❌ Send WhatsApp Error:', error.message);

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
 * @param {String} mediaUrl - Optional media URL
 * @param {Number} maxRetries - Maximum retry attempts
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
 * @param {Number} delay - Delay between messages (ms)
 * @returns {Promise<Object>} Results summary
 */
const sendBulkWhatsApp = async (messageList, delay = 2000) => {
  const results = {
    total: messageList.length,
    sent: 0,
    failed: 0,
    errors: [],
  };

  for (let i = 0; i < messageList.length; i++) {
    const { to, message, mediaUrl } = messageList[i];
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
  const message = `
🎉 *Order Confirmed - LaraibCreative*

Dear Valued Customer,

Thank you so much for placing your order with us! We're truly grateful for your trust in our services.

*Order Details:*
📋 Order Number: ${orderData.orderNumber}
💰 Total Amount: Rs. ${orderData.total}

We've received your order and will begin processing it once your payment is verified. You'll receive an update shortly.

🔗 Track your order: ${process.env.FRONTEND_URL}/track-order/${orderData.orderNumber}

We're here to help! If you have any questions or concerns, please don't hesitate to reply to this message. Our team responds promptly to ensure you have the best experience.

Thank you for choosing LaraibCreative! 💕

_Warm regards,_
_LaraibCreative Team_
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
  const message = `
✅ *Payment Verified - LaraibCreative*

Dear Customer,

Great news! Your payment has been successfully verified and confirmed.

*Order Details:*
📋 Order Number: ${orderData.orderNumber}
💰 Amount Paid: Rs. ${orderData.total}

Your order is now being processed with care and attention to detail. We'll keep you updated at every step of the way.

✨ *What's Next?*
1. ✅ Payment Verified (Completed)
2. ⏳ Fabric/Material Arrangement
3. ⏳ Stitching in Progress
4. ⏳ Quality Check
5. ⏳ Ready for Dispatch
6. ⏳ Out for Delivery

We appreciate your patience and look forward to delivering your beautiful custom outfit!

If you have any questions, feel free to reach out. We're here to help! 💬

Thank you for choosing LaraibCreative! 💕

_Best regards,_
_LaraibCreative Team_
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
  const statusMessages = {
    'fabric-arranged': '📦 Fabric & Materials Arranged',
    'stitching-in-progress': '✂️ Stitching in Progress',
    'quality-check': '🔍 Quality Check in Progress',
    'ready-for-dispatch': '📮 Ready for Dispatch',
    'out-for-delivery': '🚚 Out for Delivery',
    'delivered': '✅ Delivered Successfully',
  };

  const statusDescriptions = {
    'fabric-arranged': 'We\'ve carefully selected and arranged all the materials for your order.',
    'stitching-in-progress': 'Our expert tailors are now working on your custom outfit with precision and care.',
    'quality-check': 'Your order is undergoing our thorough quality inspection to ensure perfection.',
    'ready-for-dispatch': 'Your order is complete and ready to be dispatched to you!',
    'out-for-delivery': 'Great news! Your order is on its way to you. You should receive it soon.',
    'delivered': 'We hope you absolutely love your new outfit! Thank you for choosing LaraibCreative.',
  };

  const statusText = statusMessages[newStatus] || newStatus;
  const statusDesc = statusDescriptions[newStatus] || 'We\'re working on your order and will keep you updated.';

  const message = `
🔔 *Order Status Update - LaraibCreative*

Dear Customer,

We have an update on your order!

*Order Number:* ${orderData.orderNumber}
*Current Status:* ${statusText}

${statusDesc}

${newStatus === 'delivered' ? 
  '\n🎉 We hope you love your outfit! If you have any feedback or need alterations, please don\'t hesitate to reach out. We\'re here to ensure your complete satisfaction.\n\nThank you for choosing LaraibCreative! 💕' : 
  '\nWe\'ll continue to keep you informed as your order progresses. If you have any questions, feel free to reply to this message - we respond promptly!\n\nThank you for your patience! 🙏'}

🔗 Track your order: ${process.env.FRONTEND_URL}/track-order/${orderData.orderNumber}

_Warm regards,_
_LaraibCreative Team_
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
  const message = `
👋 *Welcome to LaraibCreative!*

Dear ${name},

We're absolutely delighted to have you join the LaraibCreative family! Thank you for choosing us for your custom stitching needs.

✨ *What We Offer:*
• Custom Stitching Services
• Designer Replicas
• Exclusive Bridal Collection
• Elegant Party Wear
• Premium Fabrics & Materials

At LaraibCreative, we believe in turning your thoughts and emotions into beautiful reality. Every piece is crafted with love, attention to detail, and a commitment to excellence.

🌐 Visit us: ${process.env.FRONTEND_URL}

We're here to help you create the perfect outfit for any occasion. If you have any questions, need style advice, or want to discuss your custom order, please don't hesitate to reply to this message. Our team responds promptly to ensure you have the best experience!

Thank you for trusting us with your fashion needs! 💕

_Warm regards,_
_LaraibCreative Team_
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
  const message = `
*${title}*

${body}

---
Laraib Creative
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