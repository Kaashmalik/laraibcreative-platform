"use client";

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import Card from '@/components/ui/Card';

const settingsSections = [
  { title: 'General', href: '/admin/settings/general', icon: '⚙️' },
  { title: 'Email', href: '/admin/settings/email', icon: '���' },
  { title: 'Payment', href: '/admin/settings/payment', icon: '���' },
  { title: 'Shipping', href: '/admin/settings/shipping', icon: '���' },
  { title: 'SEO', href: '/admin/settings/seo', icon: '���' },
  { title: 'Users', href: '/admin/settings/users', icon: '���' }
];

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsSections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-4">{section.icon}</div>
              <h3 className="text-lg font-semibold">{section.title}</h3>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}