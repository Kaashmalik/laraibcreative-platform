/**
 * Auth Hook - Supabase Version
 * Backward-compatible API using Supabase Auth
 */

'use client'

import { useAuth as useSupabaseAuth } from '@/context/SupabaseAuthContext'

export default function useAuth() {
  const {
    user,
    profile,
    isLoading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
  } = useSupabaseAuth()

  // Backward-compatible login
  const login = async (email: string, password: string) => {
    const { error } = await signIn(email, password)
    return { success: !error, error: error?.message }
  }

  // Backward-compatible register
  const register = async (userData: {
    email: string
    password: string
    fullName: string
    phone?: string
  }) => {
    const { error } = await signUp(userData.email, userData.password, userData.fullName, userData.phone)
    return { success: !error, error: error?.message }
  }

  const logout = async () => {
    await signOut()
  }

  return {
    user: profile || (user ? { id: user.id, email: user.email } : null),
    loading: isLoading,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    login,
    register,
    logout,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
    checkAuth: refreshProfile,
    setToken: () => {},
  }
}

export { useAuth as useAuthHook }
