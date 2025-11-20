/**
 * QuickActions Component
 * Quick action buttons for common admin tasks
 */

'use client';

import Link from 'next/link';
import { Plus, Package, Clock, TrendingUp, ShoppingBag, Users } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    {
      title: 'Add Product',
      description: 'Create new product',
      href: '/admin/products/new',
      icon: Plus,
      color: 'indigo'
    },
    {
      title: 'View Orders',
      description: 'Manage all orders',
      href: '/admin/orders',
      icon: ShoppingBag,
      color: 'blue'
    },
    {
      title: 'Pending Payments',
      description: 'Verify payments',
      href: '/admin/orders?status=pending-payment',
      icon: Clock,
      color: 'yellow'
    },
    {
      title: 'View Reports',
      description: 'Analytics & insights',
      href: '/admin/reports',
      icon: TrendingUp,
      color: 'purple'
    }
  ];

  const colorClasses: Record<string, string> = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Link
            key={index}
            href={action.href}
            className="flex items-center gap-3 p-4 transition-all bg-white border border-gray-200 rounded-lg hover:shadow-lg dark:bg-gray-800 dark:border-gray-700 group"
          >
            <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${colorClasses[action.color]} group-hover:scale-110 transition-transform`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{action.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

