/**
 * JWT Authentication Provider
 * Handles authentication using backend JWT cookies
 * Replaces SupabaseAuthProvider for consistent auth strategy
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { trpc } from '@/lib/trpc';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  isLocked: boolean;
  phone?: string;
  whatsapp?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  whatsapp?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();
  const logoutMutation = trpc.auth.logout.useMutation();

  const isAuthenticated = !!user;

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // We'll check auth status via a protected endpoint
      // For now, we'll use tRPC to get current user
      const result = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (result.ok) {
        const userData = await result.json();
        if (userData.success && userData.data) {
          setUser(userData.data);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const result = await loginMutation.mutateAsync({
        email,
        password,
      });

      if (result.success) {
        setUser(result.user);
        toast.success('Login successful!');
        
        // Redirect to intended page or account
        const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
        router.push(returnUrl || '/account');
      } else {
        toast.error('Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      
      const result = await registerMutation.mutateAsync(userData);

      if (result.success) {
        setUser(result.user);
        toast.success('Registration successful!');
        router.push('/account');
      } else {
        toast.error('Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setUser(null);
      toast.success('Logged out successfully!');
      router.push('/');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Even if logout fails on backend, clear local state
      setUser(null);
      toast.success('Logged out successfully!');
      router.push('/');
    }
  };

  const refreshUser = async () => {
    await checkAuthStatus();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
