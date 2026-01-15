"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { Loader2 } from 'lucide-react';

/**
 * Protected Admin Route Component
 * Verifies user is authenticated and has admin role
 * Uses API call to verify auth status from cookies
 */
export default function ProtectedAdminRoute({ children }) {
  const router = useRouter();
  const [authState, setAuthState] = useState('checking');
  const hasRedirected = useRef(false);

  const checkAuth = useCallback(async () => {
    try {
      if (typeof window === 'undefined') {
        setAuthState('unauthorized');
        return;
      }

      const response = await axiosInstance.get('/auth/me');
      
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
      
      // Don't redirect if already unauthorized or if it's a 401 on login page
      const currentPath = window.location.pathname;
      if (currentPath === '/admin/login') {
        setAuthState('unauthorized');
      } else {
        setAuthState('unauthorized');
      }
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authState === 'unauthorized' && !hasRedirected.current) {
      hasRedirected.current = true;
      const timer = setTimeout(() => {
        window.location.href = '/admin/login';
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [authState]);

  if (authState === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600 mb-4" />
          <p className="text-gray-600">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (authState === 'authorized') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600 mb-4" />
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}
