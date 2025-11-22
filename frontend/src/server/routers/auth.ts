/**
 * Auth Router
 * Authentication and authorization procedures
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

// Zod schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().regex(/^(\+92[0-9]{10}|0[0-9]{10}|[0-9]{10})$/, 'Invalid phone number'),
  whatsapp: z.string().optional(),
});

export const authRouter = router({
  /**
   * Get current user
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Fetch user from database
    return {
      id: ctx.user.id,
      email: ctx.user.email,
      role: ctx.user.role,
    };
  }),

  /**
   * Login
   */
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input }) => {
      // TODO: Implement login logic
      // Call existing auth controller or service
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Login not yet migrated to tRPC',
      });
    }),

  /**
   * Register
   */
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input }) => {
      // TODO: Implement registration logic
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Registration not yet migrated to tRPC',
      });
    }),

  /**
   * Logout
   */
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    // TODO: Implement logout logic
    return { success: true };
  }),
});

