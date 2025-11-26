/**
 * TiDB Analytics Service (TiFlash HTAP)
 */
import { tidb } from './connection'

export interface DashboardStats {
  total_orders: number
  total_revenue: number
  average_order_value: number
  unique_customers: number
  items_sold: number
}

export interface RevenueByDay {
  date: string
  orders: number
  revenue: number
}

export interface TopProduct {
  id: string
  title: string
  slug: string
  thumbnail_image: string
  total_sold: number
  total_revenue: number
}

export async function getDashboardStats(from: Date, to: Date): Promise<DashboardStats> {
  const result = await tidb.queryOne<DashboardStats>(`
    /*+ READ_FROM_STORAGE(TIFLASH[orders, order_items]) */
    SELECT 
      COUNT(DISTINCT o.id) as total_orders,
      COALESCE(SUM(o.total), 0) as total_revenue,
      COALESCE(AVG(o.total), 0) as average_order_value,
      COUNT(DISTINCT o.customer_id) as unique_customers,
      COALESCE(SUM(oi.quantity), 0) as items_sold
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.created_at BETWEEN ? AND ?
      AND o.status NOT IN ('cancelled', 'refunded')
  `, [from.toISOString(), to.toISOString()])

  return result || {
    total_orders: 0,
    total_revenue: 0,
    average_order_value: 0,
    unique_customers: 0,
    items_sold: 0
  }
}

export async function getRevenueByDay(days = 30): Promise<RevenueByDay[]> {
  return tidb.execute<RevenueByDay>(`
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

export async function getTopProducts(limit = 10): Promise<TopProduct[]> {
  return tidb.execute<TopProduct>(`
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

export async function trackEvent(event: {
  type: string
  user_id?: string
  session_id?: string
  product_id?: string
  data?: Record<string, unknown>
  device_type?: 'mobile' | 'tablet' | 'desktop'
}): Promise<void> {
  await tidb.execute(`
    INSERT INTO analytics_events (event_type, user_id, session_id, product_id, data, device_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
  `, [
    event.type,
    event.user_id || null,
    event.session_id || null,
    event.product_id || null,
    JSON.stringify(event.data || {}),
    event.device_type || null
  ])
}

export async function getProductViews(productId: string, days = 7): Promise<number> {
  const result = await tidb.queryOne<{ views: number }>(`
    SELECT COUNT(*) as views FROM analytics_events
    WHERE event_type = 'product_view' AND product_id = ?
      AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
  `, [productId, days])
  
  return result?.views || 0
}
