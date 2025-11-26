/**
 * Email Notifications Service - Phase 7
 * Using Resend for transactional emails
 */

interface EmailConfig {
  apiKey: string
  fromEmail: string
  fromName: string
}

function getConfig(): EmailConfig {
  const apiKey = process.env.RESEND_API_KEY
  
  if (!apiKey) {
    throw new Error('RESEND_API_KEY not configured')
  }

  return {
    apiKey,
    fromEmail: 'orders@laraibcreative.com',
    fromName: 'LaraibCreative',
  }
}

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send email via Resend API
 */
async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getConfig()
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${config.fromName} <${config.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.message || 'Failed to send email' }
    }

    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

// ==========================================
// EMAIL TEMPLATES
// ==========================================

const BASE_STYLES = `
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #36454F; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { text-align: center; padding: 30px 0; background: linear-gradient(135deg, #D4AF37 0%, #E8B4B8 100%); }
  .header img { height: 50px; }
  .header h1 { color: white; margin: 10px 0 0; font-size: 24px; }
  .content { padding: 30px; background: #ffffff; }
  .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; background: #FAF9F6; }
  .btn { display: inline-block; padding: 14px 28px; background: #D4AF37; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
  .btn:hover { background: #B8941F; }
  .order-summary { background: #FAF9F6; padding: 20px; border-radius: 8px; margin: 20px 0; }
  .item { display: flex; padding: 15px 0; border-bottom: 1px solid #E5E4E1; }
  .item:last-child { border-bottom: none; }
  .item img { width: 60px; height: 80px; object-fit: cover; border-radius: 4px; }
  .item-details { flex: 1; padding-left: 15px; }
  .total { font-size: 18px; font-weight: bold; color: #D4AF37; }
`

interface OrderItem {
  title: string
  image: string
  quantity: number
  price: number
  isStitched?: boolean
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  to: string,
  orderNumber: string,
  items: OrderItem[],
  subtotal: number,
  shipping: number,
  total: number,
  shippingAddress: { full_name: string; city: string; address_line1: string }
): Promise<{ success: boolean }> {
  const itemsHtml = items.map(item => `
    <div class="item">
      <img src="${item.image}" alt="${item.title}" />
      <div class="item-details">
        <strong>${item.title}</strong>
        ${item.isStitched ? '<br><span style="color: #E8B4B8; font-size: 12px;">✂️ Stitched</span>' : ''}
        <br>Qty: ${item.quantity}
      </div>
      <div style="text-align: right;">PKR ${item.price.toLocaleString()}</div>
    </div>
  `).join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head><style>${BASE_STYLES}</style></head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ Order Confirmed!</h1>
        </div>
        <div class="content">
          <p>Thank you for shopping with LaraibCreative!</p>
          <p>Your order <strong>#${orderNumber}</strong> has been confirmed and is being processed.</p>
          
          <div class="order-summary">
            <h3 style="margin-top: 0;">Order Summary</h3>
            ${itemsHtml}
            
            <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #E5E4E1;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Subtotal</span>
                <span>PKR ${subtotal.toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Shipping</span>
                <span>PKR ${shipping.toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span class="total">Total</span>
                <span class="total">PKR ${total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <h3>Shipping To:</h3>
          <p>
            ${shippingAddress.full_name}<br>
            ${shippingAddress.address_line1}<br>
            ${shippingAddress.city}, Pakistan
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://laraibcreative.com/track/${orderNumber}" class="btn">
              Track Your Order
            </a>
          </div>
        </div>
        <div class="footer">
          <p>Questions? Reply to this email or WhatsApp us at +92 XXX XXXXXXX</p>
          <p>© ${new Date().getFullYear()} LaraibCreative. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to,
    subject: `Order Confirmed - #${orderNumber} | LaraibCreative`,
    html,
  })
}

/**
 * Send shipping notification email
 */
export async function sendShippingEmail(
  to: string,
  orderNumber: string,
  trackingNumber?: string,
  estimatedDelivery?: string
): Promise<{ success: boolean }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><style>${BASE_STYLES}</style></head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Your Order Has Shipped!</h1>
        </div>
        <div class="content">
          <p>Great news! Your order <strong>#${orderNumber}</strong> is on its way.</p>
          
          ${trackingNumber ? `
            <div class="order-summary">
              <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
              ${estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>` : ''}
            </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://laraibcreative.com/track/${orderNumber}" class="btn">
              Track Package
            </a>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} LaraibCreative. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to,
    subject: `Your Order Has Shipped - #${orderNumber} | LaraibCreative`,
    html,
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  resetLink: string
): Promise<{ success: boolean }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><style>${BASE_STYLES}</style></head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Reset Your Password</h1>
        </div>
        <div class="content">
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" class="btn">Reset Password</a>
          </div>

          <p style="color: #888; font-size: 14px;">
            If you didn't request this, please ignore this email. This link will expire in 1 hour.
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} LaraibCreative. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to,
    subject: 'Reset Your Password | LaraibCreative',
    html,
  })
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  to: string,
  name: string,
  referralCode?: string
): Promise<{ success: boolean }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><style>${BASE_STYLES}</style></head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ Welcome to LaraibCreative!</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Welcome to the LaraibCreative family! We're thrilled to have you with us.</p>
          
          <p>Discover our exclusive collection of Pakistani fashion, from elegant ready-to-wear pieces to custom-stitched outfits tailored just for you.</p>

          ${referralCode ? `
            <div class="order-summary">
              <h3 style="margin-top: 0;">🎁 Your Referral Code</h3>
              <p style="font-size: 24px; font-weight: bold; color: #D4AF37; letter-spacing: 2px;">${referralCode}</p>
              <p style="margin-bottom: 0;">Share with friends and earn 500 points for each successful referral!</p>
            </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://laraibcreative.com/shop" class="btn">Start Shopping</a>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} LaraibCreative. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to,
    subject: 'Welcome to LaraibCreative! ✨',
    html,
  })
}

export { sendEmail }
