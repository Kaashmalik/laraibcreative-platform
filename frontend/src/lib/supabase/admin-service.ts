/**
 * Admin Service - Supabase CRUD Operations
 */

import { createClient } from './client'
import type { Database } from '@/types/supabase'

type Tables = Database['public']['Tables']

// Generic CRUD Service Factory
export function createCrudService<T extends keyof Tables>(tableName: T) {
  const supabase = createClient()
  
  type Row = Tables[T]['Row']
  type Insert = Tables[T]['Insert']
  type Update = Tables[T]['Update']

  return {
    async getAll(options?: {
      page?: number
      limit?: number
      orderBy?: { column: string; ascending?: boolean }
      filters?: Record<string, unknown>
      search?: { column: string; query: string }
    }) {
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
        data: data as Row[],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      }
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Row
    },

    async create(data: Insert) {
      const { data: created, error } = await supabase
        .from(tableName)
        .insert(data as never)
        .select()
        .single()

      if (error) throw error
      return created as Row
    },

    async update(id: string, data: Update) {
      const { data: updated, error } = await supabase
        .from(tableName)
        .update(data as never)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return updated as Row
    },

    async delete(id: string) {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    },

    async bulkDelete(ids: string[]) {
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
    const supabase = createClient()
    const { error } = await supabase
      .from('products')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
    return true
  },

  async toggleFeatured(id: string, isFeatured: boolean) {
    const supabase = createClient()
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
    const supabase = createClient()
    
    await supabase.from('orders').update({ status }).eq('id', orderId)
    
    await supabase.from('order_status_history').insert({
      order_id: orderId,
      status,
      note,
      updated_by: updatedBy,
    })

    return true
  },

  async getOrderStats() {
    const supabase = createClient()
    const { data } = await supabase.from('orders').select('status, pricing').eq('is_deleted', false)

    return {
      total: data?.length || 0,
      pending: data?.filter(o => o.status === 'pending-payment').length || 0,
      processing: data?.filter(o => ['payment-verified', 'in-progress'].includes(o.status)).length || 0,
      completed: data?.filter(o => o.status === 'delivered').length || 0,
      cancelled: data?.filter(o => o.status === 'cancelled').length || 0,
      totalRevenue: data?.filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + ((o.pricing as { total?: number })?.total || 0), 0) || 0,
    }
  },
}

export const customersService = {
  ...createCrudService('profiles'),

  async updateRole(userId: string, role: 'customer' | 'admin' | 'super-admin') {
    const supabase = createClient()
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
    const supabase = createClient()
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
    const supabase = createClient()
    
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

    return {
      totalProducts: products.count || 0,
      totalOrders: orders.count || 0,
      totalCustomers: customers.count || 0,
      pendingOrders: pending.count || 0,
      totalRevenue: deliveredOrders?.reduce(
        (sum, o) => sum + ((o.pricing as { total?: number })?.total || 0), 0
      ) || 0,
    }
  },

  async getRecentOrders(limit = 5) {
    const supabase = createClient()
    const { data } = await supabase
      .from('orders')
      .select('id, order_number, status, pricing, created_at, customer:profiles(full_name, email)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit)

    return data
  },
}
