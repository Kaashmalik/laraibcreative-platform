// app/(customer)/account/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  TrendingUp,
  Package,
  ArrowRight,
  Calendar,
  MapPin
} from 'lucide-react';

// Order Status Badge Component
const OrderStatusBadge = ({ status }) => {
  const statusConfig = {
    'pending-payment': {
      label: 'Pending Payment',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    'payment-verified': {
      label: 'Payment Verified',
      className: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    'in-progress': {
      label: 'In Progress',
      className: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    'ready': {
      label: 'Ready for Dispatch',
      className: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    },
    'shipped': {
      label: 'Shipped',
      className: 'bg-cyan-100 text-cyan-800 border-cyan-200'
    },
    'delivered': {
      label: 'Delivered',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    'cancelled': {
      label: 'Cancelled',
      className: 'bg-red-100 text-red-800 border-red-200'
    }
  };

  const config = statusConfig[status] || statusConfig['pending-payment'];

  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
      border ${config.className}
    `}>
      {config.label}
    </span>
  );
};

export default function AccountDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setStats({
        totalOrders: 24,
        totalSpent: 125000,
        pendingOrders: 2,
        completedOrders: 20
      });

      setRecentOrders([
        {
          id: 'LC-2025-0156',
          date: '2025-10-08',
          items: 2,
          total: 8500,
          status: 'in-progress',
          estimatedDelivery: '2025-10-15'
        },
        {
          id: 'LC-2025-0142',
          date: '2025-10-01',
          items: 1,
          total: 6500,
          status: 'delivered',
          deliveredDate: '2025-10-07'
        },
        {
          id: 'LC-2025-0138',
          date: '2025-09-28',
          items: 3,
          total: 12000,
          status: 'delivered',
          deliveredDate: '2025-10-05'
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Welcome Back! 👋
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your orders today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {/* Total Orders */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {stats.totalOrders}
          </h3>
          <p className="text-sm text-gray-600 font-medium">Total Orders</p>
        </div>

        {/* Total Spent */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(stats.totalSpent)}
          </h3>
          <p className="text-sm text-gray-600 font-medium">Total Spent</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {stats.pendingOrders}
          </h3>
          <p className="text-sm text-gray-600 font-medium">Active Orders</p>
        </div>

        {/* Completed Orders */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {stats.completedOrders}
          </h3>
          <p className="text-sm text-gray-600 font-medium">Completed</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link
            href="/account/orders"
            className="text-sm font-medium text-pink-600 hover:text-pink-700 flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="divide-y divide-gray-200">
          {recentOrders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No orders yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start shopping to see your orders here
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                Start Shopping
              </Link>
            </div>
          ) : (
            recentOrders.map((order) => (
              <div
                key={order.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-semibold text-gray-900">
                        {order.id}
                      </h3>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(order.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span>{order.items} {order.items === 1 ? 'item' : 'items'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </div>

                    {order.estimatedDelivery && (
                      <div className="mt-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Est. Delivery: {formatDate(order.estimatedDelivery)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/track-order/${order.id}`}
                      className="px-4 py-2 text-sm font-medium text-pink-600 border border-pink-600 rounded-lg hover:bg-pink-50 transition-colors"
                    >
                      Track Order
                    </Link>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg hover:shadow-lg transition-all"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/custom-order"
          className="p-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl text-white hover:shadow-xl transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Start Custom Order</h3>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-pink-100">
            Create your perfect outfit with custom measurements
          </p>
        </Link>

        <Link
          href="/account/measurements"
          className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-pink-300 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Measurements</h3>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-gray-600">
            View and manage your saved measurements
          </p>
        </Link>

        <Link
          href="/account/wishlist"
          className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-pink-300 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Wishlist</h3>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-gray-600">
            View your favorite products and designs
          </p>
        </Link>
      </div>
    </div>
  );
}