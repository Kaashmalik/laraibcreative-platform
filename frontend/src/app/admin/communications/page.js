'use client';
export const dynamic = 'force-dynamic';
import { Bell, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function CommunicationsPage() {
  const commSections = [
    {
      title: 'Notifications',
      description: 'Send email and WhatsApp notifications to customers',
      icon: Bell,
      href: '/admin/communications/notifications',
      color: 'bg-orange-500',
      count: 3
    },
    {
      title: 'Inquiries',
      description: 'View and respond to customer inquiries and messages',
      icon: MessageSquare,
      href: '/admin/communications/inquiries',
      color: 'bg-blue-500',
      count: 5
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Communications</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage customer communications, notifications, and inquiries
        </p>
      </div>

      {/* Communications Sections Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {commSections.map((section) => {
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
                {section.count > 0 && (
                  <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-red-500 rounded-full">
                    {section.count}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Order confirmation sent
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Order #12345 - 2 hours ago
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  New inquiry received
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Custom order inquiry - 5 hours ago
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}