# Phase 4-5: Cart, Checkout & Order Management

## Phase 4: Shopping Cart & Checkout (Week 4-5)

### 4.1 Cart Store (Zustand + Supabase Sync)

```typescript
// store/cart-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'

interface CartItem {
  id: string
  productId: string
  variantId?: string
  quantity: number
  customization?: {
    isStitched: boolean
    measurementId?: string
    neckStyle?: string
    sleeveStyle?: string
    bottomStyle?: string
  }
  product: {
    title: string
    slug: string
    image: string
    price: number
    salePrice?: number
    stitchingPrice?: number
  }
}

interface CartStore {
  items: CartItem[]
  isLoading: boolean
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void
  updateQuantity: (itemId: string, quantity: number) => void
  updateCustomization: (itemId: string, customization: CartItem['customization']) => void
  removeItem: (itemId: string) => void
  clearCart: () => void
  
  // Sync
  syncWithServer: (userId: string) => Promise<void>
  
  // Computed
  getItemCount: () => number
  getSubtotal: () => number
  getStitchingTotal: () => number
  getTotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: (newItem) => {
        const id = crypto.randomUUID()
        set((state) => {
          // Check if same product+variant exists
          const existingIndex = state.items.findIndex(
            item => item.productId === newItem.productId && 
                   item.variantId === newItem.variantId &&
                   JSON.stringify(item.customization) === JSON.stringify(newItem.customization)
          )
          
          if (existingIndex > -1) {
            const updated = [...state.items]
            updated[existingIndex].quantity += newItem.quantity
            return { items: updated }
          }
          
          return { items: [...state.items, { ...newItem, id }] }
        })
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) {
          get().removeItem(itemId)
          return
        }
        set((state) => ({
          items: state.items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          )
        }))
      },

      updateCustomization: (itemId, customization) => {
        set((state) => ({
          items: state.items.map(item =>
            item.id === itemId ? { ...item, customization } : item
          )
        }))
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== itemId)
        }))
      },

      clearCart: () => set({ items: [] }),

      syncWithServer: async (userId) => {
        const supabase = createClient()
        const items = get().items
        
        // Upsert cart items to Supabase
        for (const item of items) {
          await supabase.from('cart_items').upsert({
            user_id: userId,
            product_id: item.productId,
            variant_id: item.variantId,
            quantity: item.quantity,
            customization: item.customization
          })
        }
      },

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      getSubtotal: () => get().items.reduce((sum, item) => {
        const price = item.product.salePrice || item.product.price
        return sum + (price * item.quantity)
      }, 0),

      getStitchingTotal: () => get().items.reduce((sum, item) => {
        if (item.customization?.isStitched && item.product.stitchingPrice) {
          return sum + (item.product.stitchingPrice * item.quantity)
        }
        return sum
      }, 0),

      getTotal: () => get().getSubtotal() + get().getStitchingTotal(),
    }),
    {
      name: 'laraib-cart',
    }
  )
)
```

### 4.2 Checkout Flow

```
STEP 1: SHIPPING INFO
├── Guest checkout OR login prompt
├── Select saved address OR new address
├── Google Places autocomplete
├── City-based shipping calculation
└── Delivery instructions (optional)

STEP 2: STITCHING DETAILS (if any stitched items)
├── For each stitched item:
│   ├── Select saved measurements OR enter new
│   ├── Visual measurement guide
│   ├── Neck style selector
│   ├── Sleeve style selector
│   └── Bottom style selector (if applicable)
└── Express stitching option (+30% fee)

STEP 3: PAYMENT METHOD
├── Cash on Delivery (default, +100 PKR fee)
├── JazzCash
├── EasyPaisa
├── Credit/Debit Card
├── Bank Transfer
└── Apply discount code

STEP 4: ORDER REVIEW
├── Order summary
├── Final pricing breakdown
├── Estimated delivery date
├── Terms & conditions acceptance
└── PLACE ORDER button
```

### 4.3 Checkout Component

