/**
 * Referral Router
 * Referral system procedures
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const referralRouter = router({
  /**
   * Get or generate referral code
   */
  getCode: protectedProcedure.query(async ({ ctx }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/referrals/code`,
        {
          credentials: 'include',
          headers: {
            'Cookie': ctx.req?.headers.get('cookie') || '',
          },
        }
      );

      const data = await response.json();
      if (!data.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: data.message || 'Failed to get referral code',
        });
      }

      return data.data;
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to get referral code',
      });
    }
  }),

  /**
   * Get referral statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/referrals/stats`,
        {
          credentials: 'include',
          headers: {
            'Cookie': ctx.req?.headers.get('cookie') || '',
          },
        }
      );

      const data = await response.json();
      return data.data || {
        totalReferrals: 0,
        completedReferrals: 0,
        pendingReferrals: 0,
        totalEarned: 0,
        referrals: [],
      };
    } catch (error: any) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to get referral stats',
      });
    }
  }),

  /**
   * Apply referral code
   */
  applyCode: protectedProcedure
    .input(z.object({ code: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/referrals/apply`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': ctx.req?.headers.get('cookie') || '',
            },
            credentials: 'include',
            body: JSON.stringify({ code: input.code }),
          }
        );

        const data = await response.json();
        if (!data.success) {
          throw new TRPCError({
            code: data.message?.includes('Invalid') ? 'NOT_FOUND' : 'BAD_REQUEST',
            message: data.message || 'Failed to apply referral code',
          });
        }

        return data;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to apply referral code',
        });
      }
    }),
});

