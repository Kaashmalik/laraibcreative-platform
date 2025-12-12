"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Protected Admin Route Component
 * Verifies user is authenticated and has admin role
 * Uses localStorage directly to avoid hook timing issues
 */
export default function ProtectedAdminRoute({ children }) {
  const router = useRouter();
  const [authState, setAuthState] = useState('checking'); // 'checking' | 'authorized' | 'unauthorized'

  useEffect(() => {
    // Immediately check auth - no delay
    const checkAuth = () => {
      try {
        // Check if we're in a browser
        if (typeof window === 'undefined') {
          setAuthState('unauthorized');
          return;
        }

        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
          console.log('[ProtectedAdminRoute] No token or user found');
          setAuthState('unauthorized');
          return;
        }

        let user;
        try {
          user = JSON.parse(userStr);
        } catch (parseError) {
          console.log('[ProtectedAdminRoute] Invalid user data, clearing');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
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
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
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
