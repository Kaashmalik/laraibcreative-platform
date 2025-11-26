'use server'

/**
 * Product Server Actions - Phase 3
 * Server-side data fetching from TiDB
 */

import { getProducts, getProductBySlug, getRelatedProducts, getFeaturedProducts, getNewArrivals, type ProductFilters } from '@/lib/tidb/products'
import { getCategories, getCategoriesTree, getCategoryBySlug, getFeaturedCategories } from '@/lib/tidb/categories'
import { trackEvent } from '@/lib/tidb/analytics'
import { cookies } from 'next/headers'

// Get session ID for analytics
async function getSessionId(): Promise<string> {
  const cookieStore = await cookies()
  let sessionId = cookieStore.get('session_id')?.value
  
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    // Note: Setting cookies in server actions requires response headers
  }
  
  return sessionId
}

/**
 * Fetch products with filters and pagination
 */
export async function fetchProducts(options: {
  page?: number
  limit?: number
  search?: string
  category?: string
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'popular'
  filters?: ProductFilters
}) {
  try {
    const result = await getProducts({
      page: options.page || 1,
      limit: options.limit || 20,
      search: options.search,
      sort: options.sort || 'newest',
      filters: {
        ...options.filters,
        category: options.category,
      },
    })
    
    return { success: true, ...result }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { success: false, products: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }
  }
}

/**
 * Fetch single product by slug
 */
export async function fetchProduct(slug: string) {
  try {
    const product = await getProductBySlug(slug)
    
    if (product) {
      // Track view
      const sessionId = await getSessionId()
      trackEvent({
        type: 'product_view',
        product_id: product.id,
        session_id: sessionId,
      }).catch(() => {}) // Fire and forget
    }
    
    return { success: true, product }
  } catch (error) {
    console.error('Error fetching product:', error)
    return { success: false, product: null }
  }
}

/**
 * Fetch related products
 */
export async function fetchRelatedProducts(productId: string, categoryId: string) {
  try {
    const products = await getRelatedProducts(productId, categoryId, 4)
    return { success: true, products }
  } catch (error) {
    console.error('Error fetching related products:', error)
    return { success: false, products: [] }
  }
}

/**
 * Fetch featured products for homepage
 */
export async function fetchFeaturedProducts(limit = 8) {
  try {
    const products = await getFeaturedProducts(limit)
    return { success: true, products }
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return { success: false, products: [] }
  }
}

/**
 * Fetch new arrivals for homepage
 */
export async function fetchNewArrivals(limit = 8) {
  try {
    const products = await getNewArrivals(limit)
    return { success: true, products }
  } catch (error) {
    console.error('Error fetching new arrivals:', error)
    return { success: false, products: [] }
  }
}

/**
 * Fetch all categories
 */
export async function fetchCategories() {
  try {
    const categories = await getCategories()
    return { success: true, categories }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return { success: false, categories: [] }
  }
}

/**
 * Fetch categories as tree structure
 */
export async function fetchCategoriesTree() {
  try {
    const categories = await getCategoriesTree()
    return { success: true, categories }
  } catch (error) {
    console.error('Error fetching categories tree:', error)
    return { success: false, categories: [] }
  }
}

/**
 * Fetch single category by slug
 */
export async function fetchCategory(slug: string) {
  try {
    const category = await getCategoryBySlug(slug)
    return { success: true, category }
  } catch (error) {
    console.error('Error fetching category:', error)
    return { success: false, category: null }
  }
}

/**
 * Fetch featured categories for homepage
 */
export async function fetchFeaturedCategories(limit = 6) {
  try {
    const categories = await getFeaturedCategories(limit)
    return { success: true, categories }
  } catch (error) {
    console.error('Error fetching featured categories:', error)
    return { success: false, categories: [] }
  }
}

/**
 * Search products
 */
export async function searchProducts(query: string, limit = 10) {
  try {
    const result = await getProducts({
      search: query,
      limit,
    })
    
    // Track search
    const sessionId = await getSessionId()
    trackEvent({
      type: 'search',
      session_id: sessionId,
      data: { query, results_count: result.products.length },
    }).catch(() => {})
    
    return { success: true, products: result.products }
  } catch (error) {
    console.error('Error searching products:', error)
    return { success: false, products: [] }
  }
}
