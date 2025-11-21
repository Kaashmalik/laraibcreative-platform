/**
 * Price Calculation Utilities for Custom Orders
 * Production-ready price calculation logic
 * 
 * @module lib/utils/price-calculation
 */

import type { CustomOrderFormData, PriceBreakdown } from '@/types/custom-order';

/**
 * Base stitching charge (PKR)
 */
const BASE_STITCHING_CHARGE = 2500;

/**
 * Rush order fee (PKR)
 */
const RUSH_ORDER_FEE = 1000;

/**
 * Complex design surcharge (PKR)
 */
const COMPLEX_DESIGN_SURCHARGE = 500;

/**
 * Tax rate (5%)
 */
const TAX_RATE = 0.05;

/**
 * Calculate price breakdown for custom order
 */
export function calculatePriceBreakdown(formData: CustomOrderFormData): PriceBreakdown {
  const baseStitching = BASE_STITCHING_CHARGE;
  let fabricCost = 0;
  let rushOrderFee = 0;
  let complexDesignSurcharge = 0;

  // Fabric cost (if provided by LC)
  if (formData.fabricSource === 'lc-provides' && formData.selectedFabric) {
    fabricCost = formData.selectedFabric.price || 0;
  }

  // Rush order fee
  if (formData.rushOrder) {
    rushOrderFee = RUSH_ORDER_FEE;
  }

  // Complex design surcharge (for fully custom with detailed description)
  if (
    formData.serviceType === 'fully-custom' &&
    formData.designIdea &&
    formData.designIdea.length > 200
  ) {
    complexDesignSurcharge = COMPLEX_DESIGN_SURCHARGE;
  }

  // Calculate subtotal
  const subtotal = baseStitching + fabricCost + rushOrderFee + complexDesignSurcharge;

  // Calculate tax
  const tax = subtotal * TAX_RATE;

  // Calculate total
  const total = subtotal + tax;

  return {
    baseStitching,
    fabricCost,
    rushOrderFee,
    complexDesignSurcharge,
    subtotal,
    tax,
    total: Math.round(total),
  };
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Get estimated delivery days
 */
export function getEstimatedDeliveryDays(formData: CustomOrderFormData): number {
  if (formData.rushOrder) {
    return 7; // Rush order: 7-10 days
  }
  return 15; // Regular order: 15-20 days
}

export default {
  calculatePriceBreakdown,
  formatPrice,
  getEstimatedDeliveryDays,
  BASE_STITCHING_CHARGE,
  RUSH_ORDER_FEE,
  COMPLEX_DESIGN_SURCHARGE,
  TAX_RATE,
};

