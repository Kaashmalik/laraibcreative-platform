/**
 * Loading fallback for homepage
 * Shows skeleton UI while data is being fetched
 */

export default function HomePageLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
      <div className="relative h-[60vh] md:h-[70vh] bg-gradient-to-br from-pink-50 to-purple-50 animate-pulse">
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="w-full md:w-2/3 space-y-6">
            <div className="h-12 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded w-40"></div>
          </div>
        </div>
      </div>

      {/* Featured Products Skeleton */}
      <section className="container mx-auto px-4 py-12">
        <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="aspect-[3/4] bg-gray-200 animate-pulse"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Skeleton */}
      <section className="container mx-auto px-4 py-12 bg-gray-50">
        <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="aspect-square bg-gray-200 animate-pulse"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

