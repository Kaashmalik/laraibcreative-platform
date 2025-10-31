import PropTypes from 'prop-types';
import { Button } from '@/components/ui/button';

/**
 * Display component for empty states with icon, text, and optional action button
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
 *   icon={ShoppingBag}
 *   title="No products found"
 *   description="Try adjusting your search or filters"
 *   actionLabel="Clear Filters"
 *   onAction={() => clearFilters()}
 * />
 */
function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div
      className={`flex min-h-[300px] flex-col items-center justify-center space-y-4 p-8 text-center ${className}`}
      role="status"
      aria-label={title}
    >
      {/* Icon */}
      {Icon && (
        <Icon 
          className="h-16 w-16 text-gray-400" 
          aria-hidden="true"
        />
      )}

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="max-w-md text-sm text-gray-600">
          {description}
        </p>
      )}

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant="primary"
          className="mt-4"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  /** Icon component from lucide-react */
  icon: PropTypes.elementType,
  /** Main heading text */
  title: PropTypes.string.isRequired,
  /** Optional descriptive text */
  description: PropTypes.string,
  /** Optional button label */
  actionLabel: PropTypes.string,
  /** Optional button click handler */
  onAction: PropTypes.func,
  /** Optional additional CSS classes */
  className: PropTypes.string
};

export default EmptyState;
