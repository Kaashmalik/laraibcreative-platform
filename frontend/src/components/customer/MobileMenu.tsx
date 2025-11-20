'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  LogIn,
  LogOut,
  Package,
  Heart,
  MapPin,
  MessageCircle,
  Settings
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { MobileMenuProps } from '@/types/navigation';

/**
 * MobileMenu Component - Production Ready
 * 
 * Features:
 * - Slide-in drawer from left with smooth animations
 * - Full-screen overlay on mobile
 * - Collapsible category sections
 * - Active link highlighting
 * - User account section
 * - Touch-friendly targets (min 44x44px)
 * - Backdrop overlay with blur
 * - Focus trap when open
 * - Escape key to close
 * - Keyboard navigation
 * - Dark mode support
 * 
 * @component
 */
export default function MobileMenu({ isOpen, onClose, navLinks }: MobileMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Icons mapping for navigation
  const iconMap: Record<string, typeof Home> = {
    'Home': Home,
    'Products': ShoppingBag,
    'Custom Order': Sparkles,
    'Blog': BookOpen,
    'About': Info,
    'Contact': Mail,
  };

  // Store previous focus when menu opens
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [isOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Focus trap - keep focus within menu when open
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const focusableElements = menuRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    menuRef.current.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      menuRef.current?.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen]);

  // Toggle category expansion
  const toggleMenu = useCallback((menuName: string) => {
    setExpandedMenu(prev => prev === menuName ? null : menuName);
  }, []);

  // Handle logout with loading state
  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      await logout();
      onClose();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout, onClose, router, isLoggingOut]);

  // Memoized link click handler
  const handleLinkClick = useCallback(() => {
    onClose();
    setExpandedMenu(null);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            onClick={onClose}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onClose();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Close menu"
            aria-hidden="true"
          />

          {/* Drawer with optimized animations */}
          <motion.aside
            ref={menuRef}
            id="mobile-menu"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ 
              type: 'spring', 
              damping: 30, 
              stiffness: 300,
              mass: 0.8
            }}
            className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-gray-900 z-50 shadow-2xl overflow-y-auto lg:hidden flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            {/* Header with gradient */}
            <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-700 dark:to-purple-700 px-6 py-4 flex items-center justify-between z-10 shadow-md">
              <h2 className="font-playfair text-xl font-bold text-white">
                LaraibCreative
              </h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close navigation menu"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>

            {/* User Section with enhanced design */}
            <div className="px-6 py-4 bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-purple-600 dark:from-primary-500 dark:to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xl shadow-lg">
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div 
                      className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" 
                      aria-label="Online status" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 truncate text-base">
                      {user.name || 'User'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {user.email || ''}
                    </p>
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={handleLinkClick}
                  className="flex items-center space-x-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl hover:bg-primary-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow group focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
                >
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center group-hover:bg-primary-200 dark:group-hover:bg-primary-800 transition-colors">
                    <LogIn className="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-900 dark:text-gray-100 block">Login / Register</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Access your account</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" aria-hidden="true" />
                </Link>
              )}
            </div>

            {/* Navigation Links with improved UX */}
            <nav className="px-4 py-4 space-y-1 flex-1 overflow-y-auto" role="navigation" aria-label="Mobile navigation">
              {navLinks.map((link) => {
                const Icon = iconMap[link.name] || Home;
                const isActive = pathname === link.href;
                const hasSubMenu = link.megaMenu && link.categories;
                const isExpanded = expandedMenu === link.name;

                return (
                  <div key={link.name}>
                    {/* Main Link */}
                    {hasSubMenu ? (
                      <button
                        onClick={() => toggleMenu(link.name)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all min-h-[44px] ${
                          isActive
                            ? 'bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-500 dark:to-purple-500 text-white shadow-md'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700'
                        }`}
                        aria-expanded={isExpanded}
                        aria-controls={`submenu-${link.name}`}
                        aria-label={`${link.name} menu`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5" aria-hidden="true" />
                          <span className="font-medium">{link.name}</span>
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-5 h-5" aria-hidden="true" />
                        </motion.div>
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        onClick={handleLinkClick}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all min-h-[44px] ${
                          isActive
                            ? 'bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-500 dark:to-purple-500 text-white shadow-md'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5" aria-hidden="true" />
                          <span className="font-medium">{link.name}</span>
                        </div>
                        <ChevronRight className="w-5 h-5" aria-hidden="true" />
                      </Link>
                    )}

                    {/* Sub Menu with smooth animation */}
                    {hasSubMenu && (
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            id={`submenu-${link.name}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                            role="menu"
                            aria-label={`${link.name} submenu`}
                          >
                            <div className="ml-8 mt-1 space-y-1 pb-2">
                              {link.categories?.map((category) => (
                                <Link
                                  key={category.name}
                                  href={category.href}
                                  onClick={handleLinkClick}
                                  className="block px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px] flex items-center"
                                  role="menuitem"
                                >
                                  <div>
                                    <div className="font-medium">{category.name}</div>
                                    {category.description && (
                                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                                        {category.description}
                                      </div>
                                    )}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* User Account Links (if logged in) */}
            {user && (
              <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <p className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  My Account
                </p>
                <div className="space-y-1">
                  <Link
                    href="/account/profile"
                    onClick={handleLinkClick}
                    className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
                  >
                    <User className="w-4 h-4" aria-hidden="true" />
                    <span className="font-medium">My Profile</span>
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={handleLinkClick}
                    className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
                  >
                    <Package className="w-4 h-4" aria-hidden="true" />
                    <span className="font-medium">My Orders</span>
                  </Link>
                  <Link
                    href="/account/measurements"
                    onClick={handleLinkClick}
                    className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
                  >
                    <MapPin className="w-4 h-4" aria-hidden="true" />
                    <span className="font-medium">Saved Measurements</span>
                  </Link>
                  <Link
                    href="/account/wishlist"
                    onClick={handleLinkClick}
                    className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
                  >
                    <Heart className="w-4 h-4" aria-hidden="true" />
                    <span className="font-medium">Wishlist</span>
                  </Link>
                  <Link
                    href="/account/profile"
                    onClick={handleLinkClick}
                    className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
                  >
                    <Settings className="w-4 h-4" aria-hidden="true" />
                    <span className="font-medium">Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    <span className="font-medium">
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Footer Section with CTA */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 mt-auto">
              <a
                href="https://wa.me/923020718182?text=Hi%21%20I%27m%20interested%20in%20LaraibCreative%20products"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white rounded-xl hover:from-green-600 hover:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 active:scale-95 transition-all font-medium shadow-lg shadow-green-500/30 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 min-h-[44px]"
                aria-label="Contact us on WhatsApp"
              >
                <MessageCircle className="w-5 h-5" aria-hidden="true" />
                <span>Contact on WhatsApp</span>
              </a>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                © {new Date().getFullYear()} LaraibCreative. All rights reserved.
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