```typescript
// components/checkout/CheckoutWizard.tsx
'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cart-store'
import { ShippingStep } from './ShippingStep'
import { StitchingStep } from './StitchingStep'
import { PaymentStep } from './PaymentStep'
import { ReviewStep } from './ReviewStep'
import { createOrder } from '@/app/actions/orders'

type Step = 'shipping' | 'stitching' | 'payment' | 'review'

export function CheckoutWizard() {
  const { items, getSubtotal, getStitchingTotal, getTotal, clearCart } = useCartStore()
  const [currentStep, setCurrentStep] = useState<Step>('shipping')
  const [orderData, setOrderData] = useState<CheckoutData>({
    shipping: null,
    stitching: {},
    payment: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasStitchedItems = items.some(item => item.customization?.isStitched)

  const steps: Step[] = hasStitchedItems 
    ? ['shipping', 'stitching', 'payment', 'review']
    : ['shipping', 'payment', 'review']

  const currentIndex = steps.indexOf(currentStep)

  const handleNext = (data: Partial<CheckoutData>) => {
    setOrderData(prev => ({ ...prev, ...data }))
    
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const handlePlaceOrder = async () => {
    setIsSubmitting(true)
    
    try {
      const result = await createOrder({
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.product.salePrice || item.product.price,
          totalPrice: (item.product.salePrice || item.product.price) * item.quantity,
          isStitched: item.customization?.isStitched || false,
          stitchingPrice: item.customization?.isStitched ? item.product.stitchingPrice : 0,
          measurements: orderData.stitching[item.id]?.measurements,
          customization: item.customization,
          productSnapshot: item.product,
        })),
        shippingAddress: orderData.shipping,
        paymentMethod: orderData.payment.method,
        subtotal: getSubtotal(),
        stitchingFee: getStitchingTotal(),
        shippingFee: orderData.shipping.shippingFee,
        discount: orderData.payment.discountAmount || 0,
        total: getTotal() + orderData.shipping.shippingFee - (orderData.payment.discountAmount || 0),
        email: orderData.shipping.email,
        phone: orderData.shipping.phone,
      })

      if (result.success) {
        clearCart()
        // Redirect to confirmation
        window.location.href = `/order-confirmation/${result.orderNumber}`
      }
    } catch (error) {
      console.error('Order failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-semibold
              ${index <= currentIndex ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'}
            `}>
              {index + 1}
            </div>
            <span className="ml-2 hidden sm:block capitalize">{step}</span>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-4 ${index < currentIndex ? 'bg-primary-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl shadow-soft p-6 md:p-8">
        {currentStep === 'shipping' && (
          <ShippingStep 
            initialData={orderData.shipping}
            onNext={(data) => handleNext({ shipping: data })}
          />
        )}
        
        {currentStep === 'stitching' && (
          <StitchingStep
            items={items.filter(i => i.customization?.isStitched)}
            initialData={orderData.stitching}
            onNext={(data) => handleNext({ stitching: data })}
            onBack={handleBack}
          />
        )}
        
        {currentStep === 'payment' && (
          <PaymentStep
            total={getTotal() + (orderData.shipping?.shippingFee || 0)}
            initialData={orderData.payment}
            onNext={(data) => handleNext({ payment: data })}
            onBack={handleBack}
          />
        )}
        
        {currentStep === 'review' && (
          <ReviewStep
            orderData={orderData}
            items={items}
            subtotal={getSubtotal()}
            stitchingFee={getStitchingTotal()}
            onPlaceOrder={handlePlaceOrder}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  )
}
```

### 4.4 Payment Integration

```typescript
// lib/payments/cod.ts
export const COD_FEE = 100 // PKR

export function calculateCODFee(total: number): number {
  // Free COD for orders above 5000 PKR
  return total >= 5000 ? 0 : COD_FEE
}

// lib/payments/jazzcash.ts
export async function initiateJazzCashPayment(order: OrderData) {
  const payload = {
    pp_MerchantID: process.env.JAZZCASH_MERCHANT_ID,
    pp_Password: process.env.JAZZCASH_PASSWORD,
    pp_TxnRefNo: order.orderNumber,
    pp_Amount: order.total * 100, // In paisa
    pp_TxnCurrency: 'PKR',
    pp_TxnDateTime: formatJazzCashDate(new Date()),
    pp_BillReference: order.id,
    pp_Description: `LaraibCreative Order ${order.orderNumber}`,
    pp_ReturnURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/jazzcash/callback`,
  }

  payload.pp_SecureHash = generateJazzCashHash(payload)

  return {
    url: process.env.JAZZCASH_ENDPOINT,
    payload
  }
}

// lib/payments/easypaisa.ts
export async function initiateEasyPaisaPayment(order: OrderData) {
  // Similar implementation for EasyPaisa
}
```

---

## Phase 5: Stitching Service & Order Management (Week 5-6)

### 5.1 Measurement System

```typescript
// types/measurements.ts
export interface Measurements {
  // Upper Body
  bust: number
  waist: number
  hip: number
  shoulder: number
  armLength: number
  armhole: number
  bicep: number
  wrist: number
  
  // Length
  frontLength: number
  backLength: number
  
  // Neck
  neckCircumference: number
  frontNeckDepth: number
  backNeckDepth: number
  
  // Bottom (optional)
  bottomLength?: number
  bottomWaist?: number
  thigh?: number
  inseam?: number
  
  // Additional
  notes?: string
}

// Measurement presets based on standard sizes
export const SIZE_PRESETS: Record<string, Partial<Measurements>> = {
  'XS': { bust: 32, waist: 26, hip: 35, shoulder: 14 },
  'S': { bust: 34, waist: 28, hip: 37, shoulder: 14.5 },
  'M': { bust: 36, waist: 30, hip: 39, shoulder: 15 },
  'L': { bust: 38, waist: 32, hip: 41, shoulder: 15.5 },
  'XL': { bust: 40, waist: 34, hip: 43, shoulder: 16 },
  'XXL': { bust: 42, waist: 36, hip: 45, shoulder: 16.5 },
}
```

### 5.2 Customization Options

```typescript
// config/stitching-options.ts
export const NECK_STYLES = [
  { id: 'round', name: 'Round Neck', image: '/images/stitching/neck-round.svg' },
  { id: 'v-neck', name: 'V-Neck', image: '/images/stitching/neck-v.svg' },
  { id: 'boat', name: 'Boat Neck', image: '/images/stitching/neck-boat.svg' },
  { id: 'collar', name: 'Collar', image: '/images/stitching/neck-collar.svg' },
  { id: 'mandarin', name: 'Mandarin', image: '/images/stitching/neck-mandarin.svg' },
  { id: 'sweetheart', name: 'Sweetheart', image: '/images/stitching/neck-sweetheart.svg' },
]

export const SLEEVE_STYLES = [
  { id: 'full', name: 'Full Sleeves', image: '/images/stitching/sleeve-full.svg' },
  { id: 'three-quarter', name: '3/4 Sleeves', image: '/images/stitching/sleeve-34.svg' },
  { id: 'half', name: 'Half Sleeves', image: '/images/stitching/sleeve-half.svg' },
  { id: 'cap', name: 'Cap Sleeves', image: '/images/stitching/sleeve-cap.svg' },
  { id: 'sleeveless', name: 'Sleeveless', image: '/images/stitching/sleeve-none.svg' },
  { id: 'bell', name: 'Bell Sleeves', image: '/images/stitching/sleeve-bell.svg', priceAddon: 200 },
]

export const BOTTOM_STYLES = [
  { id: 'straight', name: 'Straight Pants', image: '/images/stitching/bottom-straight.svg' },
  { id: 'cigarette', name: 'Cigarette', image: '/images/stitching/bottom-cigarette.svg' },
  { id: 'palazzo', name: 'Palazzo', image: '/images/stitching/bottom-palazzo.svg' },
  { id: 'gharara', name: 'Gharara', image: '/images/stitching/bottom-gharara.svg', priceAddon: 500 },
  { id: 'sharara', name: 'Sharara', image: '/images/stitching/bottom-sharara.svg', priceAddon: 500 },
]

export const EMBELLISHMENTS = [
  { id: 'lace', name: 'Lace Border', priceAddon: 500 },
  { id: 'piping', name: 'Piping', priceAddon: 300 },
  { id: 'pearls', name: 'Pearl Buttons', priceAddon: 400 },
]
```

### 5.3 Order Creation Server Action

```typescript
// app/actions/orders.ts
'use server'

import { tidb, pool } from '@/lib/tidb/connection'
import { createClient } from '@/lib/supabase/server'
import { sendOrderConfirmation, sendWhatsAppNotification } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'

export async function createOrder(orderData: CreateOrderInput) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const orderNumber = generateOrderNumber() // LC-2025-XXXXX
  const orderId = crypto.randomUUID()

  const connection = await pool.getConnection()
  
  try {
    await connection.beginTransaction()

    // 1. Create order
    await connection.execute(`
      INSERT INTO orders (
        id, order_number, customer_id, customer_email, customer_phone,
        status, order_type, shipping_address, subtotal, shipping_fee,
        stitching_fee, discount_amount, total, payment_method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderId, orderNumber, session?.user.id || null,
      orderData.email, orderData.phone, 'pending-payment',
      orderData.items.some(i => i.isStitched) ? 'custom' : 'standard',
      JSON.stringify(orderData.shippingAddress),
      orderData.subtotal, orderData.shippingFee,
      orderData.stitchingFee, orderData.discount, orderData.total,
      orderData.paymentMethod
    ])

    // 2. Create order items
    for (const item of orderData.items) {
      await connection.execute(`
        INSERT INTO order_items (
          id, order_id, product_id, variant_id, product_snapshot,
          quantity, unit_price, total_price, is_stitched,
          stitching_price, measurements, customization
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        crypto.randomUUID(), orderId, item.productId, item.variantId || null,
        JSON.stringify(item.productSnapshot), item.quantity, item.unitPrice,
        item.totalPrice, item.isStitched, item.stitchingPrice || 0,
        JSON.stringify(item.measurements || null),
        JSON.stringify(item.customization || null)
      ])
    }

    // 3. Create status history
    await connection.execute(`
      INSERT INTO order_status_history (id, order_id, status, note)
      VALUES (?, ?, 'pending-payment', 'Order placed by customer')
    `, [crypto.randomUUID(), orderId])

    // 4. Clear cart if logged in
    if (session?.user.id) {
      await supabase.from('cart_items').delete().eq('user_id', session.user.id)
    }

    await connection.commit()

    // 5. Send notifications (async)
    Promise.all([
      sendOrderConfirmation({
        email: orderData.email,
        orderNumber,
        total: orderData.total,
        items: orderData.items
      }),
      sendWhatsAppNotification({
        phone: orderData.phone,
        message: `Thank you for your order! Order #${orderNumber}. Total: PKR ${orderData.total.toLocaleString()}. We'll notify you once confirmed.`
      })
    ]).catch(console.error)

    return { success: true, orderNumber, orderId }

  } catch (error) {
    await connection.rollback()
    console.error('Order creation failed:', error)
    throw error
  } finally {
    connection.release()
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  note?: string
) {
  // Verify admin
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) throw new Error('Unauthorized')
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()
  
  if (!['admin', 'super-admin'].includes(profile?.role || '')) {
    throw new Error('Unauthorized')
  }

  await tidb.execute(
    'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
    [status, orderId]
  )

  await tidb.execute(`
    INSERT INTO order_status_history (id, order_id, status, note, updated_by)
    VALUES (?, ?, ?, ?, ?)
  `, [crypto.randomUUID(), orderId, status, note || null, session.user.id])

  // Notify customer
  const order = await tidb.execute(
    'SELECT customer_email, customer_phone, order_number FROM orders WHERE id = ?',
    [orderId]
  )

  if (order[0]) {
    sendWhatsAppNotification({
      phone: order[0].customer_phone,
      message: `Order #${order[0].order_number} update: ${getStatusMessage(status)}`
    }).catch(console.error)
  }

  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath(`/account/orders/${orderId}`)
}

function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    'payment-verified': 'Payment verified! We\'re processing your order.',
    'in-stitching': 'Your custom suit is being stitched!',
    'quality-check': 'Quality check in progress.',
    'ready-dispatch': 'Your order is ready for dispatch!',
    'dispatched': 'Your order has been shipped!',
    'delivered': 'Order delivered. Enjoy your new suit!'
  }
  return messages[status] || `Status updated to ${status}`
}
```

### Deliverables Phase 4-5
- [ ] Cart component with quantity controls
- [ ] Cart drawer/page
- [ ] Cart persistence (localStorage + Supabase)
- [ ] Checkout wizard (4 steps)
- [ ] Shipping form with Google Places
- [ ] Measurement form with visual guide
- [ ] Customization selectors (neck, sleeve, bottom)
- [ ] Payment method selection
- [ ] COD with fee calculation
- [ ] Order creation with transaction
- [ ] Order confirmation page
- [ ] Email/SMS/WhatsApp notifications
- [ ] Order tracking page
- [ ] Admin order management
- [ ] Order status updates
