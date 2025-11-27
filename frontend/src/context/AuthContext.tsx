'use client'

/**
 * Auth Context - Phase 2
 * Handles authentication with Supabase
 */

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import { syncCartToSupabase, loadCartFromSupabase } from '@/store/cart-store'
import { syncWishlistToSupabase, loadWishlistFromSupabase } from '@/store/wishlist-store'

// Types
export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: 'customer' | 'admin' | 'super-admin'
  customer_type: 'new' | 'returning' | 'vip'
  profile_image: string | null
  loyalty_points: number
  referral_code: string | null
  is_active: boolean
  created_at: string
}

export interface SignUpData {
  email: string
  password: string
  fullName: string
  phone?: string
  referralCode?: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  isAdmin: boolean
  isAuthenticated: boolean
  
  // Auth methods
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (data: SignUpData) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updatePassword: (password: string) => Promise<{ error: Error | null }>
  
  // Profile methods
  updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const supabase = createClient()

  // Fetch user profile
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    
    setProfile(data)
    return data
  }, [supabase])

  // Sync user data on login
  const handleUserLogin = useCallback(async (userId: string) => {
    await fetchProfile(userId)
    
    // Sync cart and wishlist
    try {
      await Promise.all([
        loadCartFromSupabase(userId),
        loadWishlistFromSupabase(userId)
      ])
    } catch (error) {
      console.error('Error syncing user data:', error)
    }
  }, [fetchProfile])

  // Handle user logout
  const handleUserLogout = useCallback(async (userId?: string) => {
    // Sync cart and wishlist before logout
    if (userId) {
      try {
        await Promise.all([
          syncCartToSupabase(userId),
          syncWishlistToSupabase(userId)
        ])
      } catch (error) {
        console.error('Error syncing before logout:', error)
      }
    }
    
    setUser(null)
    setProfile(null)
    setSession(null)
  }, [])

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          setSession(session)
          await handleUserLogin(session.user.id)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (event === 'SIGNED_IN' && session?.user) {
          await handleUserLogin(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          await handleUserLogout()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, handleUserLogin, handleUserLogout])

  // Sign in with email/password
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? new Error(error.message) : null }
  }

  // Sign up
  const signUp = async (data: SignUpData) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          phone: data.phone,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      return { error: new Error(error.message) }
    }

    // Profile is created automatically via database trigger
    // Process referral if provided
    if (data.referralCode && authData.user) {
      try {
        await supabase.rpc('process_referral', {
          referral_code: data.referralCode,
          new_user_id: authData.user.id
        } as any)
      } catch (e) {
        console.error('Referral processing failed:', e)
      }
    }

    return { error: null }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  // Sign out
  const signOut = async () => {
    const userId = user?.id
    await supabase.auth.signOut()
    await handleUserLogout(userId)
  }

  // Reset password
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { error: error ? new Error(error.message) : null }
  }

  // Update password
  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    return { error: error ? new Error(error.message) : null }
  }

  // Update profile
  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('profiles')
      .update(data)
      .eq('id', user.id)

    if (!error) {
      await fetchProfile(user.id)
    }

    return { error: error ? new Error(error.message) : null }
  }

  // Refresh profile
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super-admin'
  const isAuthenticated = !!user && !!session

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isAdmin,
        isAuthenticated,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Hook for protected routes
export function useRequireAuth(redirectTo = '/login') {
  const { isAuthenticated, isLoading } = useAuth()
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = `${redirectTo}?redirect=${encodeURIComponent(window.location.pathname)}`
    }
  }, [isAuthenticated, isLoading, redirectTo])

  return { isAuthenticated, isLoading }
}

// Hook for admin routes
export function useRequireAdmin(redirectTo = '/') {
  const { isAdmin, isLoading, isAuthenticated } = useAuth()
  
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      window.location.href = redirectTo
    }
  }, [isAdmin, isAuthenticated, isLoading, redirectTo])

  return { isAdmin, isLoading }
}
