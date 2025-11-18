import Link from 'next/link';
import { Home, Search, ShoppingBag, ArrowLeft } from 'lucide-react';

/**
 * 404 Not Found Page
 * User-friendly 404 page with navigation options
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 p-4">
      <div className="w-full max-w-2xl text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            404
          </h1>
        </div>

        {/* Error Message */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full hover:from-pink-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>

          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-pink-600 text-pink-600 rounded-full hover:bg-pink-50 transition-all duration-300"
          >
            <ShoppingBag className="w-5 h-5" />
            Browse Products
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Popular Links */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Popular Pages
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/products"
              className="text-pink-600 hover:text-pink-700 font-medium text-sm transition-colors"
            >
              Products
            </Link>
            <Link
              href="/custom-order"
              className="text-pink-600 hover:text-pink-700 font-medium text-sm transition-colors"
            >
              Custom Order
            </Link>
            <Link
              href="/blog"
              className="text-pink-600 hover:text-pink-700 font-medium text-sm transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/contact"
              className="text-pink-600 hover:text-pink-700 font-medium text-sm transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/about"
              className="text-pink-600 hover:text-pink-700 font-medium text-sm transition-colors"
            >
              About Us
            </Link>
            <Link
              href="/faq"
              className="text-pink-600 hover:text-pink-700 font-medium text-sm transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/size-guide"
              className="text-pink-600 hover:text-pink-700 font-medium text-sm transition-colors"
            >
              Size Guide
            </Link>
            <Link
              href="/track-order"
              className="text-pink-600 hover:text-pink-700 font-medium text-sm transition-colors"
            >
              Track Order
            </Link>
          </div>
        </div>

        {/* Search Suggestion */}
        <div className="mt-8">
          <p className="text-sm text-gray-500 mb-2">
            Looking for something specific?
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium"
          >
            <Search className="w-4 h-4" />
            Search Products
          </Link>
        </div>
      </div>
    </div>
  );
}
