/**
 * Loading fallback for product detail page
 */

export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image Gallery Skeleton */}
        <div>
          <div className="aspect-square bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
          </div>

          <div className="h-12 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
