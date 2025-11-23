"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

/**
 * Protected Admin Route Component
 * Verifies user is authenticated and has admin role
 */
export default function ProtectedAdminRoute({ children }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Get token and user from localStorage
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
          toast.error('Please login to access admin panel');
          router.push('/admin/login');
          return;
        }

        const user = JSON.parse(userStr);

        // Verify admin role
        if (user.role !== 'admin' && user.role !== 'super-admin') {
          toast.error('Access denied. Admin privileges required.');
          router.push('/admin/login');
          return;
        }

        // User is authorized
        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check error:', error);
        toast.error('Authentication failed. Please login again.');
        router.push('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600 mb-4"></div>
          <p className="text-gray-600">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  // Show content if authorized
  if (isAuthorized) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
}
