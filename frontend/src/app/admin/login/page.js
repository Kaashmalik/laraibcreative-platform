"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const hasRedirected = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/dashboard';
    }
  }, []);

  // Check if already logged in as admin
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.auth.verifyToken();
        const user = response?.data?.user || response?.user;
        
        if (user && (user.role === 'admin' || user.role === 'super-admin')) {
          // Already logged in as admin - redirect to dashboard
          toast.success(`Welcome back, ${user.fullName || user.email}!`);
          hasRedirected();
          return;
        }
      } catch (e) {
        // Token expired or invalid - show login form
        console.log('Auth check failed (expected for non-logged in users):', e.message);
      }
      setCheckingAuth(false);
    };

    checkAuth();
  }, [hasRedirected]);

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call admin login endpoint - axios interceptor returns response.data
      const response = await api.auth.adminLogin(credentials.email, credentials.password);
      
      console.log('🔍 Full response:', response);
      
      // Handle response - axios interceptor already unwrapped response.data
      // So response is already the backend's {success, message, data} object
      const { success, message, data } = response;
      
      console.log('📦 Extracted:', { success, hasMessage: !!message, hasData: !!data });
      
      if (success && data) {
        const { user, tokens } = data;
        
        console.log('✅ Login successful:', { 
          userId: user._id || user.id, 
          role: user.role,
          email: user.email 
        });
        
        // Verify user is admin
        if (user.role !== 'admin' && user.role !== 'super-admin') {
          toast.error('Access denied. Admin privileges required.');
          setError('You do not have admin access.');
          setIsLoading(false);
          return;
        }

        // Tokens are set as httpOnly cookies by backend
        // No need to store in localStorage
        toast.success(`Welcome back, ${user.fullName || user.email}!`);
        
        // Force redirect to admin dashboard using window.location
        // router.push doesn't work reliably here
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 500);
      } else {
        const errorMessage = message || 'Login failed. Please try again.';
        console.error('❌ Login failed:', { success, message, data });
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error('❌ Admin login error:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response,
        stack: err.stack
      });
      const errorMessage = err.response?.data?.message || err.message || 'Invalid email or password.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 m-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-gray-600">Sign in to access the dashboard</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="email"
            label="Admin Email"
            placeholder="admin@laraibcreative.studio"
            value={credentials.email}
            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
            required
            disabled={isLoading}
            autoComplete="email"
          />
          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            required
            disabled={isLoading}
            autoComplete="current-password"
          />
          
          <Button 
            type="submit" 
            className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 text-lg font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Protected by secure authentication
          </p>
        </div>
      </div>
    </div>
  );
}