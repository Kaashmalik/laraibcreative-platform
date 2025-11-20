/**
 * Admin Orders List Page
 * Complete order management with filters, search, and status tabs
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Download, RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import OrderCard from '@/components/admin/orders/OrderCard';
import OrderFilters from '@/components/admin/orders/OrderFilters';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { Order, OrderFilters as OrderFiltersType, OrderListResponse } from '@/types/order-management';

type TabType = 'all' | 'pending-payment' | 'in-progress' | 'completed' | 'cancelled';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [filters, setFilters] = useState<OrderFiltersType>({
    status: 'all',
    paymentStatus: 'all',
    paymentMethod: 'all',
    dateRange: 'all',
    sortBy: 'newest',
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    ordersPerPage: 20,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        ...filters,
        page: pagination.currentPage,
        limit: filters.limit || 20,
      };

      // Apply tab filter
      if (activeTab !== 'all') {
        if (activeTab === 'pending-payment') {
          params.paymentStatus = 'pending';
        } else if (activeTab === 'in-progress') {
          params.status = ['payment-verified', 'material-arranged', 'in-progress', 'quality-check', 'ready-dispatch'];
        } else if (activeTab === 'completed') {
          params.status = 'delivered';
        } else if (activeTab === 'cancelled') {
          params.status = 'cancelled';
        }
      }

      const response = await api.orders.admin.getAll(params);
      const data: OrderListResponse = response as unknown as OrderListResponse;

      setOrders(data.data.orders || []);
      setPagination(data.data.pagination);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [filters, activeTab, pagination.currentPage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: OrderFiltersType) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      paymentStatus: 'all',
      paymentMethod: 'all',
      dateRange: 'all',
      sortBy: 'newest',
      page: 1,
      limit: 20,
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Export orders
  const handleExport = async () => {
    try {
      const blob = await api.orders.admin.export(filters) as Blob;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-export-${new Date().toISOString()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Orders exported successfully');
    } catch (error: any) {
      console.error('Error exporting orders:', error);
      toast.error('Failed to export orders');
    }
  };

  // Get order counts by status
  const getOrderCounts = () => {
    // This would ideally come from the API, but for now we'll calculate from current orders
    return {
      all: pagination.totalOrders,
      'pending-payment': orders.filter(o => o.payment.status === 'pending').length,
      'in-progress': orders.filter(o => 
        ['payment-verified', 'material-arranged', 'in-progress', 'quality-check', 'ready-dispatch'].includes(o.status)
      ).length,
      completed: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };
  };

  const counts = getOrderCounts();

  // Tab configuration
  const tabs: Array<{ id: TabType; label: string; count: number; color: string }> = [
    { id: 'all', label: 'All Orders', count: counts.all, color: 'bg-gray-500' },
    { id: 'pending-payment', label: 'Pending Payment', count: counts['pending-payment'], color: 'bg-orange-500' },
    { id: 'in-progress', label: 'In Progress', count: counts['in-progress'], color: 'bg-blue-500' },
    { id: 'completed', label: 'Completed', count: counts.completed, color: 'bg-green-500' },
    { id: 'cancelled', label: 'Cancelled', count: counts.cancelled, color: 'bg-red-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={fetchOrders}
              className="flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-6 py-3 rounded-lg font-medium text-sm whitespace-nowrap
                transition-all duration-200 flex items-center gap-2
                ${activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }
              `}
            >
              {tab.label}
              <span className={`
                px-2 py-0.5 rounded-full text-xs font-bold
                ${activeTab === tab.id ? 'bg-white text-purple-600' : `${tab.color} text-white`}
              `}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <OrderFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClear={handleClearFilters}
      />

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Filter className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.status !== 'all' || filters.paymentStatus !== 'all'
              ? 'Try adjusting your filters or search terms'
              : 'No orders have been placed yet'
            }
          </p>
          {(filters.search || filters.status !== 'all' || filters.paymentStatus !== 'all') && (
            <Button onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Orders Grid */}
          <div className="space-y-4">
            {orders.map(order => (
              <OrderCard
                key={order._id}
                order={order}
                onUpdate={fetchOrders}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
              <p className="text-sm text-gray-600">
                Showing {((pagination.currentPage - 1) * pagination.ordersPerPage) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.ordersPerPage, pagination.totalOrders)} of{' '}
                {pagination.totalOrders} orders
              </p>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  disabled={!pagination.hasPrevPage || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  disabled={!pagination.hasNextPage || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

