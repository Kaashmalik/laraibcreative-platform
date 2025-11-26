/**
 * Loyalty & Referral System - Phase 7
 * Points, rewards, and referral tracking
 */

import { createClient } from '@/lib/supabase/client'

// Points earning rates
export const POINTS_CONFIG = {
  // Earning
  POINTS_PER_PKR: 1, // 1 point per PKR spent
  REVIEW_POINTS: 50, // Points for leaving a review
  REFERRAL_POINTS: 500, // Points for successful referral
  FIRST_ORDER_BONUS: 200, // Bonus points for first order
  BIRTHDAY_BONUS: 100, // Birthday bonus points
  
  // Redemption
  POINTS_VALUE_PKR: 0.1, // 1 point = 0.1 PKR (100 points = 10 PKR)
  MIN_REDEEM_POINTS: 500, // Minimum points to redeem
  MAX_REDEEM_PERCENT: 50, // Maximum % of order that can be paid with points
  
  // Tiers
  TIERS: {
    BRONZE: { min: 0, multiplier: 1, name: 'Bronze' },
    SILVER: { min: 5000, multiplier: 1.25, name: 'Silver' },
    GOLD: { min: 15000, multiplier: 1.5, name: 'Gold' },
    PLATINUM: { min: 50000, multiplier: 2, name: 'Platinum' },
  }
}

export interface LoyaltyTransaction {
  id: string
  user_id: string
  points: number
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted'
  source: string
  description: string
  order_id?: string
  created_at: string
}

export interface LoyaltyBalance {
  total_points: number
  available_points: number
  pending_points: number
  lifetime_points: number
  tier: keyof typeof POINTS_CONFIG.TIERS
  next_tier_points: number | null
}

/**
 * Get user's loyalty balance
 */
export async function getLoyaltyBalance(userId: string): Promise<LoyaltyBalance> {
  const supabase = createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('loyalty_points, lifetime_points')
    .eq('id', userId)
    .single()

  const availablePoints = profile?.loyalty_points || 0
  const lifetimePoints = profile?.lifetime_points || availablePoints

  // Calculate tier
  const tier = calculateTier(lifetimePoints)
  const nextTierPoints = calculateNextTierPoints(lifetimePoints)

  return {
    total_points: availablePoints,
    available_points: availablePoints,
    pending_points: 0, // Could track points that are pending (e.g., from orders not yet delivered)
    lifetime_points: lifetimePoints,
    tier,
    next_tier_points: nextTierPoints,
  }
}

/**
 * Calculate loyalty tier based on lifetime points
 */
function calculateTier(lifetimePoints: number): keyof typeof POINTS_CONFIG.TIERS {
  const { TIERS } = POINTS_CONFIG
  
  if (lifetimePoints >= TIERS.PLATINUM.min) return 'PLATINUM'
  if (lifetimePoints >= TIERS.GOLD.min) return 'GOLD'
  if (lifetimePoints >= TIERS.SILVER.min) return 'SILVER'
  return 'BRONZE'
}

/**
 * Calculate points needed for next tier
 */
function calculateNextTierPoints(lifetimePoints: number): number | null {
  const { TIERS } = POINTS_CONFIG
  
  if (lifetimePoints < TIERS.SILVER.min) return TIERS.SILVER.min - lifetimePoints
  if (lifetimePoints < TIERS.GOLD.min) return TIERS.GOLD.min - lifetimePoints
  if (lifetimePoints < TIERS.PLATINUM.min) return TIERS.PLATINUM.min - lifetimePoints
  return null // Already at highest tier
}

/**
 * Get loyalty transaction history
 */
