// backend/src/config/email.js
// ==========================================
// EMAIL CONFIGURATION WITH NODEMAILER
// ==========================================
// Gmail SMTP configuration for sending transactional emails
// including order confirmations, payment verifications, and notifications
// ==========================================

const nodemailer = require('nodemailer');

// ==========================================
// VERIFY EMAIL CONFIGURATION
// ==========================================

const verifyEmailConfig = () => {
  const required = [
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'EMAIL_FROM'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️  Email Config Warning: Missing ${missing.join(', ')}`);
    console.warn('⚠️  Email notifications will be disabled');
    return false;
  }

  console.log('✅ Email: Configuration verified');
  return true;
};

// ==========================================
// CREATE TRANSPORTER
// ==========================================

let transporter = null;

const createTransporter = () => {
  try {
    // Check if email is disabled in environment
    if (process.env.MOCK_EMAIL === 'true') {
      console.log('📧 Email: Running in MOCK mode (emails will be logged, not sent)');
      return null;
    }

    if (!verifyEmailConfig()) {
      return null;
    }

    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Additional security options
      tls: {
        rejectUnauthorized: false, // For self-signed certificates in development
      },
      // Connection pool
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });

    console.log('✅ Email: Transporter created successfully');
    return transporter;

  } catch (error) {
    console.error('❌ Email Transporter Error:', error.message);
    return null;
  }
};

// Initialize transporter
transporter = createTransporter();

// ==========================================
// EMAIL VERIFICATION
// ==========================================

/**
 * Verify email connection
 * @returns {Promise<Boolean>} Connection status
 */
const verifyConnection = async () => {
  if (!transporter) {
    console.log('⚠️  Email: Transporter not configured');
    return false;
  }

  try {
    await transporter.verify();
    console.log('✅ Email: SMTP connection verified');
    return true;
  } catch (error) {
    console.error('❌ Email Connection Error:', error.message);
    console.error('💡 Tip: Check your Gmail App Password or SMTP credentials');
    return false;
  }
};

// ==========================================
// SEND EMAIL FUNCTION
// ==========================================

/**
 * Send email with retry logic
 * @param {Object} mailOptions - Email options
 * @param {String} mailOptions.to - Recipient email
 * @param {String} mailOptions.subject - Email subject
 * @param {String} mailOptions.text - Plain text content
 * @param {String} mailOptions.html - HTML content
 * @param {Array} mailOptions.attachments - Attachments
 * @returns {Promise<Object>} Send result
 */
const sendEmail = async (mailOptions) => {
  // Mock mode
  if (process.env.MOCK_EMAIL === 'true' || !transporter) {
    console.log('📧 MOCK EMAIL:');
    console.log('   To:', mailOptions.to);
    console.log('   Subject:', mailOptions.subject);
    console.log('   Preview:', mailOptions.text?.substring(0, 100) || 'HTML email');
    return { success: true, messageId: 'mock-email-id', mocked: true };
  }

  try {
    // Prepare email options
    const emailOptions = {
      from: mailOptions.from || process.env.EMAIL_FROM,
      to: mailOptions.to,
      subject: mailOptions.subject,
      text: mailOptions.text,
      html: mailOptions.html,
      attachments: mailOptions.attachments || [],
      replyTo: mailOptions.replyTo || process.env.EMAIL_REPLY_TO,
    };

    // Send email
    const info = await transporter.sendMail(emailOptions);

    console.log('✅ Email sent successfully');
    console.log('   Message ID:', info.messageId);
    console.log('   To:', mailOptions.to);
    console.log('   Subject:', mailOptions.subject);

    return {
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    };

  } catch (error) {
    console.error('❌ Send Email Error:', error.message);
    
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
};

/**
 * Send email with retry logic (up to 3 attempts)
 * @param {Object} mailOptions - Email options
 * @param {Number} maxRetries - Maximum retry attempts
 * @returns {Promise<Object>} Send result
 */
const sendEmailWithRetry = async (mailOptions, maxRetries = 3) => {
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await sendEmail(mailOptions);
      
      if (result.success) {
        return result;
      }

      lastError = result.error;
      
    } catch (error) {
      lastError = error.message;
    }

    // If not last attempt, wait before retry
    if (attempt < maxRetries) {
      const delay = attempt * 2000; // Exponential backoff: 2s, 4s, 6s
      console.log(`⏳ Retrying email send in ${delay / 1000}s (Attempt ${attempt}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.error(`❌ Failed to send email after ${maxRetries} attempts`);
  return {
    success: false,
    error: lastError,
    attempts: maxRetries,
  };
};

// ==========================================
// BULK EMAIL FUNCTIONS
// ==========================================

/**
 * Send bulk emails (with rate limiting)
 * @param {Array} emailList - Array of email options
 * @param {Number} delay - Delay between emails (ms)
 * @returns {Promise<Object>} Results summary
 */
const sendBulkEmails = async (emailList, delay = 1000) => {
  const results = {
    total: emailList.length,
    sent: 0,
    failed: 0,
    errors: [],
  };

  for (let i = 0; i < emailList.length; i++) {
    const result = await sendEmail(emailList[i]);

    if (result.success) {
      results.sent++;
    } else {
      results.failed++;
      results.errors.push({
        email: emailList[i].to,
        error: result.error,
      });
    }

    // Add delay between emails to avoid rate limiting
    if (i < emailList.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.log(`📊 Bulk Email Results: ${results.sent}/${results.total} sent successfully`);
  
  return results;
};

// ==========================================
// EMAIL TEMPLATES (Quick Helpers)
// ==========================================

/**
 * Send order confirmation email
 * @param {String} to - Recipient email
 * @param {Object} orderData - Order details
 * @returns {Promise<Object>}
 */
const sendOrderConfirmation = async (to, orderData) => {
  // This will use the email template from emailTemplates.js
  // For now, a simple implementation
  return await sendEmail({
    to,
    subject: `Order Confirmation - ${orderData.orderNumber}`,
    text: `Your order ${orderData.orderNumber} has been received successfully.`,
    html: `
      <h2>Order Confirmation</h2>
      <p>Thank you for your order!</p>
      <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
      <p>We will process your order shortly.</p>
    `,
  });
};

/**
 * Send payment verification email
 * @param {String} to - Recipient email
 * @param {Object} orderData - Order details
 * @returns {Promise<Object>}
 */
const sendPaymentVerification = async (to, orderData) => {
  return await sendEmail({
    to,
    subject: `Payment Verified - ${orderData.orderNumber}`,
    text: `Your payment for order ${orderData.orderNumber} has been verified.`,
    html: `
      <h2>Payment Verified</h2>
      <p>Your payment has been verified successfully!</p>
      <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
      <p>We are now processing your order.</p>
    `,
  });
};

/**
 * Send order status update email
 * @param {String} to - Recipient email
 * @param {Object} orderData - Order details
 * @param {String} newStatus - New order status
 * @returns {Promise<Object>}
 */
const sendStatusUpdate = async (to, orderData, newStatus) => {
  return await sendEmail({
    to,
    subject: `Order Update - ${orderData.orderNumber}`,
    text: `Your order ${orderData.orderNumber} status: ${newStatus}`,
    html: `
      <h2>Order Status Update</h2>
      <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
      <p><strong>Status:</strong> ${newStatus}</p>
      <p>Track your order: <a href="${process.env.FRONTEND_URL}/track-order/${orderData.orderNumber}">Click here</a></p>
    `,
  });
};

/**
 * Send welcome email to new user
 * @param {String} to - Recipient email
 * @param {String} name - User name
 * @returns {Promise<Object>}
 */
const sendWelcomeEmail = async (to, name) => {
  return await sendEmail({
    to,
    subject: `Welcome to ${process.env.BUSINESS_NAME}!`,
    text: `Welcome ${name}! Thank you for joining us.`,
    html: `
      <h2>Welcome to Laraib Creative!</h2>
      <p>Dear ${name},</p>
      <p>Thank you for joining us. We're excited to have you!</p>
      <p>Start exploring our collections and custom stitching services.</p>
    `,
  });
};

/**
 * Send password reset email
 * @param {String} to - Recipient email
 * @param {String} resetToken - Password reset token
 * @returns {Promise<Object>}
 */
const sendPasswordReset = async (to, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
  
  return await sendEmail({
    to,
    subject: 'Password Reset Request',
    text: `Reset your password: ${resetUrl}`,
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background: #D946A6; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  transporter,
  verifyConnection,
  sendEmail,
  sendEmailWithRetry,
  sendBulkEmails,
  
  // Quick helpers
  sendOrderConfirmation,
  sendPaymentVerification,
  sendStatusUpdate,
  sendWelcomeEmail,
  sendPasswordReset,
};