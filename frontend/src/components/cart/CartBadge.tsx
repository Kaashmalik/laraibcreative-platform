'use client';

/**
 * CartBadge Component - Production Ready
 * Animated cart badge showing item count
 * 
 * @module components/cart/CartBadge
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/hooks/useCart';

interface CartBadgeProps {
  className?: string;
  showZero?: boolean;
}

/**
 * CartBadge Component
 * Displays animated badge with cart item count
 */
export default function CartBadge({ className = '', showZero = false }: CartBadgeProps) {
  const { totalItems } = useCart();

  if (totalItems === 0 && !showZero) {
    return null;
  }

  const displayCount = totalItems > 99 ? '99+' : totalItems;

  return (
    <AnimatePresence mode="wait">
      {totalItems > 0 && (
        <motion.span
          key={totalItems}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
          className={`absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg ${className}`}
          aria-label={`${totalItems} items in cart`}
        >
          {displayCount}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

