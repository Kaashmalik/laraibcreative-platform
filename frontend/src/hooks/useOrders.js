/**
 * Custom hook to fetch and manage orders with filters and sorting
 * Provides order data management with status updates and refetching capabilities
 * 
 * @module hooks/useOrders
 * @param {Object} filters - Filter parameters for orders
 * @param {string} filters.status - Filter by order status (pending, processing, completed, cancelled)
 * @param {string} filters.customerId - Filter by customer ID
 * @param {string} filters.dateFrom - Filter orders from date
 * @param {string} filters.dateTo - Filter orders to date
 * @param {string} filters.sortBy - Sort field (createdAt, total, status)
 * @param {string} filters.sortOrder - Sort order (asc/desc)
 * @returns {Object} Orders state and methods
 * 
 * @example
 * import useOrders from '@/hooks/useOrders'
 * 
 * function OrdersList() {
 *   const { orders, isLoading, error, refetch, updateOrderStatus } = useOrders({
 *     status: 'pending',
 *     sortBy: 'createdAt',
 *     sortOrder: 'desc'
 *   })
 *   
 *   if (isLoading) {
 *     return <LoadingSpinner />
 *   }
 *   
 *   if (error) {
 *     return <ErrorMessage message={error} onRetry={refetch} />
 *   }
 *   
 *   const handleStatusUpdate = async (orderId, newStatus) => {
 *     await updateOrderStatus(orderId, newStatus, 'Status updated by admin')
 *   }
 *   
 *   return (
 *     <div>
 *       {orders.map(order => (
 *         <OrderCard 
 *           key={order.id} 
 *           order={order}
 *           onStatusChange={handleStatusUpdate}
 *         />
 *       ))}
 *     </div>
 *   )
 * }
 * 
 * @example
 * // Customer order history
 * function MyOrders() {
 *   const { user } = useAuth()
 *   const { orders, isLoading } = useOrders({
 *     customerId: user.id,
 *     sortBy: 'createdAt',
 *     sortOrder: 'desc'
 *   })
 *   
 *   return (
 *     <div>
 *       <h2>My Orders</h2>
 *       {orders.map(order => (
 *         <OrderHistoryCard key={order.id} order={order} />
 *       ))}
 *     </div>
 *   )
 * }
 * 
 * @example
 * // Admin dashboard with filters
 * function AdminOrderDashboard() {
 *   const [statusFilter, setStatusFilter] = useState('all')
 *   const [dateRange, setDateRange] = useState({ from: null, to: null })
 *   
 *   const { orders, isLoading, updateOrderStatus } = useOrders({
 *     status: statusFilter !== 'all' ? statusFilter : undefined,
 *     dateFrom: dateRange.from,
 *     dateTo: dateRange.to
 *   })
 *   
 *   return (
 *     <div>
 *       <OrderFilters 
 *         onStatusChange={setStatusFilter}
 *         onDateRangeChange={setDateRange}
 *       />
 *       <OrderTable 
 *         orders={orders}
 *         loading={isLoading}
 *         onUpdateStatus={updateOrderStatus}
 *       />
 *     </div>
 *   )
 * }
 * 
 * @example
 * // With real-time updates
 * function OrderTracking({ orderId }) {
 *   const { orders, refetch } = useOrders({ orderId })
 *   const order = orders[0]
 *   
 *   useEffect(() => {
 *     // Poll for updates every 30 seconds
 *     const interval = setInterval(() => {
 *       refetch()
 *     }, 30000)
 *     
 *     return () => clearInterval(interval)
 *   }, [refetch])
 *   
 *   return <OrderTrackingWidget order={order} />
 * }
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import api from '@/lib/api'

function useOrders(filters = {}) {
  // State management
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Use ref to store latest filters without causing re-renders
  const filtersRef = useRef(filters)
  
  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  /**
   * Fetch orders from API
   */
  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await api.orders.getAll(filtersRef.current)
      setOrders(response.orders || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch orders')
      console.error('Error fetching orders:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Update order status
   * @param {string} orderId - Order ID to update
   * @param {string} status - New status (pending, processing, completed, cancelled)
   * @param {string} note - Optional note for status change
   */
  const updateOrderStatus = useCallback(async (orderId, status, note = '') => {
    try {
      await api.orders.updateStatus(orderId, status, note)
      // Refresh orders after successful update
      fetchOrders()
    } catch (err) {
      setError(err.message || 'Failed to update order status')
      console.error('Error updating order status:', err)
      throw err // Re-throw to allow component to handle
    }
  }, [fetchOrders])

  // Fetch orders when filters change
  useEffect(() => {
    fetchOrders()
  }, [fetchOrders, JSON.stringify(filters)])

  return {
    orders,
    isLoading,
    error,
    refetch: fetchOrders,
    updateOrderStatus
  }
}

export default useOrders