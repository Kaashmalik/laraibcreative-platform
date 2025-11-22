/**
 * Loading fallback for products page
 */

export default function ProductsPageLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-4">
        <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded w-96 animate-pulse"></div>
      </div>

      {/* Filters Skeleton */}
      <div className="mb-8 flex flex-wrap gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
        ))}
      </div>

      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="aspect-[3/4] bg-gray-200 animate-pulse"></div>
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
