'use client';


import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  ChevronDown,
  Heart,
  Package,
  LogOut,
  Settings,
  MessageCircle,
  X,
  Moon,
  Sun
} from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import MobileMenu from './MobileMenu';
import SearchBar from './SearchBar';
import MiniCart from './MiniCart';
import NavLink from './NavLink';
import type { NavLink as NavLinkType, UserMenuItem } from '@/types/navigation';

/**
 * Header Component - Production Ready
 * 
 * Features:
 * - Desktop: Logo left, menu center, cart/user right
 * - Mobile: Hamburger menu with slide-in drawer
 * - Sticky header that hides on scroll down, shows on scroll up
 * - Search bar prominent on both desktop/mobile
 * - Cart badge showing item count
 * - User dropdown (Profile, Orders, Logout)
 * - Touch-friendly (min 44x44px tap targets)
 * - Smooth animations (Framer Motion)
 * - Accessibility (keyboard navigation, ARIA labels)
 * - Dark mode support
 * 
 * @component
 */
export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { totalItems: cartCount } = useCart();
  const { theme, toggleTheme, mounted: themeMounted } = useTheme();
  const scrollDirection = useScrollDirection({ threshold: 10 });
  
  // Refs
  const headerRef = useRef<HTMLElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // UI States
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [openMegaMenu, setOpenMegaMenu] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle scroll for sticky header with hide/show behavior
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsCartOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isMobileMenuOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key closes all dropdowns
      if (e.key === 'Escape') {
        setIsUserMenuOpen(false);
        setOpenMegaMenu(null);
        setIsCartOpen(false);
        setIsSearchOpen(false);
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // Navigation structure with SEO metadata
  const navLinks: NavLinkType[] = [
    { 
      name: 'Home', 
      href: '/',
      ariaLabel: 'Go to homepage'
    },
    { 
      name: 'Products', 
      href: '/products',
      ariaLabel: 'Browse our products',
      megaMenu: true,
      categories: [
        { 
          name: 'Bridal Wear', 
          href: '/products?category=bridal',
          description: 'Elegant bridal suits and lehengas'
        },
        { 
          name: 'Party Wear', 
          href: '/products?category=party',
          description: 'Stunning party dresses and outfits'
        },
        { 
          name: 'Casual Wear', 
          href: '/products?category=casual',
          description: 'Comfortable everyday wear'
        },
        { 
          name: 'Formal Wear', 
          href: '/products?category=formal',
          description: 'Professional and formal attire'
        },
        { 
          name: 'Designer Replicas', 
          href: '/products?category=designer',
          description: 'Premium designer inspired pieces'
        },
      ]
    },
    { 
      name: 'Custom Order', 
      href: '/custom-order',
      ariaLabel: 'Create your custom order'
    },
    { 
      name: 'Blog', 
      href: '/blog',
      ariaLabel: 'Read our fashion blog'
    },
    { 
      name: 'About', 
      href: '/about',
      ariaLabel: 'Learn about LaraibCreative'
    },
    { 
      name: 'Contact', 
      href: '/contact',
      ariaLabel: 'Get in touch with us'
    },
  ];

  // User menu items with proper routing
  const userMenuItems: UserMenuItem[] = [
    { 
      icon: User, 
      label: 'My Profile', 
      href: '/account/profile',
      ariaLabel: 'View your profile'
    },
    { 
      icon: Package, 
      label: 'My Orders', 
      href: '/account/orders',
      ariaLabel: 'View your orders'
    },
    { 
      icon: Heart, 
      label: 'Wishlist', 
      href: '/account/wishlist',
      ariaLabel: 'View your wishlist'
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      href: '/account/profile',
      ariaLabel: 'Account settings'
    },
  ];

  // Memoized handlers
  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const handleSearchToggle = useCallback(() => {
    setIsSearchOpen(prev => !prev);
  }, []);

  const handleCartToggle = useCallback(() => {
    setIsCartOpen(prev => !prev);
  }, []);

  const handleUserMenuToggle = useCallback(() => {
    setIsUserMenuOpen(prev => !prev);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      if (logout && typeof logout === 'function') {
        await (logout as () => Promise<void>)();
      }
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout]);

  // Mega menu handlers with delay for better UX
  const handleMegaMenuEnter = useCallback((menuName: string) => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
    }
    setOpenMegaMenu(menuName);
  }, []);

  const handleMegaMenuLeave = useCallback(() => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setOpenMegaMenu(null);
    }, 200);
  }, []);

  // Don't render until mounted to avoid hydration issues
  if (!mounted || !themeMounted) {
    return (
      <header 
        className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 py-4 transition-colors"
        ref={headerRef}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="w-48 h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
          </div>
        </div>
      </header>
    );
  }

  // Determine header visibility based on scroll direction
  const isHeaderVisible = scrollDirection === 'up' || !isScrolled;

  return (
    <>
      {/* Skip to main content for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Main Header - Semantic HTML with proper ARIA */}
      <motion.header
        ref={headerRef}
        initial={false}
        animate={{
          y: isHeaderVisible ? 0 : -100,
          opacity: isHeaderVisible ? 1 : 0
        }}
        transition={{
          duration: 0.3,
          ease: 'easeInOut'
        }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          isScrolled
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-gray-200 dark:border-gray-800'
            : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-transparent'
        }`}
        role="banner"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Logo */}
          <div className="flex flex-1 items-center gap-4 lg:gap-6 min-w-0">
            {/* Mobile Menu Button - Touch-friendly 44x44px */}
            <button
              onClick={handleMobileMenuToggle}
              className="lg:hidden flex h-11 w-11 items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label="Open navigation menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>

            {/* Logo with SEO optimization */}
            <Link 
              href="/" 
              className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded-lg min-w-0"
              aria-label="LaraibCreative - Home"
            >
              <Image
                src="/globe.svg"
                alt="LaraibCreative Logo"
                width={32}
                height={32}
                className="transition-all duration-300 flex-shrink-0"
                style={{ 
                  width: '32px',
                  height: '32px'
                }}
                priority
                quality={75}
              />
              <span className="font-playfair text-lg lg:text-xl font-semibold bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent truncate">
                <span className="hidden sm:inline">LaraibCreative</span>
                <span className="sm:hidden">LC</span>
              </span>
            </Link>

            {/* Center: Desktop Navigation */}
            <nav 
              className="hidden lg:flex items-center gap-8 flex-1 justify-center" 
              role="navigation"
              aria-label="Main navigation"
            >
              {navLinks.map((link) => (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => link.megaMenu && handleMegaMenuEnter(link.name)}
                  onMouseLeave={handleMegaMenuLeave}
                >
                  <NavLink
                    href={link.href}
                    ariaLabel={link.ariaLabel}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      {link.name}
                      {link.megaMenu && (
                        <ChevronDown 
                          className="w-3.5 h-3.5" 
                          aria-hidden="true"
                        />
                      )}
                    </span>
                  </NavLink>

                  {/* Mega Menu with enhanced accessibility */}
                  {link.megaMenu && (
                    <AnimatePresence>
                      {openMegaMenu === link.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50"
                          role="menu"
                          aria-label={`${link.name} categories`}
                        >
                          {link.categories?.map((category) => (
                            <Link
                              key={category.name}
                              href={category.href}
                              className="block px-4 py-3 text-sm hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors group focus:outline-none focus:bg-primary-50 dark:focus:bg-gray-700"
                              role="menuitem"
                              onClick={() => setOpenMegaMenu(null)}
                            >
                              <div className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                                {category.name}
                              </div>
                              {category.description && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {category.description}
                                </div>
                              )}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
            {/* Search Button - Touch-friendly 44x44px */}
            <button
              onClick={handleSearchToggle}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label="Open search"
              aria-expanded={isSearchOpen}
            >
              <Search className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Dark Mode Toggle - Touch-friendly 44x44px */}
            <button
              onClick={toggleTheme}
              className="hidden sm:flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Sun className="w-4 h-4" aria-hidden="true" />
              )}
            </button>

            {/* WhatsApp Quick Contact - Hidden on mobile */}
            <a
              href="https://wa.me/923020718182?text=Hi%21%20I%27m%20interested%20in%20LaraibCreative%20products"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 rounded-full bg-green-500 dark:bg-green-600 px-4 py-2 text-xs font-medium text-white hover:bg-green-600 dark:hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 h-11"
              aria-label="Contact us on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>WhatsApp</span>
            </a>

            {/* Cart Button with badge - Touch-friendly 44x44px */}
            <button
              onClick={handleCartToggle}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label={`Shopping cart with ${cartCount} items`}
              aria-expanded={isCartOpen}
            >
              <ShoppingCart className="w-4 h-4" aria-hidden="true" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-600 dark:bg-primary-500 px-1.5 text-[10px] font-bold text-white shadow-lg"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </motion.span>
              )}
            </button>

            {/* User Account with proper dropdown - Touch-friendly */}
            <div className="relative" ref={userMenuRef}>
              {user ? (
                <>
                  <button
                    onClick={handleUserMenuToggle}
                    className="flex items-center gap-1.5 p-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 min-h-[44px] min-w-[44px]"
                    aria-label="User account menu"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                        {(user as any)?.name?.charAt(0).toUpperCase() || (user as any)?.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 hidden lg:block" aria-hidden="true" />
                  </button>

                  {/* User Dropdown Menu */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50"
                        role="menu"
                        aria-label="User account menu"
                      >
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {(user as any)?.name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {(user as any)?.email || ''}
                          </p>
                        </div>

                        {/* Menu Items */}
                        {userMenuItems.map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors focus:outline-none focus:bg-primary-50 dark:focus:bg-gray-700 min-h-[44px]"
                            onClick={() => setIsUserMenuOpen(false)}
                            role="menuitem"
                            aria-label={item.ariaLabel}
                          >
                            <item.icon className="w-4 h-4" aria-hidden="true" />
                            <span>{item.label}</span>
                          </Link>
                        ))}

                        {/* Logout */}
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus:bg-red-50 dark:focus:bg-red-900/20 min-h-[44px]"
                          role="menuitem"
                          aria-label="Logout from your account"
                        >
                          <LogOut className="w-4 h-4" aria-hidden="true" />
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 min-h-[44px]"
                  aria-label="Login to your account"
                >
                  <User className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Component */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navLinks={navLinks}
      />

      {/* Search Modal Component */}
      <SearchBar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Mini Cart Drawer Component */}
      <MiniCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
}

