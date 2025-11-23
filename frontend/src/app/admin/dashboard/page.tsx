/**
 * Admin Dashboard Page
 * Complete dashboard with real-time metrics, charts, and analytics
 * 
 * Features:
 * - Stats cards (Revenue, Orders, Customers, Products)
 * - Revenue chart (last 30 days)
 * - Orders pie chart (by status)
 * - Popular products chart
 * - Recent orders table
 * - Low stock alerts
 * - Quick actions
 * - Date range picker
 * - Export functionality
 */

'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useDashboard } from '@/hooks/useDashboard';
import { DynamicErrorBoundary } from '@/components/shared/DynamicErrorBoundary';
import { ChartLoading } from '@/components/shared/LoadingComponents';
import StatsCards from './components/StatsCards';
import RecentOrdersTable from './components/RecentOrdersTable';
import LowStockAlerts from './components/LowStockAlerts';
import QuickActions from './components/QuickActions';
import DateRangePicker from './components/DateRangePicker';
import ExportButton from './components/ExportButton';
import type { DateRange } from '@/types/dashboard';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import api from '@/lib/api';

// Dynamically import chart components (heavy recharts library)
const RevenueChart = dynamic(
  () => import('./components/RevenueChart'),
  {
    loading: () => (
      <DynamicErrorBoundary componentName="RevenueChart">
        <ChartLoading height={350} />
      </DynamicErrorBoundary>
    ),
    ssr: false,
  }
);

const OrdersPieChart = dynamic(
  () => import('./components/OrdersPieChart'),
  {
    loading: () => (
      <DynamicErrorBoundary componentName="OrdersPieChart">
        <ChartLoading height={350} />
      </DynamicErrorBoundary>
    ),
    ssr: false,
  }
);

const PopularProductsChart = dynamic(
  () => import('./components/PopularProductsChart'),
  {
    loading: () => (
      <DynamicErrorBoundary componentName="PopularProductsChart">
        <ChartLoading height={400} />
      </DynamicErrorBoundary>
    ),
    ssr: false,
  }
);

const SuitTypeSalesChart = dynamic(
  () => import('./components/SuitTypeSalesChart'),
  {
    loading: () => (
      <DynamicErrorBoundary componentName="SuitTypeSalesChart">
        <ChartLoading height={350} />
      </DynamicErrorBoundary>
    ),
    ssr: false,
  }
);

const SEOReports = dynamic(
  () => import('./components/SEOReports'),
  {
    loading: () => (
      <DynamicErrorBoundary componentName="SEOReports">
        <ChartLoading height={400} />
      </DynamicErrorBoundary>
    ),
    ssr: false,
  }
);

export default function AdminDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [customStartDate, setCustomStartDate] = useState<string | undefined>();
  const [customEndDate, setCustomEndDate] = useState<string | undefined>();

  const {
    data: dashboardData,
    isLoading,
    isRefreshing,
    error,
    refresh
  } = useDashboard({
    period: dateRange,
    startDate: customStartDate,
    endDate: customEndDate,
    autoRefresh: true,
    refreshInterval: 120000 // Refresh every 2 minutes (reduced from 1 minute for performance)
  });

  // Update document title and meta tags for client component
  useEffect(() => {
    document.title = 'Dashboard | Admin | LaraibCreative';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Admin dashboard with analytics, charts, and real-time metrics');
    }
  }, []);

  const handleDateRangeChange = (range: DateRange, start?: string, end?: string) => {
    setDateRange(range);
    setCustomStartDate(start);
    setCustomEndDate(end);
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'json') => {
    try {
      toast.loading('Exporting dashboard data...');
      const response = await api.dashboard.exportData({
        format,
        type: 'full',
        period: dateRange,
        startDate: customStartDate,
        endDate: customEndDate
      });

      // When responseType is 'blob', the axios interceptor returns the blob directly
      const blob = response as Blob;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-export-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success('Dashboard data exported successfully!');
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.response?.data?.message || 'Failed to export dashboard data');
      console.error('Export error:', err);
    }
  };

  if (isLoading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto border-4 border-indigo-200 rounded-full border-t-indigo-600 animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={() => refresh()} ariaLabel="Retry loading dashboard">Retry</Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="space-y-6">
        {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Welcome back! Here&apos;s what&apos;s happening with your store.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Picker */}
          <DateRangePicker
            value={dateRange}
            customStartDate={customStartDate}
            customEndDate={customEndDate}
            onChange={handleDateRangeChange}
          />

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
            ariaLabel="Refresh dashboard data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {/* Export Button */}
          <ExportButton onExport={handleExport} />
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards
        stats={dashboardData.stats}
        isLoading={isLoading}
      />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trend</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last 30 days</p>
            </div>
          </div>
          {dashboardData.revenueTrends && dashboardData.revenueTrends.length > 0 ? (
            <RevenueChart data={dashboardData.revenueTrends} />
          ) : (
            <ChartLoading height={350} />
          )}
        </div>

        {/* Orders Pie Chart */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Orders by Status</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Distribution</p>
            </div>
          </div>
          {dashboardData.orderDistribution && dashboardData.orderDistribution.length > 0 ? (
            <OrdersPieChart data={dashboardData.orderDistribution} />
          ) : (
            <ChartLoading height={350} />
          )}
        </div>
      </div>

      {/* Suit Type Sales Chart */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sales by Suit Type</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Karhai, Replica & Ready-Made distribution</p>
          </div>
        </div>
        {dashboardData.suitTypeSales && dashboardData.suitTypeSales.length > 0 ? (
          <SuitTypeSalesChart data={dashboardData.suitTypeSales} />
        ) : (
          <ChartLoading height={350} />
        )}
      </div>

      {/* Popular Products Chart */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Popular Products</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Top 10 best sellers</p>
          </div>
        </div>
        {dashboardData.popularProducts && dashboardData.popularProducts.length > 0 ? (
          <PopularProductsChart data={dashboardData.popularProducts} />
        ) : (
          <ChartLoading height={400} />
        )}
      </div>

      {/* SEO Reports */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
        <SEOReports />
      </div>

      {/* Recent Orders and Low Stock Alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2">
          <RecentOrdersTable
            orders={dashboardData.recentOrders}
            isLoading={isLoading}
          />
        </div>

        {/* Low Stock Alerts */}
        <div>
          <LowStockAlerts
            alerts={dashboardData.lowStockAlerts}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}
