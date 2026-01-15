'use client';


import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Menu, 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  User, 
  LogOut, 
  Settings,
  Plus,
  Package,
  X,
  Loader2
} from 'lucide-react';

export default function AdminHeader({ 
  onToggleSidebar, 
  onToggleDarkMode, 
  isDarkMode = false, 
  user = null, 
  onLogout 
}) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'order',
      title: 'New Order Received',
      message: 'Order #LC-2025-0042 from Sarah Khan',
      time: '2 min ago',
      unread: true
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Receipt Uploaded',
      message: 'Order #LC-2025-0041 payment verification needed',
      time: '15 min ago',
      unread: true
    },
    {
      id: 3,
      type: 'inquiry',
      title: 'New Customer Inquiry',
      message: 'Question about custom stitching from Ayesha',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 4,
      type: 'review',
      title: 'New Product Review',
      message: '5-star review on Red Velvet Bridal Suit',
      time: '2 hours ago',
      unread: false
    },
    {
      id: 5,
      type: 'stock',
      title: 'Low Stock Alert',
      message: 'Chiffon fabric running low (5 meters left)',
      time: '3 hours ago',
      unread: false
    }
  ]);
  const [unreadCount, setUnreadCount] = useState(3);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const getNotificationColor = (type) => {
    const colors = {
      order: 'text-blue-500',
      payment: 'text-green-500',
      inquiry: 'text-purple-500',
      review: 'text-yellow-500',
      stock: 'text-red-500'
    };
    return colors[type] || 'text-gray-500';
  };

  const handleLogoutClick = useCallback(async () => {
    if (onLogout) {
      setIsLoading(true);
      try {
        await onLogout();
      } finally {
        setIsLoading(false);
        setIsProfileOpen(false);
      }
    }
  }, [onLogout]);

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-500 transition-colors rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="relative hidden md:block" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, products, customers..."
                className="w-64 py-2 pl-10 pr-4 text-sm transition-all bg-gray-100 border border-transparent rounded-lg lg:w-96 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:bg-gray-700 dark:text-white dark:focus:bg-gray-600"
              />
            </form>
          </div>

          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 text-gray-500 transition-colors rounded-lg md:hidden hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label="Toggle search"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/admin/orders/new"
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-white transition-all bg-indigo-600 rounded-lg hover:bg-indigo-700 hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden lg:inline">New Order</span>
          </Link>

          <button
            onClick={onToggleDarkMode}
            className="p-2 text-gray-500 transition-colors rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 text-gray-500 transition-colors rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 w-80 mt-2 bg-white rounded-lg shadow-lg dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Notifications ({unreadCount})
                  </h3>
                  <button className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                    Mark all read
                  </button>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                        notification.unread ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <Bell className={`w-5 h-5 mt-0.5 ${getNotificationColor(notification.type)}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                            {notification.time}
                          </p>
                        </div>
                        {notification.unread && (
                          <div className="w-2 h-2 mt-2 bg-indigo-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    href="/admin/communications/notifications"
                    className="block text-sm font-medium text-center text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    View All Notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="User menu"
            >
              <div className="flex items-center justify-center w-8 h-8 text-sm font-semibold text-white rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                {user?.fullName?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="hidden text-sm font-medium text-gray-700 sm:block dark:text-gray-300">
                {user?.fullName || 'Admin'}
              </span>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 w-56 mt-2 bg-white rounded-lg shadow-lg dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.fullName || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email || 'laraibcreative.business@gmail.com'}
                  </p>
                  <span className="inline-block px-2 py-1 mt-2 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-full dark:text-indigo-300 dark:bg-indigo-900/30">
                    {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </span>
                </div>

                <div className="p-2">
                  <Link
                    href="/admin/settings/profile"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 transition-colors rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>
                  <Link
                    href="/admin/settings"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 transition-colors rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 transition-colors rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <Package className="w-4 h-4" />
                    View Store
                  </Link>
                </div>

                <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleLogoutClick}
                    disabled={isLoading}
                    className="flex items-center justify-center w-full gap-2 px-3 py-2 text-sm font-medium text-white transition-all bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Logging out...
                      </>
                    ) : (
                      <>
                        <LogOut className="w-4 h-4" />
                        Logout
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isSearchOpen && (
        <div className="px-4 pb-4 border-t border-gray-200 md:hidden dark:border-gray-700">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders, products, customers..."
              className="w-full py-2 pl-10 pr-10 text-sm bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:bg-gray-700 dark:text-white dark:focus:bg-gray-600"
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
              className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </header>
  );
}