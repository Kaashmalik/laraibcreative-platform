/**
 * Admin Dashboard Page
 * 
 * Main dashboard displaying comprehensive analytics and quick actions:
 * - Animated stats cards (Revenue, Orders, Customers)
 * - Revenue trend chart (last 30 days)
 * - Orders by category pie chart
 * - Popular products bar chart
 * - Recent orders table
 * - Quick action buttons
 * - Date range filter
 * - Export reports functionality
 * 
 * Features:
 * - Real-time data updates
 * - Interactive charts (recharts)
 * - Responsive grid layout
 * - Loading states
 * - Empty states
 * - Error handling
 */

'use client';

import { useState, useEffect } from 'react';
import StatsCard from '@/components/admin/StatsCard';
import RevenueChart from '@/components/admin/RevenueChart';
import OrdersPieChart from '@/components/admin/OrdersPieChart';
import PopularProductsChart from '@/components/admin/PopularProductsChart';
import Link from 'next/link';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Calendar,
  RefreshCw,
  Plus,
  Eye,
  Package
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today'); // today, week, month, year
  const [dashboardData, setDashboardData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Replace with actual API call
      // const response = await fetch(`/api/admin/dashboard?range=${dateRange}`);
      // const data = await response.json();

      // Mock data for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData = {
        stats: {
          revenue: {
            today: 45200,
            week: 187500,
            month: 650000,
            year: 5200000,
            change: 12.5 // percentage
          },
          orders: {
            active: 24,
            pending: 5,
            inProgress: 12,
            completed: 7,
            total: 342,
            change: 8.3
          },
          customers: {
            total: 156,
            new: 12,
            returning: 144,
            change: 15.7
          },
          pendingPayments: 5
        },
        recentOrders: [
          {
            id: 1,
            orderNumber: 'LC-2025-0042',
            customer: 'Sarah Khan',
            total: 8500,
            status: 'pending-payment',
            date: '2025-10-15T10:30:00',
            items: 2
          },
          {
            id: 2,
            orderNumber: 'LC-2025-0041',
            customer: 'Ayesha Ahmed',
            total: 12000,
            status: 'in-progress',
            date: '2025-10-15T09:15:00',
            items: 1
          },
          {
            id: 3,
            orderNumber: 'LC-2025-0040',
            customer: 'Fatima Ali',
            total: 15500,
            status: 'completed',
            date: '2025-10-14T16:45:00',
            items: 3
          },
          {
            id: 4,
            orderNumber: 'LC-2025-0039',
            customer: 'Zara Malik',
            total: 9200,
            status: 'in-progress',
            date: '2025-10-14T14:20:00',
            items: 2
          },
          {
            id: 5,
            orderNumber: 'LC-2025-0038',
            customer: 'Maria Hassan',
            total: 18500,
            status: 'completed',
            date: '2025-10-14T11:00:00',
            items: 4
          }
        ]
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setIsRefreshing(false);
  };

  // Export report
  const handleExport = () => {
    // Implement export functionality
    alert('Exporting report for ' + dateRange);
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const styles = {
      'pending-payment': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return styles[status] || styles['pending-payment'];
  };

  // Format status text
  const formatStatus = (status) => {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-PK', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto border-4 border-indigo-200 rounded-full border-t-indigo-600 animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Date Range Filter */}
          <div className="flex p-1 bg-gray-100 rounded-lg dark:bg-gray-800">
            {['today', 'week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  dateRange === range
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(dashboardData.stats.revenue[dateRange])}
          change={dashboardData.stats.revenue.change}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100 dark:bg-green-900/30"
          trend="up"
        />
        <StatsCard
          title="Active Orders"
          value={dashboardData.stats.orders.active}
          change={dashboardData.stats.orders.change}
          icon={ShoppingCart}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
          trend="up"
          subtitle={`${dashboardData.stats.orders.pending} pending payment`}
        />
        <StatsCard
          title="Total Customers"
          value={dashboardData.stats.customers.total}
          change={dashboardData.stats.customers.change}
          icon={Users}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100 dark:bg-purple-900/30"
          trend="up"
          subtitle={`${dashboardData.stats.customers.new} new this month`}
        />
        <StatsCard
          title="Pending Payments"
          value={dashboardData.stats.pendingPayments}
          icon={AlertCircle}
          iconColor="text-red-600"
          iconBgColor="bg-red-100 dark:bg-red-900/30"
          alert={dashboardData.stats.pendingPayments > 5}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trend</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last 30 days</p>
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <RevenueChart />
        </div>

        {/* Orders Pie Chart */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Orders by Category</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Distribution</p>
            </div>
            <Package className="w-5 h-5 text-indigo-500" />
          </div>
          <OrdersPieChart />
        </div>
      </div>

      {/* Popular Products Chart */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Popular Products</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Top 10 best sellers</p>
          </div>
        </div>
        <PopularProductsChart />
      </div>

      {/* Recent Orders Table */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Latest customer orders</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            View All →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Order #</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Items</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Total</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Date</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {dashboardData.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {order.customer}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {order.items} {order.items === 1 ? 'item' : 'items'}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(order.status)}`}>
                      {formatStatus(order.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {formatDate(order.date)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/orders/new"
          className="flex items-center gap-3 p-4 transition-all bg-white border border-gray-200 rounded-lg hover:shadow-lg dark:bg-gray-800 dark:border-gray-700 group"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">New Order</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create new order</p>
          </div>
        </Link>

        <Link
          href="/admin/products/new"
          className="flex items-center gap-3 p-4 transition-all bg-white border border-gray-200 rounded-lg hover:shadow-lg dark:bg-gray-800 dark:border-gray-700 group"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:scale-110 transition-transform">
            <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Add Product</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add new product</p>
          </div>
        </Link>

        <Link
          href="/admin/orders?status=pending-payment"
          className="flex items-center gap-3 p-4 transition-all bg-white border border-gray-200 rounded-lg hover:shadow-lg dark:bg-gray-800 dark:border-gray-700 group"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Pending Payments</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{dashboardData.stats.pendingPayments} to verify</p>
          </div>
        </Link>

        <Link
          href="/admin/reports/sales"
          className="flex items-center gap-3 p-4 transition-all bg-white border border-gray-200 rounded-lg hover:shadow-lg dark:bg-gray-800 dark:border-gray-700 group"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">View Reports</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Analytics & insights</p>
          </div>
        </Link>
      </div>
    </div>
  );
}