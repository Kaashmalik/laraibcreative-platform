/**
 * Stack Component
 * Vertical layout component with consistent spacing
 * 
 * @component
 * @example
 * <Stack gap="md">
 *   <Item1 />
 *   <Item2 />
 * </Stack>
 */

export default function Stack({ 
  children, 
  gap = 'md',
  align = 'stretch',
  className = '',
  as: Component = 'div'
}) {
  const gapClasses = {
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
    '2xl': 'space-y-12',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  return (
    <Component 
      className={`flex flex-col ${gapClasses[gap]} ${alignClasses[align]} ${className}`}
    >
      {children}
    </Component>
  );
}

