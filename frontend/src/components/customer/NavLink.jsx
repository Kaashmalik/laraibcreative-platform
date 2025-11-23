'use client';


import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * NavLink Component
 * Navigation link with active state indicator
 * 
 * @component
 * @param {string} href - The route path
 * @param {string} children - Link text
 * @param {string} ariaLabel - Accessibility label
 */
export default function NavLink({ href, children, ariaLabel }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`relative px-1 py-1.5 text-sm font-medium transition-colors group ${
        isActive 
          ? 'text-primary-600' 
          : 'text-gray-700 hover:text-primary-600'
      }`}
      aria-label={ariaLabel}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
      {/* Active indicator underline */}
      <span
        className={`absolute -bottom-0.5 left-0 h-0.5 w-full rounded-full bg-primary-600 transition-transform origin-left ${
          isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        }`}
      />
    </Link>
  );
}

