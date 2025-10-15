const nodemailer = require('nodemailer');
const {
  welcomeEmail,
  emailVerification,
  emailVerifiedSuccess,
  passwordResetEmail,
  passwordResetSuccess,
  accountLockedEmail,
  loginNotification,
  profileUpdateNotification
} = require('./emailTemplates');

/**
 * Create nodemailer transporter based on environment
 * Production: Use actual SMTP service (Gmail, SendGrid, etc.)
 * Development: Use Ethereal for testing
 */
const createTransporter = async () => {
  // Production environment
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  
  // Development environment - use Ethereal for testing
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } catch (error) {
    console.error('Error creating test email account:', error);
    throw error;
  }
};

/**
 * Base email sending function
 * @param {object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 * @returns {Promise<object>} Send result
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'LaraibCreative'}" <${process.env.EMAIL_FROM || 'noreply@laraibcreative.com'}>`,
      to,
      subject,
      html,
      text: text || '' // Plain text version for email clients that don't support HTML
    };

    const info = await transporter.sendMail(mailOptions);
    
    // Log preview URL in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Email sent successfully!');
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } else {
      console.log('📧 Email sent to:', to);
    }
    
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send welcome email to new users
 * @param {string} email - User email
 * @param {string} userName - User's full name
 * @param {string} verificationToken - Email verification token
 */
const sendWelcomeEmail = async (email, userName, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`;
  
  return await sendEmail({
    to: email,
    subject: 'Welcome to LaraibCreative! Please verify your email',
    html: welcomeEmail(userName, verificationUrl)
  });
};

/**
 * Send email verification link
 * @param {string} email - User email
 * @param {string} userName - User's full name
 * @param {string} verificationToken - Email verification token
 */
const sendVerificationEmail = async (email, userName, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`;
  
  return await sendEmail({
    to: email,
    subject: 'Verify Your Email - LaraibCreative',
    html: emailVerification(userName, verificationUrl)
  });
};

/**
 * Send email verification success notification
 * @param {string} email - User email
 * @param {string} userName - User's full name
 */
const sendEmailVerifiedNotification = async (email, userName) => {
  return await sendEmail({
    to: email,
    subject: 'Email Verified Successfully - LaraibCreative',
    html: emailVerifiedSuccess(userName)
  });
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} userName - User's full name
 * @param {string} resetToken - Password reset token
 */
const sendPasswordResetEmail = async (email, userName, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
  
  return await sendEmail({
    to: email,
    subject: 'Reset Your Password - LaraibCreative',
    html: passwordResetEmail(userName, resetUrl)
  });
};

/**
 * Send password reset success notification
 * @param {string} email - User email
 * @param {string} userName - User's full name
 */
const sendPasswordResetSuccessEmail = async (email, userName) => {
  return await sendEmail({
    to: email,
    subject: 'Password Changed Successfully - LaraibCreative',
    html: passwordResetSuccess(userName)
  });
};

/**
 * Send account locked notification
 * @param {string} email - User email
 * @param {string} userName - User's full name
 * @param {Date} lockUntil - Lock expiration date
 */
const sendAccountLockedEmail = async (email, userName, lockUntil) => {
  const unlockTime = new Date(lockUntil).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  
  return await sendEmail({
    to: email,
    subject: 'Account Temporarily Locked - LaraibCreative',
    html: accountLockedEmail(userName, unlockTime)
  });
};

/**
 * Send login notification (optional security feature)
 * @param {string} email - User email
 * @param {string} userName - User's full name
 * @param {object} loginDetails - Login details (ip, device, location, time)
 */
const sendLoginNotification = async (email, userName, loginDetails) => {
  return await sendEmail({
    to: email,
    subject: 'New Login to Your Account - LaraibCreative',
    html: loginNotification(userName, loginDetails)
  });
};

/**
 * Send profile update notification
 * @param {string} email - User email
 * @param {string} userName - User's full name
 * @param {array} updatedFields - Array of updated field names
 */
const sendProfileUpdateNotification = async (email, userName, updatedFields) => {
  return await sendEmail({
    to: email,
    subject: 'Profile Updated - LaraibCreative',
    html: profileUpdateNotification(userName, updatedFields)
  });
};

/**
 * Verify email configuration by sending a test email
 * Used for testing email setup in development
 */
const verifyEmailConfig = async () => {
  try {
    const transporter = await createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration is valid and ready to send emails');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendEmailVerifiedNotification,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
  sendAccountLockedEmail,
  sendLoginNotification,
  sendProfileUpdateNotification,
  verifyEmailConfig
};