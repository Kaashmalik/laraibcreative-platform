'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Head from 'next/head';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import LoadingScreen from '@/components/shared/LoadingScreen';
import useAuth from '@/hooks/useAuth';
import ProtectedRoute from '@/components/shared/ProtectedRoute';

// Disable static generation for all admin pages

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) {
      return;
    }

    // Skip auth check for login page
    if (pathname === '/admin/login') {
      setIsLoading(false);
      return;
    }

    // Check if user is authenticated and has admin role
    if (!user) {
      router.push('/admin/login');
      return;
    }

    // Enhanced role-based access control
    const allowedRoles = ['admin', 'super-admin', 'manager'];
    if (!allowedRoles.includes(user.role)) {
      // Not authorized - redirect to customer area
      router.push('/');
      return;
    }

    setIsLoading(false);
  }, [pathname, router, user, authLoading]);

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('adminTheme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('adminTheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('adminTheme', 'light');
    }
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle logout
  const handleLogout = () => {
    // Clear admin token
    localStorage.removeItem('adminToken');
    // Redirect to admin login
    router.push('/admin/login');
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Don't show sidebar/header on login page
  if (pathname === '/admin/login') {
    return (
      <>
        <Head>
          <title>Admin Login | LaraibCreative</title>
          <meta name="description" content="Admin login for LaraibCreative management panel" />
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="min-h-screen">{children}</div>
      </>
    );
  }

  return (
    <ProtectedRoute adminOnly requiredRoles={['admin', 'super-admin', 'manager']}>
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <AdminSidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentPath={pathname}
        />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 w-0 overflow-hidden">
          {/* Header */}
          <AdminHeader 
            onToggleSidebar={toggleSidebar}
            onToggleDarkMode={toggleDarkMode}
            isDarkMode={isDarkMode}
            user={user}
            onLogout={handleLogout}
          />

          {/* Main Content */}
          <main className="relative flex-1 overflow-y-auto focus:outline-none">
            {/* Page Content */}
            <div className="py-6">
              <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      </div>
    </ProtectedRoute>
  );
}