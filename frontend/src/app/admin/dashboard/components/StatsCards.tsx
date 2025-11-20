/**
 * StatsCards Component
 * Displays key metrics cards for dashboard
 */

'use client';

import { DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown } from 'lucide-react';
import type { DashboardStats } from '@/types/dashboard';
import { Skeleton } from '@/components/ui/Skeleton';

interface StatsCardsProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-PK').format(num);
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-12 w-32 mb-2" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.revenue.total),
      change: stats.revenue.change,
      icon: DollarSign,
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-100 dark:bg-green-900/30',
      subtitle: `Avg: ${formatCurrency(stats.revenue.averageOrderValue)}`
    },
    {
      title: 'Active Orders',
      value: formatNumber(stats.orders.active),
      change: stats.orders.change,
      icon: ShoppingCart,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100 dark:bg-blue-900/30',
      subtitle: `${stats.orders.pending} pending payment`
    },
    {
      title: 'Total Customers',
      value: formatNumber(stats.customers.total),
      change: stats.customers.change,
      icon: Users,
      iconColor: 'text-purple-600',
      iconBgColor: 'bg-purple-100 dark:bg-purple-900/30',
      subtitle: `${stats.customers.new} new this period`
    },
    {
      title: 'Products',
      value: formatNumber(stats.products.total),
      icon: Package,
      iconColor: 'text-orange-600',
      iconBgColor: 'bg-orange-100 dark:bg-orange-900/30',
      subtitle: `${stats.products.lowStock} low stock`,
      alert: stats.products.lowStock > 0
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isPositive = card.change !== undefined && card.change >= 0;
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;

        return (
          <div
            key={index}
            className="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.iconBgColor}`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              {card.change !== undefined && (
                <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendIcon className="w-4 h-4" />
                  <span className="font-medium">{Math.abs(card.change)}%</span>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{card.value}</p>
              {card.subtitle && (
                <p className={`text-xs ${card.alert ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {card.subtitle}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

