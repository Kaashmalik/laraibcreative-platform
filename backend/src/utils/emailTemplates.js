/**
 * Email Templates for LaraibCreative
 * HTML email templates for various notifications
 */

// Base email wrapper with consistent styling
const emailWrapper = (content, preheader = '') => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>LaraibCreative</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f4f4;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 30px 20px;
          text-align: center;
        }
        .logo {
          color: #ffffff;
          font-size: 28px;
          font-weight: bold;
          text-decoration: none;
          letter-spacing: 1px;
        }
        .content {
          padding: 40px 30px;
          color: #333333;
          line-height: 1.6;
        }
        .button {
          display: inline-block;
          padding: 14px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: 600;
        }
        .footer {
          background-color: #f8f8f8;
          padding: 30px;
          text-align: center;
          color: #666666;
          font-size: 14px;
        }
        .social-links {
          margin: 20px 0;
        }
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          color: #667eea;
          text-decoration: none;
        }
        h1 {
          color: #333333;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .info-box {
          background-color: #f8f9fa;
          border-left: 4px solid #667eea;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .warning-box {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        @media only screen and (max-width: 600px) {
          .content {
            padding: 20px 15px;
          }
          h1 {
            font-size: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>
      <div class="email-container">
        <div class="header">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="logo">LaraibCreative</a>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p><strong>LaraibCreative</strong></p>
          <p>Custom Pakistani Fashion & Tailoring</p>
          <div class="social-links">
            <a href="#">Facebook</a> | 
            <a href="#">Instagram</a> | 
            <a href="#">WhatsApp</a>
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #999;">
            You're receiving this email because you have an account with LaraibCreative.<br>
            <a href="${process.env.FRONTEND_URL}/account/preferences" style="color: #667eea;">Update your email preferences</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Welcome email template for new registrations
 */
const welcomeEmail = (userName, verificationUrl) => {
  const content = `
    <h1>Welcome to LaraibCreative! 🎉</h1>
    <p>Hi ${userName},</p>
    <p>Thank you for joining LaraibCreative, your destination for custom Pakistani fashion and expert tailoring.</p>
    
    <div class="info-box">
      <p><strong>Please verify your email address to get started:</strong></p>
      <a href="${verificationUrl}" class="button">Verify Email Address</a>
    </div>
    
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
    
    <p style="margin-top: 30px;">Once verified, you'll be able to:</p>
    <ul>
      <li>Browse our exclusive collection of ready-to-wear garments</li>
      <li>Place custom tailoring orders with your measurements</li>
      <li>Track your orders in real-time</li>
      <li>Save your favorite designs to your wishlist</li>
      <li>Enjoy personalized recommendations</li>
    </ul>
    
    <p style="margin-top: 30px;">Need help? Our team is here to assist you!</p>
    <p>Contact us via WhatsApp or email anytime.</p>
    
    <p style="margin-top: 30px;">Best regards,<br><strong>The LaraibCreative Team</strong></p>
  `;
  
  return emailWrapper(content, 'Welcome to LaraibCreative! Please verify your email.');
};

/**
 * Email verification template
 */
const emailVerification = (userName, verificationUrl) => {
  const content = `
    <h1>Verify Your Email Address</h1>
    <p>Hi ${userName},</p>
    <p>Please verify your email address to complete your registration with LaraibCreative.</p>
    
    <div class="info-box">
      <a href="${verificationUrl}" class="button">Verify Email Address</a>
    </div>
    
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
    
    <div class="warning-box">
      <p><strong>⚠️ This link will expire in 24 hours.</strong></p>
      <p>If you didn't create an account with LaraibCreative, please ignore this email.</p>
    </div>
    
    <p style="margin-top: 30px;">Best regards,<br><strong>The LaraibCreative Team</strong></p>
  `;
  
  return emailWrapper(content, 'Verify your LaraibCreative account');
};

/**
 * Email verification success template
 */
const emailVerifiedSuccess = (userName) => {
  const content = `
    <h1>Email Verified Successfully! ✅</h1>
    <p>Hi ${userName},</p>
    <p>Great news! Your email address has been verified successfully.</p>
    
    <div class="info-box">
      <p>You now have full access to all LaraibCreative features!</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products" class="button">Start Shopping</a>
    </div>
    
    <p style="margin-top: 30px;">What's next?</p>
    <ul>
      <li>Browse our latest collection</li>
      <li>Save your measurements for quick ordering</li>
      <li>Add items to your wishlist</li>
      <li>Place your first custom order</li>
    </ul>
    
    <p style="margin-top: 30px;">Happy shopping!</p>
    <p><strong>The LaraibCreative Team</strong></p>
  `;
  
  return emailWrapper(content, 'Your email has been verified!');
};

/**
 * Password reset request template
 */
const passwordResetEmail = (userName, resetUrl) => {
  const content = `
    <h1>Reset Your Password</h1>
    <p>Hi ${userName},</p>
    <p>We received a request to reset your password for your LaraibCreative account.</p>
    
    <div class="info-box">
      <p><strong>Click the button below to reset your password:</strong></p>
      <a href="${resetUrl}" class="button">Reset Password</a>
    </div>
    
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
    
    <div class="warning-box">
      <p><strong>⚠️ This link will expire in 1 hour.</strong></p>
      <p><strong>Important:</strong> If you didn't request a password reset, please ignore this email or contact us immediately if you suspect unauthorized access to your account.</p>
    </div>
    
    <p style="margin-top: 30px;">For security reasons, we recommend:</p>
    <ul>
      <li>Using a strong, unique password</li>
      <li>Not sharing your password with anyone</li>
      <li>Enabling two-factor authentication when available</li>
    </ul>
    
    <p style="margin-top: 30px;">Best regards,<br><strong>The LaraibCreative Team</strong></p>
  `;
  
  return emailWrapper(content, 'Reset your LaraibCreative password');
};

/**
 * Password reset success template
 */
const passwordResetSuccess = (userName) => {
  const content = `
    <h1>Password Changed Successfully ✅</h1>
    <p>Hi ${userName},</p>
    <p>Your password has been changed successfully.</p>
    
    <div class="info-box">
      <p>You can now log in to your account using your new password.</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/login" class="button">Log In to Your Account</a>
    </div>
    
    <div class="warning-box">
      <p><strong>⚠️ Didn't make this change?</strong></p>
      <p>If you didn't change your password, please contact us immediately at <a href="mailto:support@laraibcreative.com" style="color: #667eea;">support@laraibcreative.com</a></p>
    </div>
    
    <p style="margin-top: 30px;">Best regards,<br><strong>The LaraibCreative Team</strong></p>
  `;
  
  return emailWrapper(content, 'Your password has been changed');
};

/**
 * Account locked notification template
 */
const accountLockedEmail = (userName, unlockTime) => {
  const content = `
    <h1>Account Temporarily Locked 🔒</h1>
    <p>Hi ${userName},</p>
    <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
    
    <div class="warning-box">
      <p><strong>⚠️ Security Alert</strong></p>
      <p>Your account will be automatically unlocked at: <strong>${unlockTime}</strong></p>
      <p>This is approximately 2 hours from now.</p>
    </div>
    
    <div class="info-box">
      <p><strong>Forgot your password?</strong></p>
      <p>You can reset it immediately to regain access:</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/forgot-password" class="button">Reset Password</a>
    </div>
    
    <p style="margin-top: 30px;"><strong>Think someone else is trying to access your account?</strong></p>
    <p>Please contact us immediately at <a href="mailto:support@laraibcreative.com" style="color: #667eea;">support@laraibcreative.com</a></p>
    
    <p style="margin-top: 30px;">Best regards,<br><strong>The LaraibCreative Team</strong></p>
  `;
  
  return emailWrapper(content, 'Your account has been temporarily locked');
};

/**
 * Login notification template (optional security feature)
 */
const loginNotification = (userName, loginDetails) => {
  const { ip, device, location, time } = loginDetails;
  
  const content = `
    <h1>New Login to Your Account</h1>
    <p>Hi ${userName},</p>
    <p>We detected a new login to your LaraibCreative account.</p>
    
    <div class="info-box">
      <p><strong>Login Details:</strong></p>
      <ul style="list-style: none; padding: 0;">
        <li>🕐 <strong>Time:</strong> ${time}</li>
        <li>📱 <strong>Device:</strong> ${device}</li>
        <li>📍 <strong>Location:</strong> ${location}</li>
        <li>🌐 <strong>IP Address:</strong> ${ip}</li>
      </ul>
    </div>
    
    <div class="warning-box">
      <p><strong>⚠️ Was this you?</strong></p>
      <p>If you didn't perform this login, please secure your account immediately:</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/forgot-password" class="button">Change Password Now</a>
    </div>
    
    <p style="margin-top: 30px;">Best regards,<br><strong>The LaraibCreative Team</strong></p>
  `;
  
  return emailWrapper(content, 'New login to your account');
};

/**
 * Profile update notification template
 */
const profileUpdateNotification = (userName, updatedFields) => {
  const content = `
    <h1>Profile Updated Successfully</h1>
    <p>Hi ${userName},</p>
    <p>Your profile information has been updated.</p>
    
    <div class="info-box">
      <p><strong>Updated fields:</strong></p>
      <ul>
        ${updatedFields.map(field => `<li>${field}</li>`).join('')}
      </ul>
    </div>
    
    <div class="warning-box">
      <p><strong>⚠️ Didn't make these changes?</strong></p>
      <p>If you didn't update your profile, please contact us immediately.</p>
    </div>
    
    <p style="margin-top: 30px;">Best regards,<br><strong>The LaraibCreative Team</strong></p>
  `;
  
  return emailWrapper(content, 'Your profile has been updated');
};

module.exports = {
  welcomeEmail,
  emailVerification,
  emailVerifiedSuccess,
  passwordResetEmail,
  passwordResetSuccess,
  accountLockedEmail,
  loginNotification,
  profileUpdateNotification
};