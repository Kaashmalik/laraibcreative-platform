/**
 * TypeScript types for navigation components
 */

import { LucideIcon } from 'lucide-react';

export interface NavLink {
  name: string;
  href: string;
  ariaLabel?: string;
  megaMenu?: boolean;
  categories?: NavCategory[];
  icon?: LucideIcon;
}

export interface NavCategory {
  name: string;
  href: string;
  description?: string;
  icon?: LucideIcon;
}

export interface UserMenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
  ariaLabel: string;
  onClick?: () => void;
}

export interface HeaderProps {
  className?: string;
}

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: NavLink[];
}

export interface ScrollDirection {
  direction: 'up' | 'down';
  isScrolled: boolean;
}

