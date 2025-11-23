'use client';


import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

/**
 * NavLink Component
 * Navigation link with active state indicator
 * 
 * @component
 * @param {string} href - The route path
 * @param {ReactNode} children - Link content
 * @param {string} ariaLabel - Accessibility label
 * @param {string} className - Additional CSS classes
 */
interface NavLinkProps {
  href: string;
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
}

export default function NavLink({ href, children, ariaLabel, className = '' }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`relative px-1 py-1.5 text-sm font-medium transition-colors group ${
        isActive 
          ? 'text-primary-600 dark:text-primary-400' 
          : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
      } ${className}`}
      aria-label={ariaLabel}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
      {/* Active indicator underline */}
      <span
        className={`absolute -bottom-0.5 left-0 h-0.5 w-full rounded-full bg-primary-600 dark:bg-primary-400 transition-transform origin-left ${
          isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        }`}
        aria-hidden="true"
      />
    </Link>
  );
}

