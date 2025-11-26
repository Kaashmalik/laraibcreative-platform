# Phase 7-8: Advanced Features & Deployment

## Phase 7: Advanced Features (Week 9-11)

### 7.1 Analytics Dashboard (TiDB TiFlash)

```typescript
// lib/tidb/analytics.ts
export async function getDashboardStats(dateRange: { from: Date; to: Date }) {
  // TiFlash accelerated analytics queries
  const [stats] = await tidb.execute(`
    /*+ READ_FROM_STORAGE(TIFLASH[orders, order_items]) */
    SELECT 
      COUNT(DISTINCT o.id) as total_orders,
      SUM(o.total) as total_revenue,
      AVG(o.total) as average_order_value,
      COUNT(DISTINCT o.customer_id) as unique_customers,
      SUM(oi.quantity) as items_sold
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.created_at BETWEEN ? AND ?
      AND o.status NOT IN ('cancelled', 'refunded')
  `, [dateRange.from, dateRange.to])

  return stats
}

export async function getRevenueByDay(days: number = 30) {
  return tidb.execute(`
    /*+ READ_FROM_STORAGE(TIFLASH[orders]) */
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as orders,
      SUM(total) as revenue
    FROM orders
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      AND status NOT IN ('cancelled', 'refunded')
    GROUP BY DATE(created_at)
    ORDER BY date
  `, [days])
}

export async function getTopProducts(limit: number = 10) {
  return tidb.execute(`
    /*+ READ_FROM_STORAGE(TIFLASH[order_items]) */
    SELECT 
      p.id, p.title, p.slug, p.thumbnail_image,
      SUM(oi.quantity) as total_sold,
      SUM(oi.total_price) as total_revenue
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status = 'delivered'
    GROUP BY p.id
    ORDER BY total_sold DESC
    LIMIT ?
  `, [limit])
}

export async function getCustomerInsights() {
  return tidb.execute(`
    /*+ READ_FROM_STORAGE(TIFLASH[orders]) */
    SELECT 
      customer_type,
      COUNT(*) as customer_count,
      AVG(total_spent) as avg_spent,
      AVG(total_orders) as avg_orders
    FROM (
      SELECT 
        customer_id,
        CASE 
          WHEN COUNT(*) = 1 THEN 'new'
          WHEN COUNT(*) BETWEEN 2 AND 5 THEN 'returning'
          ELSE 'vip'
        END as customer_type,
        SUM(total) as total_spent,
        COUNT(*) as total_orders
      FROM orders
      WHERE status = 'delivered'
      GROUP BY customer_id
    ) customer_stats
    GROUP BY customer_type
  `)
}
```

### 7.2 AI-Powered Recommendations

```typescript
// lib/recommendations/index.ts
export async function getPersonalizedRecommendations(
  userId?: string,
  sessionId?: string,
  limit: number = 8
) {
  // Get user's browsing history
  const viewedProducts = await tidb.execute(`
    SELECT DISTINCT product_id, MAX(created_at) as last_viewed
    FROM analytics_events
    WHERE (user_id = ? OR session_id = ?)
      AND event_type = 'product_view'
    GROUP BY product_id
    ORDER BY last_viewed DESC
    LIMIT 20
  `, [userId, sessionId])

  if (viewedProducts.length === 0) {
    // Return popular products for new users
    return getPopularProducts(limit)
  }

  // Get categories from viewed products
  const viewedIds = viewedProducts.map(p => p.product_id)
  
  const recommendations = await tidb.execute(`
    SELECT p.*, 
      (
        CASE WHEN p.category_id IN (
          SELECT category_id FROM products WHERE id IN (?)
        ) THEN 2 ELSE 0 END +
        CASE WHEN p.is_best_seller THEN 1 ELSE 0 END +
        CASE WHEN p.is_new_arrival THEN 0.5 ELSE 0 END
      ) as relevance_score
    FROM products p
    WHERE p.id NOT IN (?)
      AND p.is_active = true
      AND p.is_deleted = false
    ORDER BY relevance_score DESC, p.purchases DESC
    LIMIT ?
  `, [viewedIds, viewedIds, limit])

  return recommendations
}

export async function getFrequentlyBoughtTogether(productId: string) {
  return tidb.execute(`
    SELECT p.id, p.title, p.slug, p.thumbnail_image, p.pricing,
      COUNT(*) as co_purchase_count
    FROM order_items oi1
    JOIN order_items oi2 ON oi1.order_id = oi2.order_id
    JOIN products p ON oi2.product_id = p.id
    WHERE oi1.product_id = ?
      AND oi2.product_id != ?
      AND p.is_active = true
    GROUP BY p.id
    ORDER BY co_purchase_count DESC
    LIMIT 4
  `, [productId, productId])
}
```

