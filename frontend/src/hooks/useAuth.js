/**
 * Custom hook for authentication
 * Uses Zustand store for auth state management (no provider needed)
 * 
 * @module hooks/useAuth
 * @returns {Object} Authentication state with user, login, logout, and loading state
 * 
 * @example
 * import useAuth from '@/hooks/useAuth'
 * 
 * function MyComponent() {
 *   const { user, login, logout, loading } = useAuth()
 *   
 *   if (loading) return <Spinner />
 *   
 *   return (
 *     <div>
 *       {user ? (
 *         <button onClick={logout}>Logout {user.fullName || user.email}</button>
 *       ) : (
 *         <button onClick={() => login(email, password)}>Login</button>
 *       )}
 *     </div>
 *   )
 * }
 */

'use client';


import { useAuthStore } from '@/store/authStore';

export default function useAuth() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const updateUser = useAuthStore((state) => state.updateUser);
  const setToken = useAuthStore((state) => state.setToken);

  return {
    user,
    loading,
    isLoading: loading, // Alias for backward compatibility
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    checkAuth,
    updateUser,
    setToken,
  };
}