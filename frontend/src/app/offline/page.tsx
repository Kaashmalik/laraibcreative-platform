/**
 * Offline Page
 * Displayed when user is offline and requested page is not cached
 */

import Link from 'next/link';

export const metadata = {
  title: 'You are Offline | LaraibCreative',
  description: 'No internet connection available',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full mx-auto p-8 text-center">
        {/* Offline Icon */}
        <div className="mb-8">
          <svg
            className="w-24 h-24 mx-auto text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          You're Offline
        </h1>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          It looks like you've lost your internet connection. Please check your network 
          settings and try again.
        </p>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium 
                       hover:bg-primary-dark transition-colors focus:outline-none 
                       focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="block w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 
                       text-gray-700 dark:text-gray-200 rounded-lg font-medium 
                       hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Go to Home (Cached)
          </Link>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          Some pages may still be available from cache. Try browsing previously visited pages.
        </p>

        {/* Offline Features */}
        <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="font-medium text-gray-900 dark:text-white mb-2">
            Available Offline:
          </h2>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li>✓ Previously viewed products</li>
            <li>✓ Your saved cart items</li>
            <li>✓ Wishlist</li>
            <li>✓ Account settings</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

