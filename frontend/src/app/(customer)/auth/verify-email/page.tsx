'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react'
import axiosInstance from '@/lib/axios'
import { toast } from 'react-hot-toast'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [isVerifying, setIsVerifying] = useState(!!token)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isExpired, setIsExpired] = useState(false)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    }
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    try {
      await axiosInstance.get(`/auth/verify-email/${verificationToken}`)
      setIsSuccess(true)
      toast.success('Email verified successfully!')
    } catch (error: any) {
      if (error.response?.status === 400 || error.response?.status === 404) {
        setIsExpired(true)
        toast.error('Verification link expired or invalid')
      } else {
        toast.error('Failed to verify email. Please try again.')
      }
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendVerification = async () => {
    setIsResending(true)
    try {
      await axiosInstance.post('/auth/resend-verification')
      toast.success('Verification email sent! Please check your inbox.')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send verification email')
    } finally {
      setIsResending(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 text-primary-gold animate-spin" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Verifying Your Email
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your email address...
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Email Verified Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Your email has been verified. You can now access all features of your account.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-gold hover:bg-primary-rose transition-all"
            >
              Go to Login
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  if (isExpired || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {isExpired ? 'Verification Link Expired' : 'Invalid Verification Link'}
            </h2>
            <p className="text-gray-600 mb-6">
              {isExpired
                ? 'The verification link has expired. Please request a new one to verify your email.'
                : 'The verification link is invalid. Please check your email for the correct link.'}
            </p>
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-gold hover:bg-primary-rose focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              {isResending ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Resend Verification Email
                </>
              )}
            </button>
            <Link
              href="/auth/login"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center">
          <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-primary-rose" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-600 mb-6">
            Please check your email inbox and click the verification link to activate your account.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Didn't receive the email? Check your spam folder or request a new one.
          </p>
          <button
            onClick={handleResendVerification}
            disabled={isResending}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-gold hover:bg-primary-rose focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3"
          >
            {isResending ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5 mr-2" />
                Resend Verification Email
              </>
            )}
          </button>
          <Link
            href="/auth/login"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
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
