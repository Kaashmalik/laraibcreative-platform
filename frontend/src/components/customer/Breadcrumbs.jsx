'use client';
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useSelectedLayoutSegment } from 'next/navigation';
import { motion } from 'framer-motion';

/**
 * Breadcrumbs Component
 * ----------------------------------------
 * - Dynamically builds breadcrumb trail from URL path
 * - Uses Next.js useSelectedLayoutSegment for better route tracking
 * - SEO-friendly structure with schema.org markup
 * - Animated transitions
 * - Mobile-responsive with proper touch targets
 */

// Route label mappings for better readability
const ROUTE_LABELS = {
  'products': 'Products',
  'custom-order': 'Custom Order',
  'blog': 'Blog',
  'about': 'About',
  'contact': 'Contact',
  'cart': 'Shopping Cart',
  'checkout': 'Checkout',
  'account': 'My Account',
  'orders': 'My Orders',
  'wishlist': 'Wishlist',
  'profile': 'Profile',
  'addresses': 'Addresses',
  'measurements': 'Measurements',
  'auth': 'Authentication',
  'login': 'Login',
  'register': 'Register',
  'forgot-password': 'Forgot Password',
  'reset-password': 'Reset Password',
  'admin': 'Admin',
  'dashboard': 'Dashboard',
  'categories': 'Categories',
  'policies': 'Policies',
  'privacy': 'Privacy Policy',
  'terms': 'Terms & Conditions',
  'shipping': 'Shipping Policy',
  'returns': 'Returns Policy',
  'faq': 'FAQ',
  'size-guide': 'Size Guide',
  'track-order': 'Track Order',
};

const Breadcrumbs = () => {
  const pathname = usePathname();
  const selectedSegment = useSelectedLayoutSegment();
  const pathSegments = pathname.split('/').filter(Boolean);

  // Build breadcrumbs with proper labels
  const crumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    // Use route label mapping or format segment
    const label = ROUTE_LABELS[segment] || segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return { href, label, isActive: index === pathSegments.length - 1 };
  });

  // Don't show breadcrumbs on homepage
  if (pathname === '/') {
    return null;
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6"
      aria-label="Breadcrumb"
      itemScope
      itemType="https://schema.org/BreadcrumbList"
    >
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-primary-600 transition-colors min-h-[44px] px-2 -ml-2 rounded-md hover:bg-gray-50"
        itemProp="itemListElement"
        itemScope
        itemType="https://schema.org/ListItem"
        aria-label="Home"
      >
        <Home className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        <span itemProp="name" className="sr-only sm:not-sr-only">Home</span>
        <meta itemProp="position" content="1" />
      </Link>

      {crumbs.map((crumb, index) => (
        <span key={crumb.href} className="flex items-center">
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mx-1 sm:mx-2" aria-hidden="true" />
          {crumb.isActive ? (
            <span
              className="font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-none"
              itemProp="name"
              aria-current="page"
            >
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-primary-600 transition-colors truncate max-w-[200px] sm:max-w-none min-h-[44px] px-2 -mx-2 rounded-md hover:bg-gray-50 flex items-center"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <span itemProp="name">{crumb.label}</span>
              <meta itemProp="position" content={index + 2} />
            </Link>
          )}
        </span>
      ))}
    </motion.nav>
  );
};

export default Breadcrumbs;
