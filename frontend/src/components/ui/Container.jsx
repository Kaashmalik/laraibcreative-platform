/**
 * Container Component
 * Consistent container wrapper with responsive padding and max-width
 * 
 * @component
 * @example
 * <Container>
 *   <YourContent />
 * </Container>
 */

export default function Container({ 
  children, 
  className = '',
  size = 'default',
  padding = true 
}) {
  const sizeClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    default: 'max-w-7xl',
    lg: 'max-w-[1440px]',
    full: 'max-w-full',
  };

  const paddingClasses = padding 
    ? 'px-4 sm:px-6 lg:px-8' 
    : '';

  return (
    <div 
      className={`mx-auto ${sizeClasses[size]} ${paddingClasses} ${className}`}
    >
      {children}
    </div>
  );
}

