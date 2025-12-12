/**
 * Auth Hook - LocalStorage Version
 * Works with admin panel's existing localStorage-based auth
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'

interface User {
  id: string
  email: string
  fullName?: string
  role: string
  phone?: string
}

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Load auth state from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      const userStr = localStorage.getItem('user')
      
      if (token && userStr) {
        const userData = JSON.parse(userStr)
        setUser(userData)
        setIsAuthenticated(true)
        setIsAdmin(userData.role === 'admin' || userData.role === 'super-admin')
      }
    } catch (error) {
      console.error('Error loading auth state:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await api.auth.login(email, password)
      
      if (response.success && response.data) {
        const { user: userData, tokens } = response.data
        
        // Store in localStorage
        localStorage.setItem('auth_token', tokens.accessToken)
        localStorage.setItem('refresh_token', tokens.refreshToken)
        localStorage.setItem('user', JSON.stringify(userData))
        
        setUser(userData)
        setIsAuthenticated(true)
        setIsAdmin(userData.role === 'admin' || userData.role === 'super-admin')
        
        return { success: true }
      } else {
        return { success: false, error: response.message || 'Login failed' }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed'
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (userData: { email: string; password: string; fullName: string; phone?: string }) => {
    setLoading(true)
    try {
      const response = await api.auth.register(userData)
      
      if (response.success && response.data) {
        const { user: newUser, tokens } = response.data
        
        localStorage.setItem('auth_token', tokens.accessToken)
        localStorage.setItem('refresh_token', tokens.refreshToken)
        localStorage.setItem('user', JSON.stringify(newUser))
        
        setUser(newUser)
        setIsAuthenticated(true)
        setIsAdmin(false)
        
        return { success: true }
      } else {
        return { success: false, error: response.message || 'Registration failed' }
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.auth.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      setUser(null)
      setIsAuthenticated(false)
      setIsAdmin(false)
    }
  }, [])

  const checkAuth = useCallback(async () => {
    if (typeof window === 'undefined') return
    
    const token = localStorage.getItem('auth_token')
    const userStr = localStorage.getItem('user')
    
    if (token && userStr) {
      const userData = JSON.parse(userStr)
      setUser(userData)
      setIsAuthenticated(true)
      setIsAdmin(userData.role === 'admin' || userData.role === 'super-admin')
    }
  }, [])

  return {
    user,
    loading,
    isLoading: loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    checkAuth,
    updateUser: setUser,
    setToken: () => {},
    // Compatibility aliases
    signIn: async (email: string, password: string) => {
      const result = await login(email, password)
      return { error: result.success ? null : { message: result.error } }
    },
    signUp: async (email: string, password: string, fullName: string, phone?: string) => {
      const result = await register({ email, password, fullName, phone })
      return { error: result.success ? null : { message: result.error } }
    },
    signOut: logout,
    resetPassword: async () => ({ error: null }),
    updatePassword: async () => ({ error: null }),
    updateProfile: async () => ({ error: null }),
    refreshProfile: checkAuth,
  }
}

export { useAuth as useAuthHook }
