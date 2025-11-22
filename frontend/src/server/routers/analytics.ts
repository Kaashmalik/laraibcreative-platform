/**
 * Analytics Router
 * Business metrics procedures
 */

import { z } from 'zod';
import { router, adminProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const analyticsRouter = router({
  /**
   * Get comprehensive dashboard data
   */
  getDashboard: adminProcedure
    .input(
      z.object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const params = new URLSearchParams();
        if (input.dateFrom) params.append('dateFrom', input.dateFrom);
        if (input.dateTo) params.append('dateTo', input.dateTo);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/analytics/dashboard?${params.toString()}`,
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
          message: error.message || 'Failed to fetch dashboard data',
        });
      }
    }),

  /**
   * Get revenue metrics
   */
  getRevenue: adminProcedure
    .input(
      z.object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const params = new URLSearchParams();
        if (input.dateFrom) params.append('dateFrom', input.dateFrom);
        if (input.dateTo) params.append('dateTo', input.dateTo);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/analytics/revenue?${params.toString()}`,
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
          message: error.message || 'Failed to fetch revenue metrics',
        });
      }
    }),
});

