/**
 * Dashboard Types
 * TypeScript interfaces for admin dashboard data
 */

export type DateRange = 'today' | 'week' | 'month' | 'year' | 'custom';

export interface DashboardStats {
  revenue: {
    total: number;
    today: number;
    week: number;
    month: number;
    year: number;
    change: number; // percentage change
    netRevenue: number;
    averageOrderValue: number;
  };
  orders: {
    total: number;
    active: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    change: number; // percentage change
    completionRate: number;
    cancellationRate: number;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    change: number; // percentage change
    retentionRate: number;
  };
  products: {
    total: number;
    lowStock: number;
    outOfStock: number;
    change?: number;
  };
}

export interface RevenueTrend {
  date: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

export interface OrderDistribution {
  status: string;
  count: number;
  percentage: number;
  revenue: number;
}

export interface PopularProduct {
  productId: string;
  title: string;
  sku?: string;
  image?: string;
  sales: number;
  revenue: number;
  orderCount: number;
  averagePrice: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  customerEmail?: string;
  total: number;
  status: string;
  date: string;
  items: number;
  paymentMethod?: string;
  paymentStatus?: string;
}

export interface LowStockAlert {
  productId: string;
  title: string;
  sku?: string;
  stock: number;
  category?: string;
  image?: string;
}

export interface SuitTypeSales {
  suitType: string;
  label: string;
  revenue: number;
  orders: number;
  quantity: number;
  percentage: number;
}

export interface DashboardData {
  stats: DashboardStats;
  revenueTrends: RevenueTrend[];
  orderDistribution: OrderDistribution[];
  popularProducts: PopularProduct[];
  recentOrders: RecentOrder[];
  lowStockAlerts: LowStockAlert[];
  suitTypeSales?: SuitTypeSales[];
  dateRange: {
    startDate: string;
    endDate: string;
    period: DateRange;
  };
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
  message?: string;
}

export interface ExportOptions {
  format: 'csv' | 'pdf' | 'json';
  type: 'sales' | 'orders' | 'products' | 'customers' | 'full';
  dateRange: DateRange;
  startDate?: string;
  endDate?: string;
}

