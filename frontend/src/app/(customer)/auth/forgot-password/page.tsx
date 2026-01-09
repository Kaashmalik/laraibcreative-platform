'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import axiosInstance from '@/lib/axios'
import { toast } from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await axiosInstance.post('/auth/forgot-password', { email })
      setIsSuccess(true)
      toast.success('Password reset email sent!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset email. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <div className="mb-6">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-primary-gold transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
          </div>

          {!isSuccess ? (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-primary-rose" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Forgot Your Password?
                </h2>
                <p className="text-gray-600">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-gold hover:bg-primary-rose focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Check Your Email
              </h2>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => {
                    setIsSuccess(false)
                    setIsSubmitting(false)
                  }}
                  className="text-primary-gold hover:underline font-medium"
                >
                  try again
                </button>
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Link>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-primary-gold transition-colors"
          >
            <ArrowRight className="h-4 w-4 mr-1 rotate-180" />
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
