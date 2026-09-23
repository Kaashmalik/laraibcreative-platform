'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import useAuth from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams?.get('returnUrl') || '/account'

  const { login, loading, isAuthenticated, checkAuth } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  useEffect(() => {
    // Check authentication status on mount to sync with cookie state
    if (!hasCheckedAuth) {
      checkAuth()
      setHasCheckedAuth(true)
    }
  }, [checkAuth, hasCheckedAuth])

  useEffect(() => {
    // Only redirect after we've checked auth status
    if (hasCheckedAuth && isAuthenticated) {
      router.push(returnUrl)
    }
  }, [isAuthenticated, router, returnUrl, hasCheckedAuth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const remember = (document.getElementById('remember') as HTMLInputElement)?.checked
      const result = await login(formData.email, formData.password, remember)

      if (result.success) {
        toast.success('Login successful! Redirecting...')
        router.push(returnUrl)
      } else {
        toast.error(result.error || 'Login failed. Please try again.')
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-bone flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="border border-ink/10 bg-white p-8 md:p-10">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <h1 className="font-display text-3xl tracking-[0.12em] text-ink">
                LaraibCreative
              </h1>
            </Link>
            <h2 className="font-display text-2xl text-ink mb-2">
              Welcome back
            </h2>
            <p className="text-ink/60 text-sm">
              Sign in to continue shopping
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs uppercase tracking-wider text-ink/50 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-ink/30" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-ink/15 bg-bone/40 focus:border-champagne focus:ring-0 transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs uppercase tracking-wider text-ink/50 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-ink/30" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 border border-ink/15 bg-bone/40 focus:border-champagne focus:ring-0 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink/30 hover:text-ink transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 text-champagne focus:ring-champagne border-ink/20"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-ink/70">
                  Remember me
                </label>
              </div>

              <Link
                href="/auth/forgot-password"
                className="text-sm text-champagne hover:text-ink transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full flex items-center justify-center px-4 py-3.5 text-sm font-medium tracking-wide text-bone bg-ink hover:bg-champagne hover:text-ink focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-ink/10 text-center">
            <p className="text-sm text-ink/50 mb-4">Don&apos;t have an account?</p>
            <Link
              href="/auth/register"
              className="inline-flex w-full items-center justify-center px-4 py-3 border border-ink text-sm font-medium text-ink hover:bg-ink hover:text-bone transition-colors"
            >
              Create an Account
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-ink/50 hover:text-champagne transition-colors"
          >
            <ArrowRight className="h-4 w-4 mr-1 rotate-180" />
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
