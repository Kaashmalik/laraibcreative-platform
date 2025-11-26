/**
 * Reviews API Route - Phase 7
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createReview, type CreateReviewInput } from '@/lib/tidb/reviews'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const body: CreateReviewInput = await request.json()
    
    // Validate required fields
    if (!body.product_id || !body.rating || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Validate rating
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }
    
    // Validate content length
    if (body.content.length < 10 || body.content.length > 1000) {
      return NextResponse.json(
        { error: 'Review must be between 10 and 1000 characters' },
        { status: 400 }
      )
    }

    // Set customer info
    const reviewData: CreateReviewInput = {
      ...body,
      customer_id: user?.id,
      customer_email: user?.email || body.customer_email,
    }

    const result = await createReview(reviewData)

    if (result.success) {
      // Award loyalty points if user is logged in
      if (user?.id) {
        try {
          // @ts-expect-error - Types available after migration
          await supabase.from('loyalty_transactions').insert({
            user_id: user.id,
            points: 50,
            type: 'bonus',
            source: 'review',
            description: 'Points for submitting a review (pending approval)',
          })
        } catch (e) {
          console.error('Failed to award review points:', e)
        }
      }

      return NextResponse.json({ 
        success: true, 
        reviewId: result.reviewId,
        message: 'Review submitted successfully. It will be visible after moderation.'
      })
    }

    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Review API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