### 7.3 Smart Search

```typescript
// lib/search/index.ts
export async function smartSearch(query: string, options?: SearchOptions) {
  // Full-text search with TiDB
  const products = await tidb.execute(`
    SELECT 
      p.*,
      MATCH(p.title, p.description) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
    FROM products p
    WHERE MATCH(p.title, p.description) AGAINST(? IN NATURAL LANGUAGE MODE)
      AND p.is_active = true
      AND p.is_deleted = false
    ORDER BY relevance DESC
    LIMIT 20
  `, [query, query])

  // Also search by design code
  const byCode = await tidb.execute(`
    SELECT * FROM products 
    WHERE design_code LIKE ? 
      AND is_active = true
    LIMIT 5
  `, [`%${query}%`])

  // Search categories
  const categories = await tidb.execute(`
    SELECT * FROM categories
    WHERE name LIKE ? OR slug LIKE ?
      AND is_active = true
    LIMIT 5
  `, [`%${query}%`, `%${query}%`])

  return {
    products: [...products, ...byCode].slice(0, 20),
    categories,
    suggestions: generateSuggestions(query)
  }
}

export async function getSearchSuggestions(query: string) {
  // Popular searches matching query
  const popular = await tidb.execute(`
    SELECT data->>'$.query' as query, COUNT(*) as count
    FROM analytics_events
    WHERE event_type = 'search'
      AND data->>'$.query' LIKE ?
    GROUP BY data->>'$.query'
    ORDER BY count DESC
    LIMIT 5
  `, [`${query}%`])

  // Product titles matching
  const titles = await tidb.execute(`
    SELECT DISTINCT title
    FROM products
    WHERE title LIKE ?
      AND is_active = true
    LIMIT 5
  `, [`%${query}%`])

  return { popular, titles }
}
```

### 7.4 Loyalty & Referral System

```typescript
// lib/loyalty/index.ts
const POINTS_PER_PKR = 1 // 1 point per PKR spent
const POINTS_VALUE = 0.1 // 1 point = 0.1 PKR discount

export async function awardOrderPoints(userId: string, orderTotal: number) {
  const points = Math.floor(orderTotal * POINTS_PER_PKR)
  
  await supabase.from('loyalty_points').insert({
    user_id: userId,
    points,
    type: 'earned',
    source: 'order',
    description: `Points earned from order`
  })

  await supabase.from('profiles')
    .update({ loyalty_points: supabase.rpc('increment_points', { amount: points }) })
    .eq('id', userId)

  return points
}

export async function redeemPoints(userId: string, points: number) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('loyalty_points')
    .eq('id', userId)
    .single()

  if (!profile || profile.loyalty_points < points) {
    throw new Error('Insufficient points')
  }

  const discount = points * POINTS_VALUE

  await supabase.from('loyalty_points').insert({
    user_id: userId,
    points: -points,
    type: 'redeemed',
    description: `Redeemed for PKR ${discount} discount`
  })

  await supabase.from('profiles')
    .update({ loyalty_points: profile.loyalty_points - points })
    .eq('id', userId)

  return discount
}

// Referral System
export async function createReferralCode(userId: string) {
  const code = `LC${userId.slice(-6).toUpperCase()}`
  
  await supabase.from('profiles')
    .update({ referral_code: code })
    .eq('id', userId)

  return code
}

export async function processReferral(referralCode: string, newUserId: string) {
  const { data: referrer } = await supabase
    .from('profiles')
    .select('id')
    .eq('referral_code', referralCode)
    .single()

  if (!referrer) return

  await supabase.from('referrals').insert({
    referrer_id: referrer.id,
    referred_id: newUserId,
    referral_code: referralCode,
    status: 'pending'
  })
}

export async function completeReferral(referredUserId: string) {
  const { data: referral } = await supabase
    .from('referrals')
    .select('*')
    .eq('referred_id', referredUserId)
    .eq('status', 'pending')
    .single()

  if (!referral) return

  // Award points to both
  const REFERRAL_BONUS = 500

  await Promise.all([
    awardBonusPoints(referral.referrer_id, REFERRAL_BONUS, 'Referral bonus'),
    awardBonusPoints(referredUserId, REFERRAL_BONUS, 'Welcome bonus from referral')
  ])

  await supabase.from('referrals')
    .update({ status: 'rewarded', reward_points: REFERRAL_BONUS })
    .eq('id', referral.id)
}
```

