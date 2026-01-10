/**
 * tRPC Configuration
 * Sets up tRPC for type-safe API calls
 */

import { initTRPC, TRPCError } from '@trpc/server';
import type { NextRequest } from 'next/server';

/**
 * Create context for tRPC procedures
 */
export const createContext = async (req?: NextRequest) => {
  return {
    req,
  };
};

type Context = Awaited<ReturnType<typeof createContext>>;

/**
 * Initialize tRPC
 */
const t = initTRPC.context<Context>().create();

/**
 * Public procedure - accessible without authentication
 */
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  // Check if user is authenticated
  const token = ctx.req?.headers.get('cookie')?.match(/accessToken=([^;]+)/)?.[1];
  
  if (!token) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: { id: 'authenticated' }, // Simplified - in production, decode JWT
    },
  });
});

/**
 * Export router creator
 */
export const router = t.router;

/**
 * Export tRPC instance
 */
export { t };

/**
 * Export TRPCError for use in procedures
 */
export { TRPCError };
