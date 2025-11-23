/**
 * LowStockAlerts Component
 * Displays low stock product alerts
 */

'use client';


import Link from 'next/link';
import { AlertTriangle, Package } from 'lucide-react';
import type { LowStockAlert } from '@/types/dashboard';
import { Skeleton } from '@/components/ui/Skeleton';
import Image from 'next/image';

interface LowStockAlertsProps {
  alerts: LowStockAlert[];
  isLoading?: boolean;
}

export default function LowStockAlerts({ alerts, isLoading }: LowStockAlertsProps) {
  if (isLoading) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Stock Alerts</h2>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">All products are well stocked</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Low Stock Alerts</h2>
        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full dark:bg-red-900/30 dark:text-red-400">
          {alerts.length}
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.map((alert) => (
          <Link
            key={alert.productId}
            href={`/admin/products/${alert.productId}`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
          >
            {alert.image && (
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                <Image
                  src={alert.image}
                  alt={alert.title}
                  fill
                  sizes="48px"
                  className="object-cover"
                  quality={60}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {alert.title}
              </p>
              {alert.sku && (
                <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {alert.sku}</p>
              )}
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${alert.stock <= 5 ? 'text-red-600' : 'text-yellow-600'}`}>
                {alert.stock} left
              </p>
            </div>
          </Link>
        ))}
      </div>

      {alerts.length > 10 && (
        <Link
          href="/admin/products?filter=low-stock"
          className="block mt-4 text-center text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          View all low stock products →
        </Link>
      )}
    </div>
  );
}

