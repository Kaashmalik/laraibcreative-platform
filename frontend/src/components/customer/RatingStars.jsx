// components/customer/RatingStars.jsx
'use client';

/**
 * RatingStars Component
 * 
 * Displays star rating with review count
 * 
 * @param {number} rating - Rating value (0-5)
 * @param {number} reviewCount - Number of reviews
 * @param {string} size - Size variant ('sm', 'md', 'lg')
 */
export function RatingStars({ rating = 0, reviewCount = 0, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1" aria-label={`Rating: ${rating.toFixed(1)} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.floor(rating);
          const partial = star === Math.ceil(rating) && rating % 1 !== 0;
          
          return (
            <div key={star} className="relative">
              {/* Background star (gray) */}
              <svg
                className={`${sizeClasses[size]} text-gray-300`}
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              
              {/* Filled star (yellow) */}
              {(filled || partial) && (
                <svg
                  className={`${sizeClasses[size]} text-yellow-400 absolute top-0 left-0`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  style={partial ? { clipPath: `inset(0 ${100 - (rating % 1) * 100}% 0 0)` } : {}}
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
      
      <div className={`${textSizes[size]} text-gray-600`}>
        <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
        {reviewCount > 0 && (
          <span className="ml-1">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
        )}
      </div>
    </div>
  );
}

