'use server'

/**
 * Order Server Actions - Phase 4-5
 * Handles order creation, updates, and retrieval
 */

import { createOrder, getOrderByNumber, getOrdersByCustomer, updateOrderStatus, type CreateOrderInput, type OrderStatus } from '@/lib/tidb/orders'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Notification imports (to be implemented)
// import { sendOrderConfirmationEmail } from '@/lib/email'
// import { sendWhatsAppNotification } from '@/lib/whatsapp'

export interface CheckoutData {
  // Customer info
  email: string
  phone: string
  
  // Shipping
  shippingAddress: {
    full_name: string
    phone: string
    address_line1: string
    address_line2?: string
    city: string
    state?: string
    postal_code?: string
    country: string
    delivery_instructions?: string
  }
  
  // Items
  items: {
    productId: string
    variantId?: string
    quantity: number
    unitPrice: number
    totalPrice: number
    isStitched: boolean
    stitchingPrice: number
    measurements?: Record<string, number>
    customization?: Record<string, string>
    productSnapshot: {
      title: string
      image: string
      price: number
    }
  }[]
  
  // Pricing
  subtotal: number
  shippingFee: number
  stitchingFee: number
  discountCode?: string
  discountAmount: number
  total: number
  
  // Payment
  paymentMethod: 'cod' | 'card' | 'jazzcash' | 'easypaisa' | 'bank_transfer'
}

/**
 * Create a new order
 */
export async function createNewOrder(data: CheckoutData) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Validate stock (in production, this should be more robust)
    // TODO: Check stock availability in TiDB

    const orderInput: CreateOrderInput = {
      customer_id: user?.id,
      customer_email: data.email,
      customer_phone: data.phone,
      order_type: data.items.some(i => i.isStitched) ? 'custom' : 'standard',
      shipping_address: data.shippingAddress,
      items: data.items.map(item => ({
        product_id: item.productId,
        variant_id: item.variantId,
        product_snapshot: item.productSnapshot,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
        is_stitched: item.isStitched,
        stitching_price: item.stitchingPrice,
        measurements: item.measurements || null,
        customization: item.customization || null,
      })),
      subtotal: data.subtotal,
      shipping_fee: data.shippingFee,
      stitching_fee: data.stitchingFee,
      discount_amount: data.discountAmount,
      total: data.total,
      payment_method: data.paymentMethod,
    }

    const result = await createOrder(orderInput)

    // Clear cart in Supabase if logged in
    if (user?.id) {
      await supabase.from('cart_items').delete().eq('user_id', user.id)
    }

    // Send notifications (async, don't block)
    sendNotifications(result.orderNumber, data).catch(console.error)

    // Award loyalty points if logged in
    if (user?.id) {
      awardLoyaltyPoints(user.id, data.total).catch(console.error)
    }

    return {
      success: true,
      orderNumber: result.orderNumber,
      orderId: result.orderId,
    }
  } catch (error) {
    console.error('Error creating order:', error)
    return {
      success: false,
      error: 'Failed to create order. Please try again.',
    }
  }
}

/**
 * Get order by order number (for confirmation/tracking)
 */
export async function fetchOrder(orderNumber: string) {
  try {
    const order = await getOrderByNumber(orderNumber)
    return { success: true, order }
  } catch (error) {
    console.error('Error fetching order:', error)
    return { success: false, order: null }
  }
}

/**
 * Get orders for logged-in user
 */
export async function fetchMyOrders() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, orders: [], error: 'Not authenticated' }
    }

    const orders = await getOrdersByCustomer(user.id)
    return { success: true, orders }
  } catch (error) {
    console.error('Error fetching orders:', error)
    return { success: false, orders: [] }
  }
}

/**
 * Update order status (admin only)
 */
export async function updateOrder(orderId: string, status: OrderStatus, note?: string) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super-admin'].includes(profile.role)) {
      return { success: false, error: 'Unauthorized' }
    }

    await updateOrderStatus(orderId, status, note)

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)

    return { success: true }
  } catch (error) {
    console.error('Error updating order:', error)
    return { success: false, error: 'Failed to update order' }
  }
}

/**
 * Calculate shipping fee based on city
 */
export async function calculateShipping(city: string): Promise<number> {
  // Pakistan shipping rates
  const rates: Record<string, number> = {
    'karachi': 200,
    'lahore': 200,
    'islamabad': 250,
    'rawalpindi': 250,
    'faisalabad': 250,
    'multan': 300,
    'peshawar': 350,
    'quetta': 400,
  }

  const normalizedCity = city.toLowerCase().trim()
  return rates[normalizedCity] || 350 // Default rate
}

/**
 * Validate discount code
 */
export async function validateDiscountCode(code: string, subtotal: number) {
  try {
    const { tidb } = await import('@/lib/tidb/connection')
    
    const discount = await tidb.queryOne<{
      id: string
      discount_type: 'percentage' | 'fixed'
      discount_value: number
      minimum_order: number
      maximum_discount: number | null
      usage_limit: number | null
      used_count: number
    }>(`
      SELECT * FROM discount_codes
      WHERE code = ? AND is_active = true
        AND (valid_from IS NULL OR valid_from <= NOW())
        AND (valid_until IS NULL OR valid_until >= NOW())
        AND (usage_limit IS NULL OR used_count < usage_limit)
    `, [code.toUpperCase()])

    if (!discount) {
      return { valid: false, error: 'Invalid or expired discount code' }
    }

    if (subtotal < discount.minimum_order) {
      return { 
        valid: false, 
        error: `Minimum order of PKR ${discount.minimum_order.toLocaleString()} required` 
      }
    }

    let discountAmount: number
    if (discount.discount_type === 'percentage') {
      discountAmount = (subtotal * discount.discount_value) / 100
      if (discount.maximum_discount) {
        discountAmount = Math.min(discountAmount, discount.maximum_discount)
      }
    } else {
      discountAmount = discount.discount_value
    }

    return {
      valid: true,
      discountId: discount.id,
      discountAmount,
      discountType: discount.discount_type,
      discountValue: discount.discount_value,
    }
  } catch (error) {
    console.error('Error validating discount:', error)
    return { valid: false, error: 'Error validating code' }
  }
}

// Helper functions

async function sendNotifications(orderNumber: string, data: CheckoutData) {
  // TODO: Implement email and WhatsApp notifications
  console.log(`Sending notifications for order ${orderNumber}`)
  
  // Email confirmation
  // await sendOrderConfirmationEmail({
  //   to: data.email,
  //   orderNumber,
  //   items: data.items,
  //   total: data.total,
  // })
  
  // WhatsApp notification
  // await sendWhatsAppNotification({
  //   phone: data.phone,
  //   message: `Order ${orderNumber} confirmed! Total: PKR ${data.total.toLocaleString()}`
  // })
}

async function awardLoyaltyPoints(userId: string, orderTotal: number) {
  const supabase = await createSupabaseServerClient()
  const pointsEarned = Math.floor(orderTotal) // 1 point per PKR
  
  // Insert loyalty transaction
  await supabase.from('loyalty_points').insert({
    user_id: userId,
    points: pointsEarned,
    type: 'earned',
    source: 'order',
    description: 'Points earned from order',
  })
  
  // Update profile total
  await supabase.rpc('increment_loyalty_points', {
    user_id: userId,
    points_to_add: pointsEarned,
  })
}
