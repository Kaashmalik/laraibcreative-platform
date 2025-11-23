/**
 * Admin Sidebar Component
 * 
 * Collapsible navigation sidebar for admin panel featuring:
 * - Hierarchical menu structure with icons
 * - Active route highlighting
 * - Expandable sub-menus
 * - Responsive behavior (overlay on mobile, fixed on desktop)
 * - Smooth animations
 * - Badge indicators for pending items
 * 
 * @param {boolean} isOpen - Sidebar visibility state
 * @param {function} onClose - Callback to close sidebar (mobile)
 * @param {string} currentPath - Current route path for active state
 */

'use client';


import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Archive, 
  FileText, 
  BarChart3, 
  Settings, 
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Shirt
} from 'lucide-react';

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState({});

  // Toggle submenu expansion
  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  // Check if path is active
  const isActive = (path) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  // Navigation menu structure
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
      badge: null
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      path: '/admin/products',
      badge: null,
      subItems: [
        { label: 'All Products', path: '/admin/products' },
        { label: 'Add New', path: '/admin/products/new' },
        { label: 'Categories', path: '/admin/products/categories' }
      ]
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart,
      path: '/admin/orders',
      badge: 5,
      subItems: [
        { label: 'All Orders', path: '/admin/orders' },
        { label: 'Pending Payment', path: '/admin/orders?status=pending-payment' },
        { label: 'In Progress', path: '/admin/orders?status=in-progress' },
        { label: 'Completed', path: '/admin/orders?status=completed' }
      ]
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      path: '/admin/customers',
      badge: null
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Archive,
      path: '/admin/inventory',
      badge: null,
      subItems: [
        { label: 'Fabrics', path: '/admin/inventory/fabrics' },
        { label: 'Accessories', path: '/admin/inventory/accessories' }
      ]
    },
    {
      id: 'content',
      label: 'Content',
      icon: FileText,
      path: '/admin/content',
      badge: null,
      subItems: [
        { label: 'Homepage', path: '/admin/content/homepage' },
        { label: 'Blog Posts', path: '/admin/content/blog' },
        { label: 'Banners', path: '/admin/content/banners' }
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      path: '/admin/reports',
      badge: null,
      subItems: [
        { label: 'Sales Report', path: '/admin/reports/sales' },
        { label: 'Customer Report', path: '/admin/reports/customers' },
        { label: 'Product Performance', path: '/admin/reports/products' }
      ]
    },
    {
      id: 'communications',
      label: 'Communications',
      icon: MessageSquare,
      path: '/admin/communications',
      badge: 3,
      subItems: [
        { label: 'Inquiries', path: '/admin/communications/inquiries' },
        { label: 'Notifications', path: '/admin/communications/notifications' }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/admin/settings',
      badge: null,
      subItems: [
        { label: 'General', path: '/admin/settings/general' },
        { label: 'Payment', path: '/admin/settings/payment' },
        { label: 'Shipping', path: '/admin/settings/shipping' },
        { label: 'Email', path: '/admin/settings/email' },
        { label: 'SEO', path: '/admin/settings/seo' },
        { label: 'Users', path: '/admin/settings/users' }
      ]
    }
  ];

  // Render menu item
  const renderMenuItem = (item) => {
    const Icon = item.icon;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedMenus[item.id];
    const isItemActive = isActive(item.path);

    return (
      <div key={item.id} className="mb-1">
        <div
          className={`
            flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg cursor-pointer
            transition-all duration-200
            ${isItemActive 
              ? 'bg-indigo-600 text-white shadow-lg' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }
          `}
          onClick={() => {
            if (hasSubItems) {
              toggleMenu(item.id);
            } else {
              onClose?.();
            }
          }}
        >
          <Link 
            href={item.path}
            className="flex items-center flex-1"
            onClick={(e) => hasSubItems && e.preventDefault()}
          >
            <Icon className="w-5 h-5 mr-3" />
            <span>{item.label}</span>
          </Link>

          <div className="flex items-center gap-2">
            {item.badge && item.badge > 0 && (
              <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
            {hasSubItems && (
              isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            )}
          </div>
        </div>

        {hasSubItems && isExpanded && (
          <div className="mt-1 ml-4 space-y-1">
            {item.subItems.map((subItem, index) => (
              <Link
                key={index}
                href={subItem.path}
                onClick={onClose}
                className={`
                  flex items-center px-4 py-2 text-sm rounded-lg transition-colors
                  ${isActive(subItem.path)
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }
                `}
              >
                <span className="w-2 h-2 mr-3 bg-gray-400 rounded-full dark:bg-gray-600"></span>
                {subItem.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <Shirt className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">LaraibCreative</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="p-1 rounded-lg lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close sidebar"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map(renderMenuItem)}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Quick Stats</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">24</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Orders Today</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">5</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}