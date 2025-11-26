/**
 * TiDB Reviews Service - Phase 7
 * Product reviews with ratings
 */

import { tidb } from './connection'

export interface Review {
  id: string
  product_id: string
  customer_id: string | null
  customer_name: string
  customer_email: string
  rating: number
  title: string | null
  content: string
  images: string[]
  is_verified_purchase: boolean
  is_approved: boolean
  helpful_count: number
  created_at: string
}

export interface CreateReviewInput {
  product_id: string
  customer_id?: string
  customer_name: string
  customer_email: string
  rating: number
  title?: string
  content: string
  images?: string[]
  order_id?: string
}

/**
 * Get reviews for a product
 */
export async function getProductReviews(
  productId: string,
  options: {
    page?: number
    limit?: number
    sort?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'
  } = {}
): Promise<{ reviews: Review[]; stats: ReviewStats }> {
  const { page = 1, limit = 10, sort = 'newest' } = options
  const offset = (page - 1) * limit

  const orderBy = {
    newest: 'r.created_at DESC',
    oldest: 'r.created_at ASC',
    highest: 'r.rating DESC, r.created_at DESC',
    lowest: 'r.rating ASC, r.created_at DESC',
    helpful: 'r.helpful_count DESC, r.created_at DESC',
  }[sort]

  const [reviews, stats] = await Promise.all([
    tidb.execute<Review>(`
      SELECT 
        r.*,
        COALESCE(r.images, '[]') as images
      FROM reviews r
      WHERE r.product_id = ? AND r.is_approved = true
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `, [productId, limit, offset]),
    
    getReviewStats(productId)
  ])

  return { reviews, stats }
}

export interface ReviewStats {
  average_rating: number
  total_reviews: number
  rating_distribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

/**
 * Get review statistics for a product
 */
export async function getReviewStats(productId: string): Promise<ReviewStats> {
  const result = await tidb.queryOne<{
    average_rating: number
    total_reviews: number
    r1: number
    r2: number
    r3: number
    r4: number
    r5: number
  }>(`
    SELECT 
      COALESCE(AVG(rating), 0) as average_rating,
      COUNT(*) as total_reviews,
      SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as r1,
      SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as r2,
      SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as r3,
      SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as r4,
      SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as r5
    FROM reviews
    WHERE product_id = ? AND is_approved = true
  `, [productId])

  return {
    average_rating: Number(result?.average_rating || 0),
    total_reviews: Number(result?.total_reviews || 0),
    rating_distribution: {
      1: Number(result?.r1 || 0),
      2: Number(result?.r2 || 0),
      3: Number(result?.r3 || 0),
      4: Number(result?.r4 || 0),
      5: Number(result?.r5 || 0),
    }
  }
}

/**
 * Create a new review
 */
export async function createReview(input: CreateReviewInput): Promise<{ success: boolean; reviewId?: string }> {
  const reviewId = crypto.randomUUID()
  
  // Check if verified purchase
  let isVerifiedPurchase = false
  if (input.order_id && input.customer_id) {
    const order = await tidb.queryOne<{ id: string }>(`
      SELECT id FROM orders 
      WHERE id = ? AND customer_id = ? AND status IN ('delivered', 'completed')
    `, [input.order_id, input.customer_id])
    isVerifiedPurchase = !!order
  }

  await tidb.execute(`
    INSERT INTO reviews (
      id, product_id, customer_id, customer_name, customer_email,
      rating, title, content, images, is_verified_purchase,
      is_approved, helpful_count, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, false, 0, NOW())
  `, [
    reviewId,
    input.product_id,
    input.customer_id || null,
    input.customer_name,
    input.customer_email,
    input.rating,
    input.title || null,
    input.content,
    JSON.stringify(input.images || []),
    isVerifiedPurchase,
  ])

  // Update product rating cache
  await updateProductRating(input.product_id)

  return { success: true, reviewId }
}

/**
 * Mark review as helpful
 */
export async function markReviewHelpful(reviewId: string): Promise<void> {
  await tidb.execute(`
    UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = ?
  `, [reviewId])
}

/**
 * Update product average rating (cache)
 */
async function updateProductRating(productId: string): Promise<void> {
  await tidb.execute(`
    UPDATE products p
    SET 
      average_rating = (
        SELECT COALESCE(AVG(rating), 0) FROM reviews 
        WHERE product_id = ? AND is_approved = true
      ),
      total_reviews = (
        SELECT COUNT(*) FROM reviews 
        WHERE product_id = ? AND is_approved = true
      )
    WHERE p.id = ?
  `, [productId, productId, productId])
}

/**
 * Admin: Approve/reject review
 */
export async function moderateReview(reviewId: string, approved: boolean): Promise<void> {
  await tidb.execute(`
    UPDATE reviews SET is_approved = ? WHERE id = ?
  `, [approved, reviewId])

  // Get product ID to update rating
  const review = await tidb.queryOne<{ product_id: string }>(`
    SELECT product_id FROM reviews WHERE id = ?
  `, [reviewId])
  
  if (review) {
    await updateProductRating(review.product_id)
  }
}
