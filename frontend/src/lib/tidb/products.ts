/**
 * TiDB Products Service
 */
import { tidb } from './connection'

export interface Product {
  id: string
  sku: string | null
  title: string
  slug: string
  design_code: string | null
  description: string | null
  short_description: string | null
  category_id: string | null
  product_type: 'ready-made' | 'custom-only' | 'both'
  availability: 'in-stock' | 'made-to-order' | 'out-of-stock' | 'discontinued'
  pricing: { base: number; sale?: number; stitching?: number }
  primary_image: string | null
  thumbnail_image: string | null
  is_featured: boolean
  is_new_arrival: boolean
  is_best_seller: boolean
  is_active: boolean
  views: number
  average_rating: number
  total_reviews: number
  category_name?: string
  category_slug?: string
}

export interface ProductFilters {
  category?: string
  priceMin?: number
  priceMax?: number
  isFeatured?: boolean
  isNewArrival?: boolean
}

export async function getProducts(options: {
  page?: number
  limit?: number
  search?: string
  filters?: ProductFilters
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'popular'
}) {
  const { page = 1, limit = 20, search, filters, sort = 'newest' } = options
  const offset = (page - 1) * limit
  const params: unknown[] = []
  let whereClause = 'WHERE p.is_active = true AND p.is_deleted = false'

  if (filters?.category) {
    whereClause += ' AND c.slug = ?'
    params.push(filters.category)
  }

  if (search) {
    whereClause += ' AND MATCH(p.title, p.description) AGAINST(? IN NATURAL LANGUAGE MODE)'
    params.push(search)
  }

  if (filters?.priceMin) {
    whereClause += " AND JSON_EXTRACT(p.pricing, '$.base') >= ?"
    params.push(filters.priceMin)
  }

  if (filters?.priceMax) {
    whereClause += " AND JSON_EXTRACT(p.pricing, '$.base') <= ?"
    params.push(filters.priceMax)
  }

  if (filters?.isFeatured) whereClause += ' AND p.is_featured = true'
  if (filters?.isNewArrival) whereClause += ' AND p.is_new_arrival = true'

  const sortMap: Record<string, string> = {
    'newest': 'p.created_at DESC',
    'price-asc': "JSON_EXTRACT(p.pricing, '$.base') ASC",
    'price-desc': "JSON_EXTRACT(p.pricing, '$.base') DESC",
    'popular': 'p.purchases DESC, p.views DESC'
  }

  const products = await tidb.execute<Product>(`
    SELECT p.id, p.title, p.slug, p.short_description, p.pricing,
      p.primary_image, p.thumbnail_image, p.is_featured, p.is_new_arrival,
      p.is_best_seller, p.availability, p.average_rating, p.total_reviews,
      c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereClause}
    ORDER BY ${sortMap[sort]}
    LIMIT ? OFFSET ?
  `, [...params, limit, offset])

  const countResult = await tidb.execute<{ total: number }>(`
    SELECT COUNT(*) as total FROM products p
    LEFT JOIN categories c ON p.category_id = c.id ${whereClause}
  `, params)

  return {
    products,
    pagination: {
      page, limit,
      total: countResult[0]?.total || 0,
      totalPages: Math.ceil((countResult[0]?.total || 0) / limit)
    }
  }
}

export async function getProductBySlug(slug: string) {
  const product = await tidb.queryOne<Product>(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.slug = ? AND p.is_active = true AND p.is_deleted = false
  `, [slug])

  if (!product) return null

  const [images, variants] = await Promise.all([
    tidb.execute('SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order', [product.id]),
    tidb.execute('SELECT * FROM product_variants WHERE product_id = ? AND is_available = true', [product.id])
  ])

  // Increment view count async
  tidb.execute('UPDATE products SET views = views + 1 WHERE id = ?', [product.id]).catch(() => {})

  return { ...product, images, variants }
}

export async function getRelatedProducts(productId: string, categoryId: string, limit = 4) {
  return tidb.execute<Product>(`
    SELECT id, title, slug, pricing, thumbnail_image, average_rating
    FROM products WHERE category_id = ? AND id != ? AND is_active = true
    ORDER BY purchases DESC LIMIT ?
  `, [categoryId, productId, limit])
}

export async function getFeaturedProducts(limit = 8) {
  return tidb.execute<Product>(`
    SELECT id, title, slug, pricing, thumbnail_image, average_rating, is_new_arrival
    FROM products WHERE is_featured = true AND is_active = true
    ORDER BY created_at DESC LIMIT ?
  `, [limit])
}

export async function getNewArrivals(limit = 8) {
  return tidb.execute<Product>(`
    SELECT id, title, slug, pricing, thumbnail_image, average_rating
    FROM products WHERE is_new_arrival = true AND is_active = true
    ORDER BY created_at DESC LIMIT ?
  `, [limit])
}
