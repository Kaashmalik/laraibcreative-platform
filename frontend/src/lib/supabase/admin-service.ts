/**
 * Admin Service - Supabase CRUD Operations
 */

import { createClient } from './client'

// Helper to get supabase client with any type to avoid complex generics
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getClient = () => createClient() as any

// Generic CRUD Service Factory
export function createCrudService(tableName: string) {
  return {
    async getAll(options?: {
      page?: number
      limit?: number
      orderBy?: { column: string; ascending?: boolean }
      filters?: Record<string, unknown>
      search?: { column: string; query: string }
    }) {
      const supabase = getClient()
      const page = options?.page || 1
      const limit = options?.limit || 20
      const offset = (page - 1) * limit

      let query = supabase
        .from(tableName)
        .select('*', { count: 'exact' })

      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            query = query.eq(key, value)
          }
        })
      }

      if (options?.search?.query) {
        query = query.ilike(options.search.column, `%${options.search.query}%`)
      }

      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? false,
        })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      }
    },

    async getById(id: string) {
      const supabase = getClient()
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },

    async create(data: Record<string, unknown>) {
      const supabase = getClient()
      const { data: created, error } = await supabase
        .from(tableName)
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return created
    },

    async update(id: string, data: Record<string, unknown>) {
      const supabase = getClient()
      const { data: updated, error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return updated
    },

    async delete(id: string) {
      const supabase = getClient()
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    },

    async bulkDelete(ids: string[]) {
      const supabase = getClient()
      const { error } = await supabase
        .from(tableName)
        .delete()
        .in('id', ids)

      if (error) throw error
      return true
    },
  }
}

// Specialized Services
export const productsService = {
  ...createCrudService('products'),

  async softDelete(id: string) {
    const supabase = getClient()
    const { error } = await supabase
      .from('products')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
    return true
  },

  async toggleFeatured(id: string, isFeatured: boolean) {
    const supabase = getClient()
    const { data, error } = await supabase
      .from('products')
      .update({ is_featured: isFeatured })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

export const ordersService = {
  ...createCrudService('orders'),

  async updateStatus(orderId: string, status: string, note?: string, updatedBy?: string) {
    const supabase = getClient()
    
    await supabase.from('orders').update({ status }).eq('id', orderId)
    
    await supabase.from('order_status_history').insert({
      order_id: orderId,
      status,
      note,
      updated_by: updatedBy,
    })

    return true
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getOrderStats(): Promise<any> {
    const supabase = getClient()
    const { data } = await supabase.from('orders').select('status, pricing').eq('is_deleted', false)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orders = data as any[] || []
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending-payment').length,
      processing: orders.filter(o => ['payment-verified', 'in-progress'].includes(o.status)).length,
      completed: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      totalRevenue: orders.filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + (o.pricing?.total || 0), 0),
    }
  },
}

export const customersService = {
  ...createCrudService('profiles'),

  async updateRole(userId: string, role: 'customer' | 'admin' | 'super-admin') {
    const supabase = getClient()
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async toggleActive(userId: string, isActive: boolean) {
    const supabase = getClient()
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

export const dashboardService = {
  async getStats() {
    const supabase = getClient()
    
    const [products, orders, customers, pending] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending-payment'),
    ])

    const { data: deliveredOrders } = await supabase
      .from('orders')
      .select('pricing')
      .eq('status', 'delivered')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delivered = deliveredOrders as any[] || []
    return {
      totalProducts: products.count || 0,
      totalOrders: orders.count || 0,
      totalCustomers: customers.count || 0,
      pendingOrders: pending.count || 0,
      totalRevenue: delivered.reduce((sum, o) => sum + (o.pricing?.total || 0), 0),
    }
  },

  async getRecentOrders(limit = 5) {
    const supabase = getClient()
    const { data } = await supabase
      .from('orders')
      .select('id, order_number, status, pricing, created_at, customer:profiles(full_name, email)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit)

    return data
  },
}
