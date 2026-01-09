/**
 * Auth Hook - Unified JWT Authentication
 * Uses Zustand authStore with httpOnly cookies for secure authentication
 * Works with backend JWT authentication system
 */

'use client'

import { useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'

interface User {
  id: string
  email: string
  fullName?: string
  role: string
  phone?: string
  profileImage?: string
}

export default function useAuth() {
  const {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    checkAuth,
    updateUser,
  } = useAuthStore()

  const loginWrapper = useCallback(async (email: string, password: string) => {
    const result = await login(email, password)
    return result
  }, [login])

  const registerWrapper = useCallback(async (userData: { email: string; password: string; fullName: string; phone?: string; whatsapp?: string }) => {
    const result = await register(userData)
    return result
  }, [register])

  const logoutWrapper = useCallback(async () => {
    await logout()
  }, [logout])

  const checkAuthWrapper = useCallback(async () => {
    await checkAuth()
  }, [checkAuth])

  return {
    user,
    loading,
    isLoading: loading,
    isAuthenticated,
    isAdmin,
    login: loginWrapper,
    register: registerWrapper,
    logout: logoutWrapper,
    checkAuth: checkAuthWrapper,
    updateUser,
    setToken: () => {}, // Not needed - cookies handle tokens
    // Compatibility aliases
    signIn: async (email: string, password: string) => {
      const result = await loginWrapper(email, password)
      return { error: result.success ? null : { message: result.error } }
    },
    signUp: async (email: string, password: string, fullName: string, phone?: string) => {
      const result = await registerWrapper({ email, password, fullName, phone })
      return { error: result.success ? null : { message: result.error } }
    },
    signOut: logoutWrapper,
    resetPassword: async () => ({ error: null }),
    updatePassword: async () => ({ error: null }),
    updateProfile: async () => ({ error: null }),
    refreshProfile: checkAuthWrapper,
  }
}

export { useAuth as useAuthHook }
