/**
 * Loyalty Router
 * Loyalty points system procedures
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const loyaltyRouter = router({
  /**
   * Get loyalty account
   */
  getAccount: protectedProcedure.query(async ({ ctx }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/loyalty/account`,
        {
          credentials: 'include',
          headers: {
            'Cookie': ctx.req?.headers.get('cookie') || '',
          },
        }
      );

      const data = await response.json();
      return data.data?.account || null;
    } catch (error: any) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to get loyalty account',
      });
    }
  }),

  /**
   * Get transactions
   */
  getTransactions: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
        type: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const params = new URLSearchParams();
        params.append('page', input.page.toString());
        params.append('limit', input.limit.toString());
        if (input.type) params.append('type', input.type);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/loyalty/transactions?${params.toString()}`,
          {
            credentials: 'include',
            headers: {
              'Cookie': ctx.req?.headers.get('cookie') || '',
            },
          }
        );

        const data = await response.json();
        return data.data || {
          transactions: [],
          pagination: {},
        };
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to get transactions',
        });
      }
    }),

  /**
   * Redeem points
   */
  redeemPoints: protectedProcedure
    .input(z.object({ points: z.number().min(1) }))
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/loyalty/redeem`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': ctx.req?.headers.get('cookie') || '',
            },
            credentials: 'include',
            body: JSON.stringify({ points: input.points }),
          }
        );

        const data = await response.json();
        if (!data.success) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: data.message || 'Failed to redeem points',
          });
        }

        return data;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to redeem points',
        });
      }
    }),
});

