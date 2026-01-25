/**
 * Auth Store (Zustand)
 * Unified with backend JWT authentication system
 * Uses REST API instead of tRPC for consistency with backend
 */

'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axiosInstance from '@/lib/axios';

interface User {
  id: string;
  email: string;
  fullName?: string;
  role: string;
  phone?: string;
  profileImage?: string;
  emailVerified?: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;

  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>;
  register: (userData: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    whatsapp?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

// Only create the store on the client side
export const useAuthStore = typeof window === 'undefined'
  ? // Server-side: return a mock function that returns default values
    ((selector?: any) => {
      const defaultState = {
        user: null,
        loading: false,
        isAuthenticated: false,
        isAdmin: false,
        login: async () => ({ success: false, error: 'SSR' }),
        register: async () => ({ success: false, error: 'SSR' }),
        logout: async () => {},
        checkAuth: async () => {},
        updateUser: () => {},
      };
      return selector ? selector(defaultState) : defaultState;
    }) as any
  : // Client-side: create the actual Zustand store
    create<AuthState>()(
      devtools(
        (set, get) => ({
          user: null,
          loading: false,
          isAuthenticated: false,
          isAdmin: false,

          login: async (email: string, password: string, rememberMe?: boolean) => {
            set({ loading: true });
            try {
              const response = await axiosInstance.post('/auth/login', {
                email,
                password,
                rememberMe
              }) as any;

              // Backend returns { success: true, data: { user, cart } }
              // axiosInstance interceptor returns response.data directly
              if (response.success && response.data?.user) {
                set({
                  user: response.data.user,
                  isAuthenticated: true,
                  isAdmin: response.data.user.role === 'admin' || response.data.user.role === 'super-admin',
                  loading: false
                });
                
                // Note: Cart sync removed - cart-store module not yet implemented
                // TODO: Implement cart sync when cart-store is available
                
                return response.data.user;
              }
              
              throw new Error(response.message || 'Login failed');
            } catch (error: any) {
              set({ loading: false });
              throw error;
            }
          },

          register: async (userData) => {
            set({ loading: true });
            try {
              const response = await axiosInstance.post('/auth/register', userData) as any;

              if (response.success && response.data?.user) {
                set({
                  user: response.data.user,
                  isAuthenticated: true,
                  isAdmin: response.data.user.role === 'admin' || response.data.user.role === 'super-admin',
                  loading: false,
                });
                return { success: true };
              }
              
              throw new Error(response.message || 'Registration failed');
            } catch (error: any) {
              set({ loading: false });
              return {
                success: false,
                error: error.response?.data?.message || error.message || 'Registration failed'
              };
            }
          },

          logout: async () => {
            try {
              await axiosInstance.post('/auth/logout');
            } catch (error) {
              // Log error silently - logout should not fail
              if (process.env.NODE_ENV === 'development') {
                console.error('Logout error:', error);
              }
            } finally {
              set({
                user: null,
                isAuthenticated: false,
                isAdmin: false,
              });
            }
          },

          checkAuth: async () => {
            set({ loading: true });
            try {
              const response = await axiosInstance.get('/auth/me') as any;

              if (response.success && response.data?.user) {
                set({
                  user: response.data.user,
                  isAuthenticated: true,
                  isAdmin: response.data.user.role === 'admin' || response.data.user.role === 'super-admin',
                  loading: false
                });
                
                return response.data.user;
              }
              
              throw new Error(response.message || 'Failed to fetch user');
            } catch (error: any) {
              set({
                user: null,
                isAuthenticated: false,
                isAdmin: false,
                loading: false,
              });
              throw error;
            }
          },

          updateUser: (updatedUser) => {
            const currentUser = get().user;
            if (currentUser) {
              set({
                user: { ...currentUser, ...updatedUser },
              });
            }
          },

        }),
        { name: 'AuthStore' }
      )
    );

// Analytics middleware - only on client side
if (typeof window !== 'undefined') {
  useAuthStore.subscribe(
    (state: AuthState) => {
      if (state.isAuthenticated) {
        // Track login event
        if ((window as any).gtag) {
          (window as any).gtag('event', 'login', {
            method: 'email',
          });
        }
      }
    }
  );
}

