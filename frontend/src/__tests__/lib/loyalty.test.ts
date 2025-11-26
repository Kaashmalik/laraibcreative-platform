/**
 * Loyalty System Tests - Phase 8
 */

import {
  POINTS_CONFIG,
  calculateOrderPoints,
  calculateRedemptionValue,
  calculateMaxRedeemablePoints,
} from '@/lib/loyalty'

describe('Loyalty System', () => {
  describe('calculateOrderPoints', () => {
    it('should calculate base points correctly', () => {
      const points = calculateOrderPoints(10000, 'BRONZE', false)
      // 10000 * 1 (POINTS_PER_PKR) * 1 (BRONZE multiplier) = 10000
      expect(points).toBe(10000)
    })

    it('should apply tier multiplier for SILVER', () => {
      const points = calculateOrderPoints(10000, 'SILVER', false)
      // 10000 * 1.25 = 12500
      expect(points).toBe(12500)
    })

    it('should apply tier multiplier for GOLD', () => {
      const points = calculateOrderPoints(10000, 'GOLD', false)
      // 10000 * 1.5 = 15000
      expect(points).toBe(15000)
    })

    it('should apply tier multiplier for PLATINUM', () => {
      const points = calculateOrderPoints(10000, 'PLATINUM', false)
      // 10000 * 2 = 20000
      expect(points).toBe(20000)
    })

    it('should add first order bonus', () => {
      const points = calculateOrderPoints(10000, 'BRONZE', true)
      // 10000 + 200 (first order bonus) = 10200
      expect(points).toBe(10200)
    })

    it('should apply both tier multiplier and first order bonus', () => {
      const points = calculateOrderPoints(10000, 'GOLD', true)
      // (10000 * 1.5) + 200 = 15200
      expect(points).toBe(15200)
    })
  })

  describe('calculateRedemptionValue', () => {
    it('should calculate redemption value correctly', () => {
      // 1000 points * 0.1 = 100 PKR
      expect(calculateRedemptionValue(1000)).toBe(100)
    })

    it('should return 0 for 0 points', () => {
      expect(calculateRedemptionValue(0)).toBe(0)
    })

    it('should handle large point values', () => {
      // 50000 points * 0.1 = 5000 PKR
      expect(calculateRedemptionValue(50000)).toBe(5000)
    })
  })

  describe('calculateMaxRedeemablePoints', () => {
    it('should respect max redemption percentage', () => {
      const result = calculateMaxRedeemablePoints(10000, 10000)
      
      // Max 50% of order = 5000 PKR
      // 5000 / 0.1 = 50000 points
      // But user only has 10000 points = 1000 PKR
      // So limited by available points
      expect(result.points).toBe(10000)
      expect(result.value).toBe(1000)
    })

    it('should limit by available points', () => {
      const result = calculateMaxRedeemablePoints(10000, 1000)
      
      // User has 1000 points = 100 PKR
      // Max 50% = 5000 PKR
      // Limited by available points
      expect(result.points).toBe(1000)
      expect(result.value).toBe(100)
    })

    it('should limit by order percentage', () => {
      const result = calculateMaxRedeemablePoints(2000, 100000)
      
      // Order is 2000, max 50% = 1000 PKR
      // 1000 / 0.1 = 10000 points
      // User has 100000 points (10000 PKR worth)
      // Limited by order percentage
      expect(result.value).toBeLessThanOrEqual(1000)
    })

    it('should return 0 for 0 available points', () => {
      const result = calculateMaxRedeemablePoints(10000, 0)
      expect(result.points).toBe(0)
      expect(result.value).toBe(0)
    })
  })

  describe('POINTS_CONFIG', () => {
    it('should have correct tier thresholds', () => {
      expect(POINTS_CONFIG.TIERS.BRONZE.min).toBe(0)
      expect(POINTS_CONFIG.TIERS.SILVER.min).toBe(5000)
      expect(POINTS_CONFIG.TIERS.GOLD.min).toBe(15000)
      expect(POINTS_CONFIG.TIERS.PLATINUM.min).toBe(50000)
    })

    it('should have increasing multipliers', () => {
      expect(POINTS_CONFIG.TIERS.BRONZE.multiplier).toBe(1)
      expect(POINTS_CONFIG.TIERS.SILVER.multiplier).toBeGreaterThan(POINTS_CONFIG.TIERS.BRONZE.multiplier)
      expect(POINTS_CONFIG.TIERS.GOLD.multiplier).toBeGreaterThan(POINTS_CONFIG.TIERS.SILVER.multiplier)
      expect(POINTS_CONFIG.TIERS.PLATINUM.multiplier).toBeGreaterThan(POINTS_CONFIG.TIERS.GOLD.multiplier)
    })

    it('should have minimum redemption threshold', () => {
      expect(POINTS_CONFIG.MIN_REDEEM_POINTS).toBe(500)
    })
  })
})
