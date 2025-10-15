// backend/src/utils/notificationService.js

/**
 * Notification Service
 * Handles email and WhatsApp notifications for order status updates
 * 
 * Dependencies:
 * - nodemailer (for email)
 * - twilio or whatsapp-web.js (for WhatsApp)
 */

import nodemailer from 'nodemailer';
// import twilio from 'twilio'; // Uncomment when implementing

/**
 * Email transporter configuration
 * Using Gmail SMTP (can be replaced with SendGrid, Mailgun, etc.)
 */
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // your-email@gmail.com
      pass: process.env.EMAIL_PASSWORD // App password (not regular password)
    }
  });
};

/**
 * WhatsApp client configuration
 * Using Twilio API (recommended for production)
 */
const createWhatsAppClient = () => {
  // Uncomment when implementing Twilio
  // return twilio(
  //   process.env.TWILIO_ACCOUNT_SID,
  //   process.env.TWILIO_AUTH_TOKEN
  // );
  return null;
};

/**
 * Status update messages for different order stages
 */
const statusMessages = {
  'order-received': {
    subject: 'Order Received - LaraibCreative',
    title: 'Order Received Successfully! 🎉',
    message: 'Thank you for your order! We have received your order and it is being processed.',
    emoji: '✅'
  },
  'payment-verified': {
    subject: 'Payment Verified - LaraibCreative',
    title: 'Payment Verified Successfully! 💳',
    message: 'Your payment has been verified. We are now arranging materials for your custom stitching.',
    emoji: '✅'
  },
  'in-progress': {
    subject: 'Stitching Started - LaraibCreative',
    title: 'Your Order is Being Stitched! ✂️',
    message: 'Great news! Our skilled tailors have started working on your custom order.',
    emoji: '✂️'
  },
  'quality-check': {
    subject: 'Quality Check - LaraibCreative',
    title: 'Quality Check in Progress! ✓',
    message: 'Your order is now undergoing our rigorous quality inspection to ensure perfection.',
    emoji: '🔍'
  },
  'ready-dispatch': {
    subject: 'Ready for Dispatch - LaraibCreative',
    title: 'Your Order is Ready! 📦',
    message: 'Excellent! Your order has passed quality check and is now ready for dispatch.',
    emoji: '📦'
  },
  'out-for-delivery': {
    subject: 'Out for Delivery - LaraibCreative',
    title: 'Order Out for Delivery! 🚚',
    message: 'Your order is on its way! Our courier partner will deliver it to your doorstep soon.',
    emoji: '🚚'
  },
  'delivered': {
    subject: 'Order Delivered - LaraibCreative',
    title: 'Order Delivered Successfully! 🎊',
    message: 'Your order has been delivered! We hope you love it. Thank you for choosing LaraibCreative!',
    emoji: '🎊'
  },
  'cancelled': {
    subject: 'Order Cancelled - LaraibCreative',
    title: 'Order Cancelled',
    message: 'Your order has been cancelled. If you have any questions, please contact our support team.',
    emoji: '❌'
  }
};

/**
 * Generate HTML email template for order status update
 */
