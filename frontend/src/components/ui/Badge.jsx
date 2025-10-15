import React from 'react';
import { Loader2, User, Package, ShoppingCart, Star } from 'lucide-react';

/**
 * Badge Component
 * 
 * Small label for status, counts, or categories
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Badge content
 * @param {string} props.variant - Color variant
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg'
 * @param {boolean} props.dot - Show dot indicator
 * @param {string} props.className - Additional CSS classes
 * 
 * @example
 * <Badge variant="success">In Stock</Badge>
 * <Badge variant="warning" dot>Pending</Badge>
 */
const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = ''
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-[#D946A6] text-white',
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    warning: 'bg-orange-100 text-orange-800',
    info: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800'
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1'
  };

  const dotColors = {
    default: 'bg-gray-500',
    primary: 'bg-[#D946A6]',
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-orange-500',
    info: 'bg-blue-500',
    purple: 'bg-purple-500'
  };

  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {dot && (
        <span className={`w-2 h-2 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
};
