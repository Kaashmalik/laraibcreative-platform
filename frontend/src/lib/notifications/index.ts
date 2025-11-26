/**
 * Notifications Index - Phase 7
 * Unified notification service
 */

export * from './email'
export * from './whatsapp'

import { sendOrderConfirmationEmail, sendShippingEmail } from './email'
import { sendOrderConfirmation as sendWhatsAppOrderConfirmation, sendOrderShipped as sendWhatsAppOrderShipped } from './whatsapp'

interface NotifyOrderConfirmationParams {
  email: string
  phone: string
  orderNumber: string
  items: {
    title: string
    image: string
    quantity: number
    price: number
    isStitched?: boolean
  }[]
  subtotal: number
  shipping: number
  total: number
  shippingAddress: {
    full_name: string
    city: string
    address_line1: string
  }
}

/**
 * Send order confirmation via all channels
 */
export async function notifyOrderConfirmation(params: NotifyOrderConfirmationParams): Promise<void> {
  const results = await Promise.allSettled([
    // Email
    sendOrderConfirmationEmail(
      params.email,
      params.orderNumber,
      params.items,
      params.subtotal,
      params.shipping,
      params.total,
      params.shippingAddress
    ),
    // WhatsApp
    sendWhatsAppOrderConfirmation(
      params.phone,
      params.orderNumber,
      params.total,
      params.items.length
    ),
  ])

  // Log failures but don't throw
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Notification ${index} failed:`, result.reason)
    }
  })
}

interface NotifyOrderShippedParams {
  email: string
  phone: string
  orderNumber: string
  trackingNumber?: string
  estimatedDelivery?: string
}

/**
 * Send shipping notification via all channels
 */
export async function notifyOrderShipped(params: NotifyOrderShippedParams): Promise<void> {
  await Promise.allSettled([
    sendShippingEmail(
      params.email,
      params.orderNumber,
      params.trackingNumber,
      params.estimatedDelivery
    ),
    sendWhatsAppOrderShipped(
      params.phone,
      params.orderNumber,
      params.trackingNumber,
      params.estimatedDelivery
    ),
  ])
}
