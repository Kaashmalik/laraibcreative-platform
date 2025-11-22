/**
 * Price Calculator Router
 * Real-time price calculation procedures
 */

import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

const fabricSchema = z.object({
  providedBy: z.enum(['customer', 'laraibcreative']),
  type: z.string().optional(),
  color: z.string().optional(),
  quality: z.string().optional(),
  metersRequired: z.number().optional(),
  fabricId: z.string().optional(),
});

const embroiderySchema = z.object({
  type: z.enum(['zardozi', 'aari', 'sequins', 'beads', 'thread', 'mixed', 'none']),
  complexity: z.enum(['simple', 'moderate', 'intricate', 'heavy']),
  coverage: z.enum(['minimal', 'partial', 'full', 'heavy']),
});

const addOnSchema = z.object({
  name: z.string(),
  price: z.number().min(0),
  description: z.string().optional(),
});

const calculatePriceSchema = z.object({
  serviceType: z.enum(['fully-custom', 'brand-article-copy']),
  fabric: fabricSchema.optional(),
  embroidery: embroiderySchema.optional(),
  addOns: z.array(addOnSchema).default([]),
  rushOrder: z.boolean().default(false),
});

export const priceCalculatorRouter = router({
  /**
   * Calculate custom order price
   */
  calculate: publicProcedure
    .input(calculatePriceSchema)
    .mutation(async ({ input }) => {
      // TODO: Call price calculator service
      // For now, return mock data
      return {
        basePrice: 2000,
        fabricCost: 0,
        embroideryCost: 0,
        addOnsCost: 0,
        rushOrderFee: 0,
        subtotal: 2000,
        tax: 0,
        total: 2000,
        currency: 'PKR',
      };
    }),

  /**
   * Get pricing rules
   */
  getRules: publicProcedure.query(async () => {
    // TODO: Fetch from Settings
    return {
      basePrice: {
        fullyCustom: 2000,
        brandArticle: 2500,
      },
      fabric: {
        standard: 1500,
        premium: 2500,
        luxury: 4000,
      },
      embroidery: {},
      rushOrderFee: 1000,
    };
  }),
});