### 7.5 Real-time Features (Supabase Realtime)

```typescript
// hooks/useRealtimeOrders.ts
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeOrderStatus(orderId: string) {
  const [status, setStatus] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to order status changes
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          setStatus(payload.new.status)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId, supabase])

  return status
}

// Real-time inventory updates
export function useRealtimeStock(productId: string) {
  const [stock, setStock] = useState<number | null>(null)
  
  useEffect(() => {
    // Poll TiDB for stock updates (every 30 seconds)
    const fetchStock = async () => {
      const result = await fetch(`/api/products/${productId}/stock`)
      const data = await result.json()
      setStock(data.stock)
    }

    fetchStock()
    const interval = setInterval(fetchStock, 30000)

    return () => clearInterval(interval)
  }, [productId])

  return stock
}
```

### 7.6 WhatsApp Integration

```typescript
// lib/notifications/whatsapp.ts
const WHATSAPP_API_URL = 'https://graph.facebook.com/v17.0'

export async function sendWhatsAppMessage(phone: string, message: string) {
  // Format phone for Pakistan
  const formattedPhone = phone.startsWith('+92') 
    ? phone.replace('+', '') 
    : `92${phone.replace(/^0/, '')}`

  const response = await fetch(
    `${WHATSAPP_API_URL}/${process.env.WHATSAPP_PHONE_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'text',
        text: { body: message }
      })
    }
  )

  return response.json()
}

export async function sendOrderConfirmationWhatsApp(order: Order) {
  const message = `
🛍️ *LaraibCreative Order Confirmed!*

Order #: ${order.orderNumber}
Total: PKR ${order.total.toLocaleString()}

Items:
${order.items.map(i => `• ${i.product.title} x${i.quantity}`).join('\n')}

We'll update you when your order ships!

Track: ${process.env.NEXT_PUBLIC_APP_URL}/track/${order.orderNumber}
  `.trim()

  return sendWhatsAppMessage(order.customerPhone, message)
}
```

---

## Phase 8: Testing & Deployment (Week 11-12)

### 8.1 Testing Strategy

```typescript
// __tests__/integration/checkout.test.ts
import { createOrder } from '@/app/actions/orders'
import { tidb } from '@/lib/tidb/connection'

