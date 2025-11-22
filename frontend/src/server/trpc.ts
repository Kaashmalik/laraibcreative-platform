/**
 * tRPC Server Setup
 * Creates the tRPC router and context
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import superjson from 'superjson';

/**
 * Context interface
 * Extend this with your context data
 */
export interface Context {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  req?: Request;
  res?: Response;
}

/**
 * Initialize tRPC
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof z.ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});

/**
 * Base router and procedure exports
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure
 * Requires authentication
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Type-safe user in context
    },
  });
});

/**
 * Admin procedure
 * Requires admin role
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== 'admin' && ctx.user.role !== 'super-admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }
  return next();
});

