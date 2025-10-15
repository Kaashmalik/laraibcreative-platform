'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  ChevronDown,
  Heart,
  Package,
  LogOut,
  Settings,
  MessageCircle
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import MobileMenu from './MobileMenu'
import SearchBar from './SearchBar'
import MiniCart from './MiniCart'

/**
 * Header Component
 * 
 * Features:
 * - Responsive design (desktop/mobile)
 * - Sticky header with shrink animation on scroll
 * - Category mega menu
 * - Search functionality
 * - Cart with item count badge
 * - User account dropdown
 * - Mobile hamburger menu
 * - WhatsApp quick contact
 * - Smooth animations
 * - Accessibility features
 */
export default function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { cartItems, cartCount } = useCart()
  
  // UI States
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [openMegaMenu, setOpenMegaMenu] = useState(null)

  // Handle scroll for sticky header with shrink effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsSearchOpen(false)
    setIsCartOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  // Navigation links
  const navLinks = [
    { name: 'Home', href: '/' },
    { 
      name: 'Products', 
      href: '/products',
      megaMenu: true,
      categories: [
        { name: 'Bridal Wear', href: '/products?category=bridal' },
        { name: 'Party Wear', href: '/products?category=party' },
        { name: 'Casual Wear', href: '/products?category=casual' },
        { name: 'Formal Wear', href: '/products?category=formal' },
        { name: 'Designer Replicas', href: '/products?category=designer' },
      ]
    },
    { name: 'Custom Order', href: '/custom-order' },
    { name: 'Blog', href: '/blog' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  // User menu items
  const userMenuItems = [
    { icon: User, label: 'Profile', href: '/account/profile' },
    { icon: Package, label: 'Orders', href: '/account/orders' },
    { icon: Heart, label: 'Wishlist', href: '/account/wishlist' },
    { icon: Settings, label: 'Settings', href: '/account/settings' },
  ]

  return (
    <>
      {/* Main Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg py-3'
            : 'bg-white py-4'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-700 hover:text-primary-600 transition-colors"
              aria-label="Open menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              aria-label="LaraibCreative Home"
            >
              <Image
                src="/images/logo.svg"
                alt="LaraibCreative Logo"
                width={isScrolled ? 40 : 48}
                height={isScrolled ? 40 : 48}
                className="transition-all duration-300"
                priority
              />
              <span className="font-playfair text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                LaraibCreative
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8" role="navigation">
              {navLinks.map((link) => (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => link.megaMenu && setOpenMegaMenu(link.name)}
                  onMouseLeave={() => setOpenMegaMenu(null)}
                >
                  <Link
                    href={link.href}
                    className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary-600 ${
                      pathname === link.href
                        ? 'text-primary-600'
                        : 'text-gray-700'
                    }`}
                  >
                    <span>{link.name}</span>
                    {link.megaMenu && (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Link>

                  {/* Mega Menu */}
                  {link.megaMenu && (
                    <AnimatePresence>
                      {openMegaMenu === link.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2"
                        >
                          {link.categories.map((category) => (
                            <Link
                              key={category.name}
                              href={category.href}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                            >
                              {category.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search Button - Desktop shows bar, Mobile shows icon */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-700 hover:text-primary-600 transition-colors hidden sm:block"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* WhatsApp Quick Contact */}
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors text-sm font-medium"
                aria-label="Contact on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
                aria-label={`Shopping cart with ${cartCount} items`}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary-600 rounded-full"
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </motion.span>
                )}
              </button>

              {/* User Account */}
              <div className="relative">
                {user ? (
                  <>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 p-2 text-gray-700 hover:text-primary-600 transition-colors"
                      aria-label="User account menu"
                      aria-expanded={isUserMenuOpen}
                    >
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-600">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 hidden sm:block" />
                    </button>

                    {/* User Dropdown */}
                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2"
                        >
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>

                          {userMenuItems.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <item.icon className="w-4 h-4" />
                              <span>{item.label}</span>
                            </Link>
                          ))}

                          <button
                            onClick={() => {
                              logout()
                              setIsUserMenuOpen(false)
                            }}
                            className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden sm:inline">Login</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navLinks={navLinks}
      />

      {/* Search Modal */}
      <SearchBar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Mini Cart Drawer */}
      <MiniCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* Overlay for dropdowns (mobile) */}
      {(isUserMenuOpen || isCartOpen || isSearchOpen) && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => {
            setIsUserMenuOpen(false)
            setIsCartOpen(false)
            setIsSearchOpen(false)
          }}
        />
      )}
    </>
  )
}