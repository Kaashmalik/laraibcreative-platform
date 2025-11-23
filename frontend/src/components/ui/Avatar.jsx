'use client';

/**
 * Avatar Component
 * 
 * User profile image with fallback initials
 * 
 * @param {Object} props
 * @param {string} props.src - Image URL
 * @param {string} props.alt - Alt text
 * @param {string} props.name - User name for initials
 * @param {string} props.size - Size variant: 'xs', 'sm', 'md', 'lg', 'xl'
 * @param {boolean} props.rounded - Square or rounded
 * @param {string} props.status - Status indicator: 'online', 'offline', 'away'
 * @param {string} props.className - Additional CSS classes
 * 
 * @example
 * <Avatar src="/user.jpg" name="John Doe" size="lg" status="online" />
 */
const Avatar = ({
  src,
  alt,
  name = 'User',
  size = 'md',
  rounded = true,
  status,
  className = ''
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-orange-500'
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
    '2xl': 'w-4 h-4'
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div 
        className={`
          ${sizes[size]} ${rounded ? 'rounded-full' : 'rounded-lg'}
          bg-gradient-to-br from-[#D946A6] to-[#7C3AED]
          flex items-center justify-center
          text-white font-semibold
          overflow-hidden
        `}
      >
        {src ? (
          <img src={src} alt={alt || name} className="w-full h-full object-cover" />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      {status && (
        <span 
          className={`
            absolute bottom-0 right-0 ${statusSizes[size]} ${statusColors[status]}
            rounded-full border-2 border-white
          `}
        />
      )}
    </div>
  );
};

