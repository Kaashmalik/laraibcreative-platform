"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Mail, Loader2, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import useAuth from '@/hooks/useAuth';


function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAuth } = useAuth();
  
  const [status, setStatus] = useState('verifying'); // verifying, success, error, expired
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing. Please check your email and use the verification link provided.');
        return;
      }

      try {
        const response = await api.auth.verifyEmail(token);
        
        if (response.success) {
          setStatus('success');
          setMessage(response.message || 'Email verified successfully! You now have full access to your account.');
          
          // Refresh user data to get updated emailVerified status
          setTimeout(() => {
            checkAuth();
          }, 1000);
        } else {
          setStatus('error');
          setMessage(response.message || 'Email verification failed. Please try again.');
        }
      } catch (error) {
        console.error('Email verification error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Email verification failed.';
        
        // Check if token is expired
        if (errorMessage.includes('expired') || errorMessage.includes('Invalid')) {
          setStatus('expired');
          setMessage(errorMessage);
        } else {
          setStatus('error');
          setMessage(errorMessage);
        }
      }
    };

    verifyEmail();
  }, [searchParams, checkAuth]);

  const handleResendVerification = async () => {
    setResending(true);
    try {
      const response = await api.auth.resendVerification();
      if (response.success) {
        setMessage('Verification email sent successfully! Please check your inbox.');
        setStatus('verifying');
      } else {
        setMessage(response.message || 'Failed to resend verification email. Please try again.');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to resend verification email.';
      
      // If user is not authenticated, guide them to login
      if (error.response?.status === 401) {
        setMessage('Please login first to resend verification email.');
      } else {
        setMessage(errorMessage);
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-white px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        {/* Verifying State */}
        {status === 'verifying' && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="w-16 h-16 text-purple-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900">Verifying Your Email</h1>
            <p className="text-gray-600">Please wait while we verify your email address...</p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900">Email Verified!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                href="/account"
                className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition shadow-md"
              >
                Go to My Account
              </Link>
              <Link
                href="/"
                className="block w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900">Verification Failed</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={handleResendVerification}
                disabled={resending}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {resending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Resend Verification Email
                  </>
                )}
              </button>
              <Link
                href="/auth/login"
                className="block w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
              >
                Go to Login
              </Link>
            </div>
          </div>
        )}

        {/* Expired Token State */}
        {status === 'expired' && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-orange-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900">Verification Link Expired</h1>
            <p className="text-gray-600 mb-6">
              {message || 'This verification link has expired. Please request a new verification email.'}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleResendVerification}
                disabled={resending}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {resending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Resend Verification Email
                  </>
                )}
              </button>
              <Link
                href="/auth/login"
                className="block w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
              >
                Go to Login
              </Link>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Need help?{' '}
            <Link href="/contact" className="text-purple-600 hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-white px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

