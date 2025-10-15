'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  ChevronRight, 
  ChevronDown,
  Home,
  ShoppingBag,
  Sparkles,
  BookOpen,
  Info,
  Mail,
  User,
  LogIn
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

/**
 * Mobile Menu Component
 * 
 * Features:
 * - Slide-in drawer animation from left
 * - Collapsible category sections
 * - Active link highlighting
 * - User account section
 * - Smooth animations
 * - Touch-friendly targets (min 44x44px)
 * - Backdrop overlay
 */
export default function MobileMenu({ isOpen, onClose, navLinks }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [expandedMenu, setExpandedMenu] = useState(null)

  // Icons mapping for navigation
  const iconMap = {
    'Home': Home,
    'Products': ShoppingBag,
    'Custom Order': Sparkles,
    'Blog': BookOpen,
    'About': Info,
    'Contact': Mail,
  }

  // Toggle category expansion
  const toggleMenu = (menuName) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl overflow-y-auto lg:hidden"
            role="dialog"
            aria-label="Mobile navigation menu"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-playfair text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                LaraibCreative
              </h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* User Section */}
            <div className="px-6 py-4 bg-gradient-to-r from-primary-50 to-purple-50 border-b border-gray-200">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={onClose}
                  className="flex items-center space-x-3 px-4 py-3 bg-white rounded-lg hover:bg-primary-50 transition-colors"
                >
                  <LogIn className="w-5 h-5 text-primary-600" />
                  <span className="font-medium text-gray-900">Login / Register</span>
                </Link>
              )}
            </div>

            {/* Navigation Links */}
            <nav className="px-4 py-4 space-y-1" role="navigation">
              {navLinks.map((link) => {
                const Icon = iconMap[link.name] || Home
                const isActive = pathname === link.href
                const hasSubMenu = link.megaMenu && link.categories
                const isExpanded = expandedMenu === link.name

                return (
                  <div key={link.name}>
                    {/* Main Link */}
                    {hasSubMenu ? (
                      <button
                        onClick={() => toggleMenu(link.name)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{link.name}</span>
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-5 h-5" />
                        </motion.div>
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{link.name}</span>
                        </div>
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    )}

                    {/* Sub Menu */}
                    {hasSubMenu && (
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="ml-8 mt-1 space-y-1">
                              {link.categories.map((category) => (
                                <Link
                                  key={category.name}
                                  href={category.href}
                                  onClick={onClose}
                                  className="block px-4 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                >
                                  {category.name}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                )
              })}
            </nav>

            {/* User Account Links (if logged in) */}
            {user && (
              <div className="px-4 py-4 border-t border-gray-200">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Account
                </p>
                <div className="space-y-1">
                  <Link
                    href="/account/profile"
                    onClick={onClose}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={onClose}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/account/measurements"
                    onClick={onClose}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Saved Measurements
                  </Link>
                  <Link
                    href="/account/wishlist"
                    onClick={onClose}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Wishlist
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      onClose()
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}

            {/* Footer Section */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>Contact on WhatsApp</span>
              </a>
              <p className="text-xs text-gray-500 text-center mt-3">
                © 2025 LaraibCreative. All rights reserved.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}