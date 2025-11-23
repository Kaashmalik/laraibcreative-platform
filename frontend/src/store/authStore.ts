/**
 * Auth Store (Zustand)
 * Replaces AuthContext with Zustand for better performance
 */

'use client';


import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import { vanillaTrpc as trpc } from '@/lib/trpc';

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

// Only create the store on the client side
export const useAuthStore = typeof window === 'undefined' 
  ? // Server-side: return a mock function that returns default values
    ((selector?: any) => {
      const defaultState = {
        user: null,
        token: null,
        loading: false,
        isAuthenticated: false,
        isAdmin: false,
        login: async () => ({ success: false, error: 'SSR' }),
        register: async () => ({ success: false, error: 'SSR' }),
        logout: async () => {},
        checkAuth: async () => {},
        updateUser: () => {},
        setToken: () => {},
      };
      return selector ? selector(defaultState) : defaultState;
    }) as any
  : // Client-side: create the actual Zustand store
    create<AuthState>()(
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
                
                set({
                  user: result.user,
                  token: result.token,
                  isAuthenticated: true,
                  isAdmin: result.user.role === 'admin' || result.user.role === 'super-admin',
                  loading: false,
                });
                return { success: true };
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
                
                set({
                  user: result.user,
                  token: result.token,
                  isAuthenticated: true,
                  isAdmin: false,
                  loading: false,
                });
                return { success: true };
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

