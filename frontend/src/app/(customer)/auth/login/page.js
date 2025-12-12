"use client";

export const dynamic = 'force-dynamic';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import Link from 'next/link';

function LoginForm() {
  const { login, loading } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const returnUrl = params.get('returnUrl') || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if already logged in on mount - redirect immediately
  useEffect(() => {
    // Delay check slightly to ensure localStorage is available
    const timer = setTimeout(() => {
      try {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('user');
        
        console.log('[Login] Auth check - token:', !!token, 'user:', !!userStr);
        
        if (token && userStr) {
          const user = JSON.parse(userStr);
          const isUserAdmin = user?.role === 'admin' || user?.role === 'super-admin';
          
          console.log('[Login] User found, role:', user?.role, 'isAdmin:', isUserAdmin);
          
          // Already logged in - force redirect
          setRedirecting(true);
          const redirectTo = isUserAdmin ? '/admin/dashboard' : '/account';
          console.log('[Login] Redirecting to:', redirectTo);
          
          // Use replace to prevent back button issues
          window.location.replace(redirectTo);
          return;
        }
        
        setCheckingAuth(false);
      } catch (e) {
        console.error('[Login] Auth check error:', e);
        setCheckingAuth(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        setRedirecting(true);
        // Check user role from localStorage directly after login
        const userStr = localStorage.getItem('user');
        const userData = userStr ? JSON.parse(userStr) : null;
        const isUserAdmin = userData?.role === 'admin' || userData?.role === 'super-admin';
        const redirectTo = isUserAdmin ? '/admin/dashboard' : returnUrl;
        
        // Use window.location for immediate redirect
        window.location.href = redirectTo;
      } else {
        setError(result.error || 'Login failed');
        setSubmitting(false);
      }
    } catch (err) {
      setError(err.message || 'Login failed');
      setSubmitting(false);
    }
  };

  // Show loading while checking auth or redirecting
  if (checkingAuth || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{redirecting ? 'Redirecting to dashboard...' : 'Checking authentication...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-white px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Welcome Back</h1>
        <p className="text-sm text-gray-600 mb-6">Login to continue to LaraibCreative</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
          )}
          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-700 hover:to-purple-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
          <div className="flex items-center justify-between text-sm">
            <Link href="/auth/forgot-password" className="text-pink-600 hover:underline">Forgot password?</Link>
            <Link href="/auth/register" className="text-purple-600 hover:underline">Create account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-white px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}