export async function getLoyaltyHistory(
  userId: string,
  limit = 20
): Promise<LoyaltyTransaction[]> {
  const supabase = createClient()
  
  const { data } = await supabase
    .from('loyalty_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data || []) as LoyaltyTransaction[]
}

/**
 * Calculate points to award for an order
 */
export function calculateOrderPoints(
  orderTotal: number,
  tier: keyof typeof POINTS_CONFIG.TIERS,
  isFirstOrder: boolean
): number {
  const basePoints = Math.floor(orderTotal * POINTS_CONFIG.POINTS_PER_PKR)
  const multiplier = POINTS_CONFIG.TIERS[tier].multiplier
  let points = Math.floor(basePoints * multiplier)
  
  if (isFirstOrder) {
    points += POINTS_CONFIG.FIRST_ORDER_BONUS
  }
  
  return points
}

/**
 * Calculate redemption value
 */
export function calculateRedemptionValue(points: number): number {
  return points * POINTS_CONFIG.POINTS_VALUE_PKR
}

/**
 * Calculate maximum redeemable points for an order
 */
export function calculateMaxRedeemablePoints(
  orderSubtotal: number,
  availablePoints: number
): { points: number; value: number } {
  const maxByPercent = orderSubtotal * (POINTS_CONFIG.MAX_REDEEM_PERCENT / 100)
  const maxByPoints = calculateRedemptionValue(availablePoints)
  
  const maxValue = Math.min(maxByPercent, maxByPoints)
  const pointsToRedeem = Math.floor(maxValue / POINTS_CONFIG.POINTS_VALUE_PKR)
  
  return {
    points: Math.max(0, pointsToRedeem),
    value: calculateRedemptionValue(pointsToRedeem),
  }
}

/**
 * Redeem points for discount
 */
export async function redeemPoints(
  userId: string,
  points: number,
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  if (points < POINTS_CONFIG.MIN_REDEEM_POINTS) {
    return { success: false, error: `Minimum ${POINTS_CONFIG.MIN_REDEEM_POINTS} points required` }
  }

  const supabase = createClient()
  
  // Get current balance
  const { data: profile } = await supabase
    .from('profiles')
    .select('loyalty_points')
    .eq('id', userId)
    .single()

  if (!profile || profile.loyalty_points < points) {
    return { success: false, error: 'Insufficient points' }
  }

  // Deduct points
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ loyalty_points: profile.loyalty_points - points })
    .eq('id', userId)

  if (updateError) {
    return { success: false, error: 'Failed to redeem points' }
  }

  // Record transaction
  await supabase.from('loyalty_transactions').insert({
    user_id: userId,
    points: -points,
    type: 'redeemed',
    source: 'order',
    description: `Redeemed for order discount`,
    order_id: orderId,
  })

  return { success: true }
}

// ==========================================
// REFERRAL SYSTEM
// ==========================================

export interface ReferralStats {
  referral_code: string
  total_referrals: number
  successful_referrals: number
  pending_referrals: number
  points_earned: number
}

/**
 * Get user's referral stats
 */
export async function getReferralStats(userId: string): Promise<ReferralStats | null> {
  const supabase = createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', userId)
    .single()

  if (!profile?.referral_code) return null

  const { data: referrals } = await supabase
    .from('referrals')
    .select('status, points_awarded')
    .eq('referrer_id', userId)

  const stats = (referrals || []).reduce(
    (acc, ref) => {
      acc.total_referrals++
      if (ref.status === 'completed') {
        acc.successful_referrals++
        acc.points_earned += ref.points_awarded || 0
      } else if (ref.status === 'pending') {
        acc.pending_referrals++
      }
      return acc
    },
    { total_referrals: 0, successful_referrals: 0, pending_referrals: 0, points_earned: 0 }
  )

  return {
    referral_code: profile.referral_code,
    ...stats,
  }
}

/**
 * Generate referral link
 */
export function generateReferralLink(referralCode: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://laraibcreative.com'
  return `${baseUrl}/ref/${referralCode}`
}

/**
 * Generate unique referral code
 */
export function generateReferralCode(name: string): string {
  const prefix = name.substring(0, 3).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}${random}`
}
