'use client';


import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setAuthToken, clearAuthToken } from '@/lib/axios';

const AuthContext = createContext(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token with backend (uses /auth/me endpoint)
      const response = await api.auth.verifyToken();
      // Backend returns: { success: true, data: { user: {...} } }
      const user = response.data?.user || response.user;
      if (user) {
        setUser(user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.auth.login(email, password);

      // Backend returns: { success: true, data: { user: {...}, tokens: { accessToken, refreshToken } } }
      const user = response.data?.user || response.user;
      const token = response.data?.tokens?.accessToken || response.tokens?.accessToken || response.token;

      // Store token
      if (token) {
        setAuthToken(token);
      }
      if (user) {
        setUser(user);
      }

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.auth.register(userData);

      // Backend returns: { success: true, data: { user: {...}, tokens: { accessToken, refreshToken } } }
      const user = response.data?.user || response.user;
      const token = response.data?.tokens?.accessToken || response.tokens?.accessToken || response.token;

      // Auto login after registration
      if (token) {
        setAuthToken(token);
      }
      if (user) {
        setUser(user);
      }

      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific error cases
      const status = error.response?.status;
      const errorData = error.response?.data;
      let message = errorData?.message || error.message || 'Registration failed';
      
      // Check for email/phone conflicts (409 status)
      if (status === 409) {
        return { 
          success: false, 
          error: message,
          conflictType: errorData?.conflictType || 'email', // 'email' or 'phone'
          conflictField: errorData?.conflictField || 'email'
        };
      }
      
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        // Notify backend about logout
        await api.auth.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of backend response
      clearAuthToken();
      setUser(null);
      router.push('/');
    }
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}