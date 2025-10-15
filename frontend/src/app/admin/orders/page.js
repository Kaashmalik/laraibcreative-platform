'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCw, Calendar } from 'lucide-react';
import OrderCard from '@/components/admin/OrderCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

/**
 * Admin Orders Dashboard
 * Main orders management page with filtering, search, and tabs
 * Displays all orders with status-based organization
 */
export default function AdminOrdersPage() {
  // State management for orders and filters
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch orders from API
  useEffect(() => {
    fetchOrders();
  }, [activeTab, filterStatus, filterPayment, dateRange, sortBy]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        tab: activeTab,
        status: filterStatus,
        payment: filterPayment,
        dateRange: dateRange,
        sort: sortBy,
        search: searchQuery
      });

      const response = await fetch(`/api/admin/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Show error toast
    } finally {
      setLoading(false);
    }
  };

  // Search handler with debouncing
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Debounce search - implement useDebounce hook
    setTimeout(() => fetchOrders(), 500);
  };

  // Export orders to CSV
  const handleExport = () => {
    // Generate CSV from filtered orders
    const csv = generateCSV(orders);
    downloadCSV(csv, `orders-${new Date().toISOString()}.csv`);
  };

  // Generate CSV content
  const generateCSV = (data) => {
    const headers = ['Order ID', 'Customer', 'Date', 'Status', 'Payment', 'Total'];
    const rows = data.map(order => [
      order.orderNumber,
      order.customerInfo.name,
      new Date(order.createdAt).toLocaleDateString(),
      order.status,
      order.payment.status,
      `Rs. ${order.pricing.total}`
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  // Download CSV file
  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get order counts by status
  const getOrderCounts = () => {
    return {
      all: orders.length,
      'pending-payment': orders.filter(o => o.payment.status === 'pending').length,
      'in-progress': orders.filter(o => ['payment-verified', 'in-progress', 'quality-check'].includes(o.status)).length,
      completed: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };
  };

  const counts = getOrderCounts();

  // Tab configuration
  const tabs = [
    { id: 'all', label: 'All Orders', count: counts.all, color: 'bg-gray-500' },
    { id: 'pending-payment', label: 'Pending Payment', count: counts['pending-payment'], color: 'bg-orange-500' },
    { id: 'in-progress', label: 'In Progress', count: counts['in-progress'], color: 'bg-blue-500' },
    { id: 'completed', label: 'Completed', count: counts.completed, color: 'bg-green-500' },
    { id: 'cancelled', label: 'Cancelled', count: counts.cancelled, color: 'bg-red-500' }
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
            >
              <RefreshCw className="w-4 h-4" />
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

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by order ID, customer name, phone..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Status Filter */}
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="order-received">Order Received</option>
            <option value="payment-verified">Payment Verified</option>
            <option value="in-progress">In Progress</option>
            <option value="quality-check">Quality Check</option>
            <option value="ready-dispatch">Ready for Dispatch</option>
            <option value="out-delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </Select>

          {/* Payment Filter */}
          <Select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="failed">Failed</option>
          </Select>

          {/* Date Range Filter */}
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </Select>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-600 font-medium">Sort by:</span>
          <div className="flex gap-2">
            {[
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
              { value: 'highest', label: 'Highest Value' },
              { value: 'lowest', label: 'Lowest Value' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${sortBy === option.value
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        // Loading Skeleton
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
        // Empty State
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Filter className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || filterStatus !== 'all' || filterPayment !== 'all'
              ? 'Try adjusting your filters or search terms'
              : 'No orders have been placed yet'
            }
          </p>
          {(searchQuery || filterStatus !== 'all' || filterPayment !== 'all') && (
            <Button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
                setFilterPayment('all');
                setDateRange('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        // Orders Grid
        <div className="space-y-4">
          {orders.map(order => (
            <OrderCard
              key={order._id}
              order={order}
              onUpdate={fetchOrders}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {orders.length > 0 && (
        <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{orders.length}</span> orders
          </p>
          
          {/* Pagination buttons would go here */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}