describe('Checkout Flow', () => {
  beforeEach(async () => {
    // Setup test data
  })

  afterEach(async () => {
    // Cleanup
  })

  it('should create order successfully', async () => {
    const orderData = {
      items: [{
        productId: 'test-product-1',
        quantity: 2,
        unitPrice: 5000,
        totalPrice: 10000,
        isStitched: false,
        productSnapshot: { title: 'Test Product' }
      }],
      shippingAddress: {
        fullName: 'Test User',
        phone: '03001234567',
        addressLine1: '123 Test Street',
        city: 'Lahore'
      },
      email: 'test@example.com',
      phone: '03001234567',
      paymentMethod: 'cod',
      subtotal: 10000,
      shippingFee: 200,
      stitchingFee: 0,
      discount: 0,
      total: 10200
    }

    const result = await createOrder(orderData)

    expect(result.success).toBe(true)
    expect(result.orderNumber).toMatch(/^LC-\d{4}-\d{5}$/)
  })

  it('should handle stitching orders', async () => {
    // Test with measurements
  })

  it('should apply discount codes', async () => {
    // Test discount application
  })
})
```

### 8.2 E2E Tests (Playwright)

```typescript
// e2e/checkout.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Checkout Process', () => {
  test('complete checkout as guest', async ({ page }) => {
    // Add product to cart
    await page.goto('/products/test-lawn-suit')
    await page.click('[data-testid="add-to-cart"]')
    
    // Go to checkout
    await page.click('[data-testid="cart-icon"]')
    await page.click('[data-testid="checkout-button"]')
    
    // Fill shipping info
    await page.fill('[name="fullName"]', 'Test User')
    await page.fill('[name="phone"]', '03001234567')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="addressLine1"]', '123 Test Street')
    await page.selectOption('[name="city"]', 'Lahore')
    await page.click('[data-testid="continue-to-payment"]')
    
    // Select payment
    await page.click('[data-testid="payment-cod"]')
    await page.click('[data-testid="continue-to-review"]')
    
    // Place order
    await page.click('[data-testid="place-order"]')
    
    // Verify confirmation
    await expect(page).toHaveURL(/\/order-confirmation\/LC-/)
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible()
  })
})
```

### 8.3 Deployment Checklist

```markdown
## Pre-Deployment Checklist

### Environment
- [ ] All environment variables set in Vercel
- [ ] TiDB Cloud production cluster ready
- [ ] Supabase production project configured
- [ ] Cloudinary production account
- [ ] Domain DNS configured (Cloudflare)

### Database
- [ ] TiDB migrations applied
- [ ] Supabase migrations applied
- [ ] RLS policies verified
- [ ] Indexes created
- [ ] TiFlash replicas enabled

### Security
- [ ] API keys rotated
- [ ] Rate limiting configured
- [ ] CORS settings correct
- [ ] CSP headers configured
- [ ] SSL/TLS verified

### Performance
- [ ] Images optimized
- [ ] Fonts optimized
- [ ] Code splitting verified
- [ ] Caching headers set
- [ ] CDN configured

### Monitoring
- [ ] Error tracking (Sentry)
- [ ] Analytics (Vercel Analytics)
- [ ] Uptime monitoring
- [ ] Log aggregation

### Testing
- [ ] All unit tests passing
- [ ] E2E tests passing
- [ ] Load testing completed
- [ ] Security audit done
```

### 8.4 Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_key",
    "TIDB_HOST": "@tidb_host",
    "TIDB_USER": "@tidb_user",
    "TIDB_PASSWORD": "@tidb_password"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

---

## Deliverables Phase 7-8

### Phase 7
- [ ] Analytics dashboard with TiFlash queries
- [ ] Product recommendations
- [ ] Smart search with suggestions
- [ ] Loyalty points system
- [ ] Referral program
- [ ] Real-time order tracking
- [ ] WhatsApp notifications
- [ ] Admin dashboard enhancements

### Phase 8
- [ ] Unit test coverage > 80%
- [ ] E2E tests for critical flows
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Documentation complete
- [ ] Go-live checklist passed

---

## Post-Launch Monitoring

### Key Metrics to Track
- Conversion rate
- Cart abandonment rate
- Average order value
- Page load times
- Error rates
- Server response times
- Database query performance

### Weekly Tasks
- Review analytics
- Check error logs
- Monitor performance
- Process customer feedback
- Deploy bug fixes
- Update content
