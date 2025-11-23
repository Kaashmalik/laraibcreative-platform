"use client";

import Header from '@/components/customer/Header'
import Footer from '@/components/customer/Footer'
import WhatsAppButton from '@/components/customer/WhatsAppButton'

// Force dynamic rendering for all customer pages since Header uses CartContext
export const dynamic = 'force-dynamic';

/**
 * Customer Layout Component
 * 
 * This layout wraps all customer-facing pages
 * Includes:
 * - Header with navigation
 * - Main content area
 * - Footer
 * - Floating WhatsApp button
 * - Scroll restoration
 */
export default function CustomerLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header - sticky navigation */}
      <Header />

      {/* Main content area with accessibility ID */}
      <main 
        id="main-content" 
        className="flex-1"
        role="main"
      >
        {children}
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating WhatsApp button for quick contact */}
      <WhatsAppButton />

      {/* Back to top button (shows after scrolling down) */}
      <BackToTopButton />
    </div>
  )
}

/**
 * Back to Top Button Component
 * Shows after user scrolls down 500px
 * Smooth scroll animation to top
 */
function BackToTopButton() {
  return (
    <button
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
      className="fixed bottom-24 right-6 z-40 hidden md:flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      aria-label="Back to top"
      id="back-to-top-btn"
    >
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 10l7-7m0 0l7 7m-7-7v18" 
        />
      </svg>
    </button>
  )
}

// Client-side script to show/hide back to top button
if (typeof window !== 'undefined') {
  window.addEventListener('scroll', () => {
    const btn = document.getElementById('back-to-top-btn')
    if (btn) {
      if (window.scrollY > 500) {
        btn.classList.remove('hidden')
        btn.classList.add('flex')
      } else {
        btn.classList.add('hidden')
        btn.classList.remove('flex')
      }
    }
  })
}