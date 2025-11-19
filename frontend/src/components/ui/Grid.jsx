/**
 * Grid Component
 * Responsive grid layout with consistent spacing
 * 
 * @component
 * @example
 * <Grid cols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md">
 *   <Item1 />
 *   <Item2 />
 *   <Item3 />
 * </Grid>
 */

export default function Grid({ 
  children, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className = '',
  as: Component = 'div'
}) {
  const gapClasses = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
    '2xl': 'gap-12',
  };

  // Map column numbers to Tailwind classes (must be explicit for purging)
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    12: 'grid-cols-12',
  };

  const smColClasses = {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    5: 'sm:grid-cols-5',
    6: 'sm:grid-cols-6',
    12: 'sm:grid-cols-12',
  };

  const lgColClasses = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
    12: 'lg:grid-cols-12',
  };

  const mobileCols = colClasses[cols.mobile] || 'grid-cols-1';
  const tabletCols = smColClasses[cols.tablet] || '';
  const desktopCols = lgColClasses[cols.desktop] || '';

  return (
    <Component 
      className={`grid ${mobileCols} ${tabletCols} ${desktopCols} ${gapClasses[gap]} ${className}`}
    >
      {children}
    </Component>
  );
}

