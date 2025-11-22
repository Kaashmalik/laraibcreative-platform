/**
 * Production Queue Router
 * Production workflow management procedures
 */

import { z } from 'zod';
import { router, adminProcedure } from '../trpc';

const queueFilterSchema = z.object({
  status: z.string().optional(),
  tailorId: z.string().optional(),
  priority: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50),
  sortBy: z.string().optional(),
});

const updateStatusSchema = z.object({
  id: z.string(),
  status: z.string(),
  notes: z.string().optional(),
});

const assignTailorSchema = z.object({
  id: z.string(),
  tailorId: z.string(),
  estimatedCompletion: z.string().optional(),
  notes: z.string().optional(),
});

const bulkActionSchema = z.object({
  ids: z.array(z.string()),
  status: z.string().optional(),
  notes: z.string().optional(),
  message: z.string().optional(),
});

export const productionQueueRouter = router({
  /**
   * Get all queue items
   */
  getAll: adminProcedure
    .input(queueFilterSchema)
    .query(async ({ input }) => {
      // TODO: Call Express API or implement directly
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/production-queue?${new URLSearchParams({
          ...(input.status && { status: input.status }),
          ...(input.tailorId && { tailorId: input.tailorId }),
          ...(input.priority && { priority: input.priority }),
          page: input.page.toString(),
          limit: input.limit.toString(),
          ...(input.sortBy && { sortBy: input.sortBy }),
        })}`,
        {
          credentials: 'include',
        }
      );

      const data = await response.json();
      return data.data || { items: [], pagination: {} };
    }),

  /**
   * Get single queue item
   */
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/production-queue/${input.id}`,
        {
          credentials: 'include',
        }
      );

      const data = await response.json();
      return data.data?.item || null;
    }),

  /**
   * Update status
   */
  updateStatus: adminProcedure
    .input(updateStatusSchema)
    .mutation(async ({ input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/production-queue/${input.id}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            status: input.status,
            notes: input.notes,
          }),
        }
      );

      const data = await response.json();
      return data;
    }),

  /**
   * Assign to tailor
   */
  assignTailor: adminProcedure
    .input(assignTailorSchema)
    .mutation(async ({ input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/production-queue/${input.id}/assign`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            tailorId: input.tailorId,
            estimatedCompletion: input.estimatedCompletion,
            notes: input.notes,
          }),
        }
      );

      const data = await response.json();
      return data;
    }),

  /**
   * Bulk update status
   */
  bulkUpdateStatus: adminProcedure
    .input(bulkActionSchema)
    .mutation(async ({ input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/production-queue/bulk/status`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            ids: input.ids,
            status: input.status,
            notes: input.notes,
          }),
        }
      );

      const data = await response.json();
      return data;
    }),

  /**
   * Generate cutting sheets
   */
  generateCuttingSheets: adminProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/production-queue/bulk/cutting-sheets`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ids: input.ids }),
        }
      );

      const data = await response.json();
      return data;
    }),

  /**
   * Send WhatsApp blast
   */
  sendWhatsAppBlast: adminProcedure
    .input(z.object({ ids: z.array(z.string()), message: z.string() }))
    .mutation(async ({ input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/production-queue/bulk/whatsapp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(input),
        }
      );

      const data = await response.json();
      return data;
    }),
});

