/**
 * TiDB Orders Service
 */
import { tidb } from './connection'

export interface Order {
  id: string
  order_number: string
  customer_id: string | null
  customer_email: string
  customer_phone: string | null
  status: OrderStatus
  order_type: 'standard' | 'custom' | 'replica'
  shipping_address: ShippingAddress
  subtotal: number
  shipping_fee: number
  stitching_fee: number
  discount_amount: number
  total: number
  payment_method: PaymentMethod
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  tracking_number: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export type OrderStatus = 
  | 'pending-payment' | 'payment-verified' | 'confirmed'
  | 'in-stitching' | 'quality-check' | 'ready-dispatch'
  | 'dispatched' | 'delivered' | 'cancelled' | 'refunded'

export type PaymentMethod = 'cod' | 'card' | 'jazzcash' | 'easypaisa' | 'bank_transfer'

export interface ShippingAddress {
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

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_snapshot: { title: string; image: string; price: number }
  quantity: number
  unit_price: number
  total_price: number
  is_stitched: boolean
  stitching_price: number
  measurements: Record<string, number> | null
  customization: Record<string, string> | null
}

export interface CreateOrderInput {
  customer_id?: string
  customer_email: string
  customer_phone: string
  order_type: 'standard' | 'custom'
  shipping_address: ShippingAddress
  items: Omit<OrderItem, 'id' | 'order_id'>[]
  subtotal: number
  shipping_fee: number
  stitching_fee: number
  discount_amount: number
  total: number
  payment_method: PaymentMethod
}

function generateOrderNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(10000 + Math.random() * 90000)
  return `LC-${year}-${random}`
}

export async function createOrder(input: CreateOrderInput): Promise<{ orderId: string; orderNumber: string }> {
  const orderId = crypto.randomUUID()
  const orderNumber = generateOrderNumber()

  await tidb.execute(`
    INSERT INTO orders (
      id, order_number, customer_id, customer_email, customer_phone,
      status, order_type, shipping_address, subtotal, shipping_fee,
      stitching_fee, discount_amount, total, payment_method, payment_status
    ) VALUES (?, ?, ?, ?, ?, 'pending-payment', ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `, [
    orderId, orderNumber, input.customer_id || null,
    input.customer_email, input.customer_phone,
    input.order_type, JSON.stringify(input.shipping_address),
    input.subtotal, input.shipping_fee, input.stitching_fee,
    input.discount_amount, input.total, input.payment_method
  ])

  // Insert order items
  for (const item of input.items) {
    await tidb.execute(`
      INSERT INTO order_items (
        id, order_id, product_id, product_snapshot, quantity,
        unit_price, total_price, is_stitched, stitching_price,
        measurements, customization
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      crypto.randomUUID(), orderId, item.product_id,
      JSON.stringify(item.product_snapshot), item.quantity,
      item.unit_price, item.total_price, item.is_stitched,
      item.stitching_price || 0,
      JSON.stringify(item.measurements), JSON.stringify(item.customization)
    ])
  }

  return { orderId, orderNumber }
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const order = await tidb.queryOne<Order>(
    'SELECT * FROM orders WHERE order_number = ?', [orderNumber]
  )
  
  if (!order) return null

  const items = await tidb.execute<OrderItem>(
    'SELECT * FROM order_items WHERE order_id = ?', [order.id]
  )

  return { ...order, items }
}

export async function getOrdersByCustomer(customerId: string): Promise<Order[]> {
  return tidb.execute<Order>(`
    SELECT * FROM orders WHERE customer_id = ?
    ORDER BY created_at DESC
  `, [customerId])
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Promise<void> {
  await tidb.execute(
    'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
    [status, orderId]
  )

  await tidb.execute(`
    INSERT INTO order_status_history (id, order_id, status, note, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `, [crypto.randomUUID(), orderId, status, note || null])
}
