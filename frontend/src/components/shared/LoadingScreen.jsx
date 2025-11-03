import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Spinner } from '@/components/ui/Spinner';

/**
 * Full-screen loading overlay with blur, centered spinner, and optional message
 * Optimized for accessibility and performance
 * 
 * @component
 * @example
 * // Basic usage
 * <LoadingScreen />
 * 
 * // With custom message
 * <LoadingScreen message="Loading products..." />
 * 
 * // With custom size
 * <LoadingScreen message="Processing order..." size="xl" />
 */
function LoadingScreen({ 
  message, 
  size = 'lg',
  showLogo = true,
  backdrop = true 
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${
        backdrop ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent'
      }`}
      role="alert"
      aria-busy="true"
      aria-live="polite"
      aria-label={message || 'Loading content'}
    >
      {/* Logo - Only show if enabled */}
      {showLogo && (
        <motion.img
          src="/images/logo-light.svg"
          alt="LaraibCreative Logo"
          className="mb-8 w-48 select-none"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          draggable={false}
          loading="eager"
        />
      )}

      {/* Spinner */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          delay: showLogo ? 0.2 : 0.1, 
          duration: 0.3,
          ease: 'easeOut'
        }}
      >
        <Spinner size={size} className="text-primary" aria-hidden="true" />
      </motion.div>

      {/* Loading Message */}
      {message && (
        <motion.p
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            delay: showLogo ? 0.3 : 0.2, 
            duration: 0.3 
          }}
          className="mt-4 text-center text-lg font-medium text-white px-4"
          role="status"
        >
          {message}
        </motion.p>
      )}

      {/* Screen reader only text */}
      <span className="sr-only">
        {message || 'Loading, please wait'}
      </span>
    </motion.div>
  );
}

LoadingScreen.propTypes = {
  /** Optional loading message to display below spinner */
  message: PropTypes.string,
  /** Size of the spinner (sm, md, lg, xl) */
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  /** Whether to show the logo */
  showLogo: PropTypes.bool,
  /** Whether to show backdrop blur */
  backdrop: PropTypes.bool
};

LoadingScreen.defaultProps = {
  size: 'lg',
  showLogo: true,
  backdrop: true
};

export default LoadingScreen;