'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import LoadingScreen from '@/components/shared/LoadingScreen';

// Disable static generation for all admin pages
export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Mock auth check - Replace with actual auth hook
  // Example: const { user, isAuthenticated, role } = useAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication and admin role
    const checkAuth = async () => {
      try {
        // Replace with actual API call to verify admin token
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          // Not authenticated - redirect to admin login
          router.push('/admin/login');
          return;
        }

        // Verify token and get user data
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Invalid token');
        }

        const userData = await response.json();

        // Check if user has admin role
        if (userData.role !== 'admin' && userData.role !== 'super_admin') {
          // Not authorized - redirect to customer area
          router.push('/');
          return;
        }

        setUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };

    // Skip auth check for login page
    if (pathname === '/admin/login') {
      setIsLoading(false);
      return;
    }

    checkAuth();
  }, [pathname, router]);

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
    return <div className="min-h-screen">{children}</div>;
  }

  return (
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
  );
}