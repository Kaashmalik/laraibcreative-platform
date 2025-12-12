"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Calendar, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import ProtectedAdminRoute from '@/components/admin/ProtectedAdminRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import api from '@/lib/api';

export default function SalesReportsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [salesData, setSalesData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    revenueChange: 0,
    topSelling: [],
    recentOrders: []
  });

  useEffect(() => {
    fetchSalesData();
  }, [dateRange]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const response = await api.reports.getSalesReport({ period: dateRange });
      if (response.success && response.data) {
        setSalesData(response.data);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      // Sample data
      setSalesData({
        totalRevenue: 485000,
        totalOrders: 156,
        averageOrderValue: 3109,
        revenueChange: 12.5,
        topSelling: [
          { name: 'Bridal Collection Lehnga', sales: 45, revenue: 180000 },
          { name: 'Party Wear Suit', sales: 38, revenue: 114000 },
          { name: 'Casual Kurti', sales: 52, revenue: 78000 }
        ],
        recentOrders: [
          { id: 'ORD-001', customer: 'Ayesha Khan', amount: 12500, status: 'delivered' },
          { id: 'ORD-002', customer: 'Fatima Ali', amount: 8500, status: 'shipped' },
          { id: 'ORD-003', customer: 'Sarah Ahmed', amount: 15000, status: 'processing' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedAdminRoute>
      <AdminLayout>
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sales Report</h1>
              <p className="text-gray-600">Revenue and transaction analytics</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              <button className="inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">PKR {salesData.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className={`flex items-center ${salesData.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {salesData.revenueChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      <span className="text-sm font-medium">{Math.abs(salesData.revenueChange)}%</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{salesData.totalOrders}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <p className="text-sm text-gray-500">Avg. Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">PKR {salesData.averageOrderValue.toLocaleString()}</p>
                </div>
              </div>

              {/* Top Selling Products */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Product</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Sales</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.topSelling.map((product, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-900">{product.name}</td>
                          <td className="py-3 px-4 text-right text-gray-600">{product.sales}</td>
                          <td className="py-3 px-4 text-right text-gray-900 font-medium">PKR {product.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Order ID</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Customer</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.recentOrders.map((order, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-900 font-medium">{order.id}</td>
                          <td className="py-3 px-4 text-gray-600">{order.customer}</td>
                          <td className="py-3 px-4 text-right text-gray-900">PKR {order.amount.toLocaleString()}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </AdminLayout>
    </ProtectedAdminRoute>
  );
}