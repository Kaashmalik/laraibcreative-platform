"use client";

import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

/**
 * Display component for empty states with icon, text, and optional action button
 * Animated and accessible empty state component
 * 
 * @component
 * @example
 * // Basic usage
 * import { ShoppingBag } from 'lucide-react'
 * 
 * <EmptyState
 *   icon={ShoppingBag}
 *   title="Your cart is empty"
 *   description="Add some products to get started"
 * />
 * 
 * // With action button
 * <EmptyState
 *   icon={Search}
 *   title="No products found"
 *   description="Try adjusting your search or filters"
 *   actionLabel="Clear Filters"
 *   onAction={() => clearFilters()}
 * />
 * 
 * // With secondary action
 * <EmptyState
 *   icon={Package}
 *   title="No orders yet"
 *   description="Start shopping to see your orders here"
 *   actionLabel="Browse Products"
 *   onAction={() => router.push('/products')}
 *   secondaryActionLabel="View Wishlist"
 *   onSecondaryAction={() => router.push('/wishlist')}
 * />
 */
function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
  animate = true,
  size = 'default'
}) {
  // Size variants for icon and text
  const sizeClasses = {
    small: {
      icon: 'h-12 w-12',
      title: 'text-lg',
      description: 'text-sm',
      minHeight: 'min-h-[200px]'
    },
    default: {
      icon: 'h-16 w-16',
      title: 'text-xl',
      description: 'text-sm',
      minHeight: 'min-h-[300px]'
    },
    large: {
      icon: 'h-20 w-20',
      title: 'text-2xl',
      description: 'text-base',
      minHeight: 'min-h-[400px]'
    }
  };

  const sizes = sizeClasses[size] || sizeClasses.default;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const ContentWrapper = animate ? motion.div : 'div';
  const ItemWrapper = animate ? motion.div : 'div';

  return (
    <ContentWrapper
      className={`flex ${sizes.minHeight} flex-col items-center justify-center space-y-4 p-8 text-center ${className}`}
      role="status"
      aria-label={title}
      {...(animate && {
        initial: 'hidden',
        animate: 'visible',
        variants: containerVariants
      })}
    >
      {/* Icon */}
      {Icon && (
        <ItemWrapper
          {...(animate && { variants: itemVariants })}
        >
          <div className="rounded-full bg-gray-100 p-4">
            <Icon 
              className={`${sizes.icon} text-gray-400`}
              aria-hidden="true"
            />
          </div>
        </ItemWrapper>
      )}

      {/* Title */}
      <ItemWrapper
        {...(animate && { variants: itemVariants })}
      >
        <h3 className={`${sizes.title} font-semibold text-gray-900`}>
          {title}
        </h3>
      </ItemWrapper>

      {/* Description */}
      {description && (
        <ItemWrapper
          {...(animate && { variants: itemVariants })}
        >
          <p className={`${sizes.description} max-w-md text-gray-600`}>
            {description}
          </p>
        </ItemWrapper>
      )}

      {/* Action Buttons */}
      {(actionLabel || secondaryActionLabel) && (
        <ItemWrapper
          {...(animate && { variants: itemVariants })}
          className="flex flex-col items-center gap-3 sm:flex-row"
        >
          {actionLabel && onAction && (
            <Button
              onClick={onAction}
              variant="primary"
              className="mt-4 w-full sm:w-auto"
            >
              {actionLabel}
            </Button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <Button
              onClick={onSecondaryAction}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {secondaryActionLabel}
            </Button>
          )}
        </ItemWrapper>
      )}
    </ContentWrapper>
  );
}

EmptyState.propTypes = {
  /** Icon component from lucide-react */
  icon: PropTypes.elementType,
  /** Main heading text */
  title: PropTypes.string.isRequired,
  /** Optional descriptive text */
  description: PropTypes.string,
  /** Primary action button label */
  actionLabel: PropTypes.string,
  /** Primary action button click handler */
  onAction: PropTypes.func,
  /** Secondary action button label */
  secondaryActionLabel: PropTypes.string,
  /** Secondary action button click handler */
  onSecondaryAction: PropTypes.func,
  /** Optional additional CSS classes */
  className: PropTypes.string,
  /** Enable/disable animations */
  animate: PropTypes.bool,
  /** Size variant (small, default, large) */
  size: PropTypes.oneOf(['small', 'default', 'large'])
};

EmptyState.defaultProps = {
  animate: true,
  size: 'default'
};

export default EmptyState;