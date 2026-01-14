"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

/**
 * Protected Admin Route Component
 * Verifies user is authenticated and has admin role
 * Uses API call to verify auth status from cookies
 */
export default function ProtectedAdminRoute({ children }) {
  const router = useRouter();
  const [authState, setAuthState] = useState('checking'); // 'checking' | 'authorized' | 'unauthorized'

  useEffect(() => {
    // Immediately check auth - no delay
    const checkAuth = async () => {
      try {
        // Check if we're in a browser
        if (typeof window === 'undefined') {
          setAuthState('unauthorized');
          return;
        }

        // Use API call to verify auth status (cookies are sent automatically)
        // Note: axios interceptor returns response.data directly
        const response = await axiosInstance.get('/auth/me');
        
        // Response structure: { success, data: { user } } or { success, user }
        const user = response?.data?.user || response?.user;

        if (!user) {
          console.log('[ProtectedAdminRoute] No user data in response:', response);
          setAuthState('unauthorized');
          return;
        }
        const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';

        if (!isAdmin) {
          console.log('[ProtectedAdminRoute] User is not admin:', user?.role);
          setAuthState('unauthorized');
          return;
        }

        console.log('[ProtectedAdminRoute] User authorized:', user?.email);
        setAuthState('authorized');
      } catch (error) {
        console.error('[ProtectedAdminRoute] Auth check error:', error);
        setAuthState('unauthorized');
      }
    };

    // Run immediately
    checkAuth();
  }, []);

  // Handle redirect for unauthorized
  useEffect(() => {
    if (authState === 'unauthorized') {
      // Use window.location to avoid redirect loops
      window.location.href = '/admin/login';
    }
  }, [authState]);

  // Show loading state while checking
  if (authState === 'checking') {
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
  if (authState === 'authorized') {
    return <>{children}</>;
  }

  // Redirecting...
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600 mb-4"></div>
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}
