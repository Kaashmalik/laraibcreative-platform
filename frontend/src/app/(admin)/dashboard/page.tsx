/**
 * Business Metrics Dashboard
 * Comprehensive analytics and KPIs
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { 
  DollarSign, Users, ShoppingCart, TrendingUp, 
  Package, AlertCircle, RefreshCw 
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  const { data, isLoading, refetch } = trpc.analytics.getDashboard.useQuery({
    dateFrom: dateRange.from,
    dateTo: dateRange.to,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const metrics = data?.data || {};

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Business Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive metrics and analytics</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          />
          <span>to</span>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          />
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold mt-1">
                Rs. {metrics.revenue?.totalRevenue?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {metrics.revenue?.totalOrders || 0} orders
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Average Order Value</p>
              <p className="text-3xl font-bold mt-1">
                Rs. {Math.round(metrics.revenue?.averageOrderValue || 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">Per order</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Customers</p>
              <p className="text-3xl font-bold mt-1">
                {metrics.customers?.totalCustomers?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {metrics.customers?.repeatRate || 0}% repeat rate
              </p>
            </div>
            <Users className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Conversion Rate</p>
              <p className="text-3xl font-bold mt-1">
                {metrics.conversion?.conversionRate || 0}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {metrics.conversion?.abandonedCarts || 0} abandoned
              </p>
            </div>
            <ShoppingCart className="w-12 h-12 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-semibold mb-4">Daily Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.revenue?.dailyRevenue || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-semibold mb-4">Top Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.products?.topProducts?.slice(0, 5) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="productName" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalSold" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Customer Metrics */}
      <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
        <h3 className="text-xl font-semibold mb-4">Customer Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600 text-sm">Repeat Customers</p>
            <p className="text-2xl font-bold mt-1">
              {metrics.customers?.repeatCustomers || 0}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Repeat Rate</p>
            <p className="text-2xl font-bold mt-1">
              {metrics.customers?.repeatRate || 0}%
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Average LTV</p>
            <p className="text-2xl font-bold mt-1">
              Rs. {Math.round(metrics.customers?.averageLTV || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            System Alerts
          </h3>
          <button
            onClick={() => trpc.alerts.checkAll.mutate()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Run Checks
          </button>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-gray-600">
            Failed Payments: {metrics.alerts?.payments?.count || 0}
          </p>
          <p className="text-gray-600">
            Stockouts: {metrics.alerts?.stockouts?.count || 0}
          </p>
          <p className="text-gray-600">
            Abandonment Rate: {metrics.alerts?.abandonment?.abandonmentRate || 0}%
          </p>
        </div>
      </div>
    </div>
  );
}

