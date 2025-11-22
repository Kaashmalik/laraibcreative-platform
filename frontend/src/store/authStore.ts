/**
 * Auth Store (Zustand)
 * Replaces AuthContext with Zustand for better performance
 */

import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import { trpc } from '@/lib/trpc';

interface User {
  id: string;
  email: string;
  fullName?: string;
  role: string;
  phone?: string;
  profileImage?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        loading: false,
        isAuthenticated: false,
        isAdmin: false,

        login: async (email, password) => {
          set({ loading: true });
          try {
            // Use tRPC for login
            const result = await trpc.auth.login.mutate({ email, password });
            
            if (result.success) {
              set({
                user: result.user,
                token: result.token,
                isAuthenticated: true,
                isAdmin: result.user.role === 'admin' || result.user.role === 'super-admin',
                loading: false,
              });
              return { success: true };
            } else {
              set({ loading: false });
              return { success: false, error: result.error };
            }
          } catch (error: any) {
            set({ loading: false });
            return { 
              success: false, 
              error: error.message || 'Login failed' 
            };
          }
        },

        register: async (userData) => {
          set({ loading: true });
          try {
            const result = await trpc.auth.register.mutate(userData);
            
            if (result.success) {
              set({
                user: result.user,
                token: result.token,
                isAuthenticated: true,
                isAdmin: false,
                loading: false,
              });
              return { success: true };
            } else {
              set({ loading: false });
              return { success: false, error: result.error };
            }
          } catch (error: any) {
            set({ loading: false });
            return { 
              success: false, 
              error: error.message || 'Registration failed' 
            };
          }
        },

        logout: async () => {
          try {
            await trpc.auth.logout.mutate();
          } catch (error) {
            console.error('Logout error:', error);
          } finally {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isAdmin: false,
            });
          }
        },

        checkAuth: async () => {
          set({ loading: true });
          try {
            const user = await trpc.auth.me.query();
            set({
              user,
              isAuthenticated: true,
              isAdmin: user.role === 'admin' || user.role === 'super-admin',
              loading: false,
            });
          } catch (error) {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isAdmin: false,
              loading: false,
            });
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

        setToken: (token) => {
          set({ token });
        },
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          token: state.token,
          user: state.user,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);

// Analytics middleware
useAuthStore.subscribe(
  (state) => state.isAuthenticated,
  (isAuthenticated) => {
    if (typeof window !== 'undefined' && isAuthenticated) {
      // Track login event
      if (window.gtag) {
        window.gtag('event', 'login', {
          method: 'email',
        });
      }
    }
  }
);

