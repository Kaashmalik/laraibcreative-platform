'use client';

import { Package, Scissors, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function InventoryManagementPage() {
  const inventorySections = [
    {
      title: 'Fabrics',
      description: 'Manage fabric inventory, types, and stock levels',
      icon: Scissors,
      href: '/admin/inventory/fabrics',
      color: 'bg-indigo-500',
      count: 0
    },
    {
      title: 'Accessories',
      description: 'Track buttons, zippers, threads, and other accessories',
      icon: Sparkles,
      href: '/admin/inventory/accessories',
      color: 'bg-pink-500',
      count: 0
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Track and manage your fabric and accessory inventory
        </p>
      </div>

      {/* Inventory Sections Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {inventorySections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="block p-6 transition bg-white border border-gray-200 rounded-lg hover:shadow-lg dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${section.color} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 ${section.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {section.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {section.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {section.count}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">items</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Low Stock Alerts */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          <Package className="inline-block w-5 h-5 mr-2" />
          Low Stock Alerts
        </h2>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No low stock items at the moment</p>
        </div>
      </div>
    </div>
  );
}
