/**
 * Auth Router
 * Authentication and authorization procedures
 * Migrated from Express routes
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';

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

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export const authRouter = router({
  /**
   * Get current user
   */
  me: protectedProcedure.query(async ({ ctx }: { ctx: any }) => {
    try {
      // Call existing Express API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.req?.headers.get('cookie') || '',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Failed to fetch user',
        });
      }

      const data = await response.json();
      return data.data?.user || data.user;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch user';
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: message || 'Failed to fetch user',
      });
    }
  }),

  /**
   * Login
   */
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(input),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: data.message || 'Login failed',
          });
        }

        return {
          success: true,
          user: data.data?.user || data.user,
          token: data.data?.tokens?.accessToken || data.token,
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: message || 'Login failed',
        });
      }
    }),

  /**
   * Register
   */
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(input),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new TRPCError({
            code: response.status === 409 ? 'CONFLICT' : 'BAD_REQUEST',
            message: data.message || 'Registration failed',
            cause: data,
          });
        }

        return {
          success: true,
          user: data.data?.user || data.user,
          token: data.data?.tokens?.accessToken || data.token,
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: message || 'Registration failed',
        });
      }
    }),

  /**
   * Logout
   */
  logout: protectedProcedure.mutation(async ({ ctx }: { ctx: any }) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.req?.headers.get('cookie') || '',
        },
        credentials: 'include',
      });

      return { success: true };
    } catch (error: unknown) {
      // Logout should succeed even if backend fails
      return { success: true };
    }
  }),

  /**
   * Request password reset
   */
  requestPasswordReset: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/auth/forgot-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(input),
        });

        const data = await response.json();
        return { success: data.success || false, message: data.message };
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: message || 'Failed to request password reset',
        });
      }
    }),

  /**
   * Verify email
   */
  verifyEmail: publicProcedure
    .input(verifyEmailSchema)
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/auth/verify-email/${input.token}`, {
          method: 'GET',
        });

        const data = await response.json();
        return { success: data.success || false, message: data.message };
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: message || 'Email verification failed',
        });
      }
    }),
});
