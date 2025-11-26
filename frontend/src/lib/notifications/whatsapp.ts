/**
 * WhatsApp Business API Integration - Phase 7
 * Sends transactional notifications via WhatsApp
 */

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0'

interface WhatsAppConfig {
  phoneNumberId: string
  accessToken: string
}

function getConfig(): WhatsAppConfig {
  const phoneNumberId = process.env.WHATSAPP_PHONE_ID
  const accessToken = process.env.WHATSAPP_TOKEN

  if (!phoneNumberId || !accessToken) {
    throw new Error('WhatsApp credentials not configured')
  }

  return { phoneNumberId, accessToken }
}

/**
 * Format phone number for WhatsApp (Pakistan)
 */
function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '')
  
  // Handle Pakistani numbers
  if (cleaned.startsWith('0')) {
    cleaned = '92' + cleaned.substring(1)
  } else if (!cleaned.startsWith('92')) {
    cleaned = '92' + cleaned
  }
  
  return cleaned
}

/**
 * Send WhatsApp template message
 */
async function sendTemplateMessage(
  to: string,
  templateName: string,
  components: object[]
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const config = getConfig()
    const formattedPhone = formatPhoneNumber(to)

    const response = await fetch(
      `${WHATSAPP_API_URL}/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en' },
            components,
          },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('WhatsApp API error:', data)
      return { success: false, error: data.error?.message || 'Failed to send message' }
    }

    return { success: true, messageId: data.messages?.[0]?.id }
  } catch (error) {
    console.error('WhatsApp send error:', error)
    return { success: false, error: 'Failed to send WhatsApp message' }
  }
}

/**
 * Send text message (for testing/simple notifications)
 */
async function sendTextMessage(
  to: string,
  text: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const config = getConfig()
    const formattedPhone = formatPhoneNumber(to)

    const response = await fetch(
      `${WHATSAPP_API_URL}/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: { body: text },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error?.message }
    }

    return { success: true, messageId: data.messages?.[0]?.id }
  } catch (error) {
    console.error('WhatsApp send error:', error)
    return { success: false, error: 'Failed to send message' }
  }
}

// ==========================================
// NOTIFICATION TEMPLATES
// ==========================================

/**
 * Send order confirmation
 */
export async function sendOrderConfirmation(
  phone: string,
  orderNumber: string,
  total: number,
  itemCount: number
): Promise<{ success: boolean }> {
  // Using text message for now - replace with template when approved
  const message = `✨ *LaraibCreative*

Thank you for your order! 🛍️

*Order #${orderNumber}*
Items: ${itemCount}
Total: PKR ${total.toLocaleString()}

We'll notify you when your order ships.

Track your order: laraibcreative.com/track/${orderNumber}`

  return sendTextMessage(phone, message)
}

/**
 * Send order shipped notification
 */
export async function sendOrderShipped(
  phone: string,
  orderNumber: string,
  trackingNumber?: string,
  estimatedDelivery?: string
): Promise<{ success: boolean }> {
  let message = `📦 *LaraibCreative*

Great news! Your order has shipped! 🚚

*Order #${orderNumber}*`

  if (trackingNumber) {
    message += `\nTracking: ${trackingNumber}`
  }
  
  if (estimatedDelivery) {
    message += `\nExpected delivery: ${estimatedDelivery}`
  }

  message += `\n\nTrack: laraibcreative.com/track/${orderNumber}`

  return sendTextMessage(phone, message)
}

/**
 * Send order delivered notification
 */
export async function sendOrderDelivered(
  phone: string,
  orderNumber: string
): Promise<{ success: boolean }> {
  const message = `✅ *LaraibCreative*

Your order has been delivered! 🎉

*Order #${orderNumber}*

We hope you love your purchase! ❤️

Leave a review to earn loyalty points: laraibcreative.com/review/${orderNumber}`

  return sendTextMessage(phone, message)
}

/**
 * Send payment reminder (for bank transfer)
 */
export async function sendPaymentReminder(
  phone: string,
  orderNumber: string,
  total: number
): Promise<{ success: boolean }> {
  const message = `⏰ *LaraibCreative*

Reminder: Your order #${orderNumber} is awaiting payment.

Amount: PKR ${total.toLocaleString()}

Bank: HBL
Account: 1234567890
Title: LaraibCreative

Upload receipt: laraibcreative.com/orders/${orderNumber}/payment`

  return sendTextMessage(phone, message)
}

/**
 * Send stitching update
 */
export async function sendStitchingUpdate(
  phone: string,
  orderNumber: string,
  status: 'started' | 'in_progress' | 'quality_check' | 'completed'
): Promise<{ success: boolean }> {
  const statusMessages = {
    started: '✂️ Your custom stitching has started!',
    in_progress: '🧵 Your outfit is being carefully crafted...',
    quality_check: '🔍 Your order is in quality check.',
    completed: '✨ Your custom stitching is complete!',
  }

  const message = `🪡 *LaraibCreative*

${statusMessages[status]}

*Order #${orderNumber}*

Track progress: laraibcreative.com/track/${orderNumber}`

  return sendTextMessage(phone, message)
}

/**
 * Send promotional message (with opt-in check)
 */
export async function sendPromotion(
  phone: string,
  title: string,
  description: string,
  code?: string
): Promise<{ success: boolean }> {
  let message = `🎁 *LaraibCreative*

*${title}*

${description}`

  if (code) {
    message += `\n\nUse code: *${code}*`
  }

  message += `\n\nShop now: laraibcreative.com`

  return sendTextMessage(phone, message)
}

export {
  sendTextMessage,
  sendTemplateMessage,
  formatPhoneNumber,
}
