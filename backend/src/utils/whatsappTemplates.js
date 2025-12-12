/**
 * WhatsApp Message Templates for Custom Orders
 * Production-ready WhatsApp message templates
 * 
 * @module utils/whatsappTemplates
 */

/**
 * Custom Order Confirmation Template
 */
exports.customOrderConfirmation = ({ orderNumber, customerName, serviceType, estimatedPrice, estimatedDays }) => {
  return `🎉 *Custom Order Confirmation*

Hi ${customerName},

Thank you for placing a custom order with LaraibCreative! We're excited to bring your vision to life.

📋 *Order Details:*
• Order Number: *${orderNumber}*
• Service Type: ${serviceType}
• Estimated Price: *PKR ${estimatedPrice.toLocaleString()}*
• Estimated Delivery: ${estimatedDays} days

📞 *What happens next?*
1. Our team will review your order within 24 hours
2. We'll contact you via WhatsApp or phone to confirm details
3. You'll receive a final quote before we begin
4. Once confirmed, we'll start working on your custom order
5. You'll receive regular updates on the progress

We're committed to creating something beautiful for you!

Track your order: ${process.env.FRONTEND_URL || 'https://laraibcreative.com'}/orders/${orderNumber}

Best regards,
*The LaraibCreative Team*`;
};

/**
 * Custom Order Admin Notification Template
 */
exports.customOrderAdminNotification = ({ orderNumber, customerName, customerPhone, serviceType, estimatedPrice, rushOrder }) => {
  return `🔔 *New Custom Order Received*

Order Number: *${orderNumber}*
Customer: ${customerName}
Phone: ${customerPhone}
Service Type: ${serviceType}
Estimated Price: PKR ${estimatedPrice.toLocaleString()}
Rush Order: ${rushOrder ? 'Yes ⚡' : 'No'}

⚠️ *Action Required:*
Please review the order details and contact the customer within 24 hours to confirm the order and provide final pricing.

View order: ${process.env.ADMIN_URL || process.env.FRONTEND_URL || 'https://laraibcreative.com'}/admin/orders/${orderNumber}`;
};

/**
 * Custom Order Status Update Template
 */
exports.customOrderStatusUpdate = ({ orderNumber, customerName, status, message }) => {
  const statusEmojis = {
    'pending-payment': '⏳',
    'payment-verified': '✅',
    'material-arranged': '📦',
    'in-progress': '✂️',
    'quality-check': '🔍',
    'ready-dispatch': '📤',
    'dispatched': '🚚',
    'delivered': '🎉'
  };

  const emoji = statusEmojis[status] || '📋';

  return `${emoji} *Order Status Update*

Hi ${customerName},

Your custom order status has been updated:

📋 Order Number: *${orderNumber}*
📊 Status: *${status.replace(/-/g, ' ').toUpperCase()}*

${message || "We'll keep you updated on the progress."}

Track your order: ${process.env.FRONTEND_URL || 'https://laraibcreative.com'}/orders/${orderNumber}

Best regards,
*The LaraibCreative Team*`;
};

/**
 * Custom Order Payment Reminder Template
 */
exports.customOrderPaymentReminder = ({ orderNumber, customerName, total, paymentMethod }) => {
  return `💳 *Payment Reminder*

Hi ${customerName},

This is a friendly reminder about your custom order payment.

📋 Order Number: *${orderNumber}*
💰 Total Amount: *PKR ${total.toLocaleString()}*
💳 Payment Method: ${paymentMethod}

Please complete your payment to proceed with your custom order. Once payment is verified, we'll begin working on your order immediately.

Payment Instructions:
• Bank Transfer: [Account details]
• JazzCash/EasyPaisa: [Number]

If you've already made the payment, please share the receipt.

Thank you for choosing LaraibCreative!

Best regards,
*The LaraibCreative Team*`;
};

module.exports = exports;

