/**
 * Product Router
 * Product-related procedures
 * Migrated from Express routes
 */

import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

const productFilterSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(12),
  sortBy: z.string().optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  fabric: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  occasion: z.string().optional(),
  color: z.string().optional(),
  availability: z.string().optional(),
  featured: z.boolean().optional(),
  type: z.string().optional(),
});

export const productRouter = router({
  /**
   * Get all products with filters
   */
  getAll: publicProcedure
    .input(productFilterSchema)
    .query(async ({ input }) => {
      try {
        const params = new URLSearchParams();
        params.append('page', input.page.toString());
        params.append('limit', input.limit.toString());
        if (input.sortBy) params.append('sortBy', input.sortBy);
        if (input.search) params.append('search', input.search);
        if (input.category) params.append('category', input.category);
        if (input.subcategory) params.append('subcategory', input.subcategory);
        if (input.fabric) params.append('fabric', input.fabric);
        if (input.minPrice) params.append('minPrice', input.minPrice.toString());
        if (input.maxPrice) params.append('maxPrice', input.maxPrice.toString());
        if (input.occasion) params.append('occasion', input.occasion);
        if (input.color) params.append('color', input.color);
        if (input.availability) params.append('availability', input.availability);
        if (input.featured !== undefined) params.append('featured', input.featured.toString());
        if (input.type) params.append('type', input.type);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/products?${params.toString()}`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch products',
          });
        }

        const data = await response.json();
        return {
          products: data.data?.products || data.products || [],
          total: data.data?.total || data.total || 0,
          page: input.page,
          limit: input.limit,
          pages: data.data?.pages || Math.ceil((data.data?.total || 0) / input.limit),
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch products',
        });
      }
    }),

  /**
   * Get product by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/products/${input.id}`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Product not found',
            });
          }
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch product',
          });
        }

        const data = await response.json();
        return data.data?.product || data.product || null;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch product',
        });
      }
    }),

  /**
   * Get product by slug
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/products/slug/${input.slug}`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Product not found',
            });
          }
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch product',
          });
        }

        const data = await response.json();
        return data.data?.product || data.product || null;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch product',
        });
      }
    }),

  /**
   * Get featured products
   */
  getFeatured: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(8) }))
    .query(async ({ input }) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/products?featured=true&limit=${input.limit}`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch featured products',
          });
        }

        const data = await response.json();
        return data.data?.products || data.products || [];
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch featured products',
        });
      }
    }),

  /**
   * Get related products
   */
  getRelated: publicProcedure
    .input(z.object({ productId: z.string(), limit: z.number().min(1).max(20).default(4) }))
    .query(async ({ input }) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/products/${input.productId}/related?limit=${input.limit}`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          return []; // Return empty array if related products not found
        }

        const data = await response.json();
        return data.data?.products || data.products || [];
      } catch (error) {
        return []; // Return empty array on error
      }
    }),
});
