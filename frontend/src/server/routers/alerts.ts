/**
 * Alerts Router
 * Alert system procedures
 */

import { router, adminProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const alertsRouter = router({
  /**
   * Run all alert checks
   */
  checkAll: adminProcedure.mutation(async ({ ctx }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/alerts/check`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Cookie': ctx.req?.headers.get('cookie') || '',
          },
        }
      );

      const data = await response.json();
      return data.data || {};
    } catch (error: any) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to run alert checks',
      });
    }
  }),

  /**
   * Check failed payments
   */
  checkPayments: adminProcedure.query(async ({ ctx }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/alerts/payments`,
        {
          credentials: 'include',
          headers: {
            'Cookie': ctx.req?.headers.get('cookie') || '',
          },
        }
      );

      const data = await response.json();
      return data.data || {};
    } catch (error: any) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to check payments',
      });
    }
  }),

  /**
   * Check stockouts
   */
  checkStockouts: adminProcedure.query(async ({ ctx }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/alerts/stockouts`,
        {
          credentials: 'include',
          headers: {
            'Cookie': ctx.req?.headers.get('cookie') || '',
          },
        }
      );

      const data = await response.json();
      return data.data || {};
    } catch (error: any) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to check stockouts',
      });
    }
  }),

  /**
   * Check abandonment
   */
  checkAbandonment: adminProcedure.query(async ({ ctx }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/alerts/abandonment`,
        {
          credentials: 'include',
          headers: {
            'Cookie': ctx.req?.headers.get('cookie') || '',
          },
        }
      );

      const data = await response.json();
      return data.data || {};
    } catch (error: any) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to check abandonment',
      });
    }
  }),
});