const generateEmailTemplate = (orderNumber, status, customerName, trackingUrl) => {
  const statusInfo = statusMessages[status] || statusMessages['order-received'];
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${statusInfo.subject}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #D946A6 0%, #7C3AED 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 30px 20px;
        }
        .status-badge {
          display: inline-block;
          background: #f0f9ff;
          color: #0369a1;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
          margin: 20px 0;
        }
        .order-number {
          font-size: 24px;
          font-weight: bold;
          color: #7C3AED;
          margin: 10px 0;
        }
        .message-box {
          background: #f9fafb;
          border-left: 4px solid #7C3AED;
          padding: 15px;
          margin: 20px 0;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #D946A6 0%, #7C3AED 100%);
          color: white;
          padding: 14px 30px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          background: #f9fafb;
          padding: 20px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        .social-links {
          margin: 15px 0;
        }
        .social-links a {
          margin: 0 10px;
          text-decoration: none;
          color: #7C3AED;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${statusInfo.emoji} ${statusInfo.title}</h1>
        </div>
        
        <div class="content">
          <p>Dear ${customerName},</p>
          
          <div class="message-box">
            <p style="margin: 0; font-size: 16px;">${statusInfo.message}</p>
          </div>
          
          <p>Your Order Number: <span class="order-number">${orderNumber}</span></p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${trackingUrl}" class="cta-button">Track Your Order</a>
          </div>
          
          <p>You can track your order status in real-time by clicking the button above or visiting our website.</p>
          
          <p>If you have any questions, feel free to reach out:</p>
          <ul>
            <li>📱 WhatsApp: <a href="https://wa.me/923001234567">+92 300 1234567</a></li>
            <li>📧 Email: <a href="mailto:support@laraibcreative.com">support@laraibcreative.com</a></li>
          </ul>
          
          <p style="margin-top: 30px;">
            Thank you for choosing LaraibCreative! ✨<br>
            <em>"We turn your thoughts & emotions into reality and happiness"</em>
          </p>
        </div>
        
        <div class="footer">
          <div class="social-links">
            <a href="https://instagram.com/laraibcreative">Instagram</a> |
            <a href="https://facebook.com/laraibcreative">Facebook</a> |
            <a href="https://laraibcreative.com">Website</a>
          </div>
          <p>© ${new Date().getFullYear()} LaraibCreative. All rights reserved.</p>
          <p style="font-size: 12px; color: #9ca3af;">
            This is an automated notification for order ${orderNumber}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send email notification for order status update
 */
export const sendStatusUpdateEmail = async (orderData, status) => {
  try {
    const transporter = createEmailTransporter();
    const statusInfo = statusMessages[status] || statusMessages['order-received'];
    const trackingUrl = `https://laraibcreative.com/track-order/${orderData.orderNumber}`;

    const mailOptions = {
      from: {
        name: 'LaraibCreative',
        address: process.env.EMAIL_USER
      },
      to: orderData.customerInfo.email,
      subject: statusInfo.subject,
      html: generateEmailTemplate(
        orderData.orderNumber,
        status,
        orderData.customerInfo.name,
        trackingUrl
      )
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send WhatsApp notification for order status update
 */
export const sendWhatsAppNotification = async (orderData, status) => {
  try {
    const statusInfo = statusMessages[status] || statusMessages['order-received'];
    const trackingUrl = `https://laraibcreative.com/track-order/${orderData.orderNumber}`;
    
    // WhatsApp message format
    const message = `
${statusInfo.emoji} *${statusInfo.title}*

${statusInfo.message}

*Order Number:* ${orderData.orderNumber}

Track your order: ${trackingUrl}

Need help? Reply to this message anytime!

_LaraibCreative - Where emotions become reality_ ✨
    `.trim();

    // Using Twilio WhatsApp API (Uncomment when implementing)
    // const client = createWhatsAppClient();
    // const result = await client.messages.create({
    //   from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    //   to: `whatsapp:${orderData.customerInfo.whatsapp}`,
    //   body: message
    // });

    // console.log('WhatsApp sent successfully:', result.sid);
    // return { success: true, sid: result.sid };

    // MOCK SUCCESS - Remove in production
    console.log('WhatsApp notification (mock):', message);
    return { success: true, mock: true };

  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send both email and WhatsApp notifications
 */
export const sendOrderStatusNotifications = async (orderData, status) => {
  const results = {
    email: null,
    whatsapp: null
  };

  // Send email notification
  if (orderData.customerInfo.email) {
    results.email = await sendStatusUpdateEmail(orderData, status);
  }

  // Send WhatsApp notification
  if (orderData.customerInfo.whatsapp) {
    results.whatsapp = await sendWhatsAppNotification(orderData, status);
  }

  return results;
};

/**
 * Send order confirmation notification (called when order is first placed)
 */
export const sendOrderConfirmation = async (orderData) => {
  return await sendOrderStatusNotifications(orderData, 'order-received');
};

/**
 * Send payment verification notification
 */
export const sendPaymentVerifiedNotification = async (orderData) => {
  return await sendOrderStatusNotifications(orderData, 'payment-verified');
};

/**
 * Send delivery notification
 */
export const sendDeliveryNotification = async (orderData) => {
  return await sendOrderStatusNotifications(orderData, 'delivered');
};