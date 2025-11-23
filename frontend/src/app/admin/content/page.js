'use client';

import { FileText, Image, Home } from 'lucide-react';
import Link from 'next/link';

export default function ContentManagementPage() {
  const contentSections = [
    {
      title: 'Homepage',
      description: 'Manage homepage banners, featured sections, and hero content',
      icon: Home,
      href: '/admin/content/homepage',
      color: 'bg-blue-500'
    },
    {
      title: 'Banners',
      description: 'Create and manage promotional banners and sliders',
      icon: Image,
      href: '/admin/content/banners',
      color: 'bg-purple-500'
    },
    {
      title: 'Blog',
      description: 'Manage blog posts, categories, and content',
      icon: FileText,
      href: '/admin/content/blog',
      color: 'bg-green-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Management</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your website content, banners, and promotional materials
        </p>
      </div>

      {/* Content Sections Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {contentSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="block p-6 transition bg-white border border-gray-200 rounded-lg hover:shadow-lg dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${section.color} bg-opacity-10`}>
                  <Icon className={`w-6 h-6 ${section.color.replace('bg-', 'text-')}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {section.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {section.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">Active Banners</div>
          <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">0</div>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">Published Posts</div>
          <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">0</div>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">Draft Content</div>
          <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">0</div>
        </div>
      </div>
    </div>
  );
}
