"use client";

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';
import Link from 'next/link';

/**
 * Global Error Page Component
 * Handles errors in the app directory
 */
export default function Error({ error, reset }) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error:', error);
    }

    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined' && window.errorReporter) {
      window.errorReporter.captureException(error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-100 p-4">
            <AlertTriangle className="h-16 w-16 text-red-600" aria-hidden="true" />
          </div>
        </div>

        {/* Error Title */}
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
          Oops! Something went wrong
        </h1>

        {/* Error Message */}
        <p className="text-center text-gray-600 mb-6">
          {process.env.NODE_ENV === 'development' && error?.message
            ? error.message
            : 'We encountered an unexpected error. Our team has been notified and is working on a fix.'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full hover:from-pink-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-pink-600 text-pink-600 rounded-full hover:bg-pink-50 transition-all duration-300"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>

          <a
            href="mailto:support@laraibcreative.business?subject=Error Report"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-all duration-300"
          >
            <Mail className="w-5 h-5" />
            Contact Support
          </a>
        </div>

        {/* Development Error Details */}
        {process.env.NODE_ENV === 'development' && error?.stack && (
          <details className="mt-8 rounded-lg bg-gray-50 p-4 border border-gray-200">
            <summary className="cursor-pointer font-medium text-gray-700 mb-2">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-red-50 p-4 text-xs text-red-900 max-h-64">
              {error.stack}
            </pre>
          </details>
        )}

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            If this problem persists, please{' '}
            <a
              href="/contact"
              className="text-pink-600 hover:text-pink-700 font-medium underline"
            >
              contact our support team
            </a>
            {' '}or call us at{' '}
            <a
              href="tel:03020718182"
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              0302-0718182
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
