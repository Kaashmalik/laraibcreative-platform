'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Head from 'next/head';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import LoadingScreen from '@/components/shared/LoadingScreen';
import ProtectedAdminRoute from '@/components/admin/ProtectedAdminRoute';
import { toast } from 'react-hot-toast';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarStats, setSidebarStats] = useState(null);

  const fetchUser = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${apiUrl}/auth/me`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        const userData = data?.data?.user || data?.user;
        if (userData) {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }, []);

  const fetchSidebarStats = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${apiUrl}/admin/dashboard/stats`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setSidebarStats(data?.data || {});
      }
    } catch (error) {
      console.log('Could not fetch sidebar stats:', error.message);
    }
  }, []);

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      await Promise.all([fetchUser(), fetchSidebarStats()]);
      setIsLoading(false);
    };
    initData();

    const savedTheme = localStorage.getItem('adminTheme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, [fetchUser, fetchSidebarStats]);

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/admin/login');
  }, [router]);

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

  if (isLoading) {
    return <LoadingScreen message="Loading admin panel..." />;
  }

  return (
    <ProtectedAdminRoute>
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
        <AdminSidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentPath={pathname}
          stats={sidebarStats}
        />

        <div className="flex flex-col flex-1 w-0 overflow-hidden">
          <AdminHeader 
            onToggleSidebar={toggleSidebar}
            onToggleDarkMode={toggleDarkMode}
            isDarkMode={isDarkMode}
            user={user}
            onLogout={handleLogout}
          />

          <main className="relative flex-1 overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      </div>
    </ProtectedAdminRoute>
  );
}