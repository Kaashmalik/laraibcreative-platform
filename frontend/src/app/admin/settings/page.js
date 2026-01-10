"use client";
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Settings, Mail, CreditCard, Truck, Search, Users, User, Globe } from 'lucide-react';
import ProtectedAdminRoute from '@/components/admin/ProtectedAdminRoute';
import AdminLayout from '@/components/admin/AdminLayout';

const settingsSections = [
  { title: 'General', description: 'Store name, logo, contact info', href: '/admin/settings/general', icon: Settings, color: 'bg-gray-500' },
  { title: 'Email', description: 'Email templates and SMTP settings', href: '/admin/settings/email', icon: Mail, color: 'bg-blue-500' },
  { title: 'Payment', description: 'Payment gateways and currencies', href: '/admin/settings/payment', icon: CreditCard, color: 'bg-green-500' },
  { title: 'Shipping', description: 'Shipping zones and rates', href: '/admin/settings/shipping', icon: Truck, color: 'bg-orange-500' },
  { title: 'SEO', description: 'Meta tags and search optimization', href: '/admin/settings/seo', icon: Search, color: 'bg-purple-500' },
  { title: 'Users', description: 'Admin users and permissions', href: '/admin/settings/users', icon: Users, color: 'bg-rose-500' },
  { title: 'Profile', description: 'Your account settings', href: '/admin/settings/profile', icon: User, color: 'bg-indigo-500' }
];

export default function SettingsPage() {
  return (
    <ProtectedAdminRoute>
      <AdminLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your store configuration</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <Link key={section.href} href={section.href}>
                  <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                    <div className={`w-12 h-12 ${section.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </AdminLayout>
    </ProtectedAdminRoute>
  );
}