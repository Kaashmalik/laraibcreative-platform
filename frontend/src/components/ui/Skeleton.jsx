'use client';

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Skeleton Component - Beautiful loading placeholders
 * 
 * @component
 * @example
 * // Basic skeleton
 * <Skeleton width="200px" height="20px" />
 * 
 * // Circle avatar
 * <Skeleton variant="circle" width="50px" height="50px" />
 * 
 * // Text lines
 * <Skeleton variant="text" count={3} />
 * 
 * // Product card skeleton
 * <ProductCardSkeleton />
 */
const Skeleton = ({
  variant = 'rectangular',
  width = '100%',
  height = '20px',
  count = 1,
  className = '',
  animation = 'pulse',
}) => {
  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
    none: '',
  };

  const variantStyles = {
    rectangular: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded',
  };

  const baseStyles = `
    bg-gray-200
    ${variantStyles[variant]}
    ${animationStyles[animation]}
    ${className}
  `;

  // Text variant with multiple lines
  if (variant === 'text' && count > 1) {
    return (
      <div className="space-y-3">
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className={baseStyles}
            style={{
              width: i === count - 1 ? '70%' : width,
              height: height,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={baseStyles}
      style={{ width, height }}
      aria-label="Loading..."
      role="status"
    />
  );
};

Skeleton.propTypes = {
  /** Shape variant */
  variant: PropTypes.oneOf(['rectangular', 'circle', 'text']),
  /** Width of skeleton */
  width: PropTypes.string,
  /** Height of skeleton */
  height: PropTypes.string,
  /** Number of lines (for text variant) */
  count: PropTypes.number,
  /** Additional classes */
  className: PropTypes.string,
  /** Animation type */
  animation: PropTypes.oneOf(['pulse', 'wave', 'none']),
};

// Product Card Skeleton
const ProductCardSkeleton = ({ className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
    {/* Image skeleton */}
    <Skeleton variant="rectangular" height="300px" className="rounded-none" />
    
    {/* Content skeleton */}
    <div className="p-4 space-y-3">
      <Skeleton variant="text" height="16px" width="80%" />
      <Skeleton variant="text" height="14px" width="60%" />
      <div className="flex items-center gap-2 pt-2">
        <Skeleton variant="text" height="20px" width="100px" />
        <Skeleton variant="text" height="16px" width="80px" />
      </div>
    </div>
  </div>
);

ProductCardSkeleton.propTypes = {
  className: PropTypes.string,
};

// Order Card Skeleton
const OrderCardSkeleton = ({ className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
    <div className="flex items-start gap-4">
      <Skeleton variant="rectangular" width="80px" height="80px" />
      <div className="flex-1 space-y-3">
        <Skeleton variant="text" height="18px" width="60%" />
        <Skeleton variant="text" height="14px" width="40%" />
        <Skeleton variant="text" height="14px" width="80px" />
      </div>
      <Skeleton variant="rectangular" width="100px" height="32px" />
    </div>
  </div>
);

OrderCardSkeleton.propTypes = {
  className: PropTypes.string,
};

// Profile Skeleton
const ProfileSkeleton = ({ className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
    <div className="flex items-center gap-4 mb-6">
      <Skeleton variant="circle" width="80px" height="80px" />
      <div className="flex-1 space-y-3">
        <Skeleton variant="text" height="20px" width="200px" />
        <Skeleton variant="text" height="16px" width="150px" />
      </div>
    </div>
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton variant="text" height="14px" width="100px" />
        <Skeleton variant="rectangular" height="40px" />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" height="14px" width="120px" />
        <Skeleton variant="rectangular" height="40px" />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" height="14px" width="90px" />
        <Skeleton variant="rectangular" height="40px" />
      </div>
    </div>
  </div>
);

ProfileSkeleton.propTypes = {
  className: PropTypes.string,
};

// Table Skeleton
const TableSkeleton = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
    {/* Header */}
    <div className="border-b border-gray-200 p-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={i} variant="text" height="16px" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    <div>
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="border-b border-gray-200 p-4 last:border-0">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {[...Array(columns)].map((_, colIndex) => (
              <Skeleton key={colIndex} variant="text" height="14px" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

TableSkeleton.propTypes = {
  rows: PropTypes.number,
  columns: PropTypes.number,
  className: PropTypes.string,
};

// Demo Component
const SkeletonDemo = () => {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const toggleLoading = () => setLoading(!loading);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Skeleton Loading Component
              </h1>
              <p className="text-gray-600">
                Beautiful loading placeholders for LaraibCreative platform
              </p>
            </div>
            <button
              onClick={toggleLoading}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              {loading ? 'Show Content' : 'Show Skeleton'}
            </button>
          </div>

          {/* Basic Shapes */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Shapes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Rectangular</p>
                <Skeleton variant="rectangular" height="100px" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Circle</p>
                <Skeleton variant="circle" width="100px" height="100px" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Text Lines</p>
                <Skeleton variant="text" count={4} />
              </div>
            </div>
          </section>

          {/* Animation Types */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Animation Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Pulse (Default)</p>
                <Skeleton animation="pulse" height="60px" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Wave</p>
                <Skeleton animation="wave" height="60px" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">None</p>
                <Skeleton animation="none" height="60px" />
              </div>
            </div>
          </section>
        </div>

        {/* Product Grid Skeleton */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Grid</h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="aspect-[3/4] bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                    <span className="text-gray-400">Product {i}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">Designer Suit {i}</h3>
                    <p className="text-sm text-gray-500 mb-2">Beautiful design</p>
                    <p className="text-lg font-bold text-pink-600">PKR {(5000 + i * 1000).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders List Skeleton */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Orders List</h2>
          {loading ? (
            <div className="space-y-4">
              <OrderCardSkeleton />
              <OrderCardSkeleton />
              <OrderCardSkeleton />
            </div>
          ) : (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">📦</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Order #LC-2025-00{i}</h3>
                      <p className="text-sm text-gray-500">Placed on Jan {10 + i}, 2025</p>
                      <p className="text-sm text-pink-600 font-medium mt-1">PKR {(8000 + i * 2000).toLocaleString()}</p>
                    </div>
                    <span className="px-4 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-lg">
                      Delivered
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Skeleton */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Form</h2>
          {loading ? (
            <ProfileSkeleton />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  LK
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Laraib Khan</h3>
                  <p className="text-gray-500">laraib@example.com</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value="Laraib Khan"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value="laraib@example.com"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value="+92 300 1234567"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                    readOnly
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Table</h2>
          {loading ? (
            <TableSkeleton rows={6} columns={5} />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Order ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <tr key={i} className="border-b border-gray-200 last:border-0">
                      <td className="px-4 py-3 text-sm text-gray-900">LC-2025-00{i}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">Customer {i}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">Jan {10 + i}, 2025</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">PKR {(5000 + i * 1000).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Usage Code */}
        <div className="mt-8 bg-gray-900 rounded-xl p-6 text-gray-100 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-3 text-pink-400">Usage Examples</h3>
          <pre className="text-sm">
{`// Basic skeleton
<Skeleton width="200px" height="20px" />

// Circle avatar
<Skeleton variant="circle" width="50px" height="50px" />

// Text lines
<Skeleton variant="text" count={3} />

// Product card skeleton
<ProductCardSkeleton />

// Order card skeleton
<OrderCardSkeleton />

// Profile skeleton
<ProfileSkeleton />

// Table skeleton
<TableSkeleton rows={5} columns={4} />

// With loading state
{isLoading ? (
  <ProductCardSkeleton />
) : (
  <ProductCard {...productData} />
)}

// Custom animation
<Skeleton animation="wave" height="100px" />`}
          </pre>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
};

export {
  Skeleton,
  ProductCardSkeleton,
  OrderCardSkeleton,
  ProfileSkeleton,
  TableSkeleton,
};

export default SkeletonDemo;