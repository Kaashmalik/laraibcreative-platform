'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Heart, ShoppingCart, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * FeaturedCarousel Component
 * Auto-playing carousel with manual navigation
 * Features:
 * - Auto-play every 5 seconds
 * - Manual navigation (prev/next)
 * - Pause on hover
 * - Smooth transitions
 * - Responsive grid on mobile
 * - Product quick actions on hover
 */
export default function FeaturedCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const timerRef = useRef(null);

  // Featured products data (in production, fetch from API)
  const featuredProducts = [
    {
      id: 1,
      title: 'Elegant Bridal Red Velvet',
      slug: 'elegant-bridal-red-velvet',
      price: 15999,
      image: '/images/products/bridal-1.jpg',
      category: 'Bridal Wear',
      rating: 5,
      reviews: 24,
      badge: 'Bestseller'
    },
    {
      id: 2,
      title: 'Royal Blue Party Wear',
      slug: 'royal-blue-party-wear',
      price: 8999,
      image: '/images/products/party-1.jpg',
      category: 'Party Wear',
      rating: 4.8,
      reviews: 18,
      badge: 'New Arrival'
    },
    {
      id: 3,
      title: 'Designer Chiffon Collection',
      slug: 'designer-chiffon-collection',
      price: 12999,
      image: '/images/products/designer-1.jpg',
      category: 'Designer Wear',
      rating: 5,
      reviews: 31,
      badge: 'Trending'
    },
    {
      id: 4,
      title: 'Premium Silk Formal',
      slug: 'premium-silk-formal',
      price: 9999,
      image: '/images/products/formal-1.jpg',
      category: 'Formal Wear',
      rating: 4.9,
      reviews: 15,
      badge: 'Premium'
    },
    {
      id: 5,
      title: 'Casual Lawn Summer',
      slug: 'casual-lawn-summer',
      price: 5999,
      image: '/images/products/casual-1.jpg',
      category: 'Casual Wear',
      rating: 4.7,
      reviews: 42,
      badge: 'Popular'
    },
  ];

  const itemsPerView = typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 
                       typeof window !== 'undefined' && window.innerWidth < 1024 ? 2 : 3;

  const maxIndex = Math.max(0, featuredProducts.length - itemsPerView);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
      }, 5000); // Change slide every 5 seconds
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isAutoPlaying, maxIndex]);

  // Navigation functions
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    resetAutoPlay();
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    resetAutoPlay();
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    resetAutoPlay();
  };

  const resetAutoPlay = () => {
    setIsAutoPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTimeout(() => setIsAutoPlaying(true), 1000);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Carousel Container */}
      <div 
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`
          }}
        >
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 px-3"
              style={{ width: `${100 / itemsPerView}%` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {featuredProducts.length > itemsPerView && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all duration-300 hover:scale-110 z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all duration-300 hover:scale-110 z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-gray-900" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'w-8 bg-pink-600' 
                : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * ProductCard Component
 * Individual product card with hover effects and quick actions
 */
function ProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const router = useRouter();

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
      {/* Product Image Container */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden">
        {/* Placeholder Image */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100" />
        
        {/* In production, use actual image */}
        {/* <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        /> */}

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-semibold rounded-full shadow-lg">
              {product.badge}
            </span>
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsWishlisted(!isWishlisted);
            }}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
            aria-label="Add to wishlist"
          >
            <Heart 
              className={`w-5 h-5 ${isWishlisted ? 'fill-pink-600 text-pink-600' : 'text-gray-900'}`} 
            />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/products/${product.slug}`);
            }}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
            aria-label="Quick view"
          >
            <Eye className="w-5 h-5 text-gray-900" />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              // Add to cart logic
            }}
            className="w-12 h-12 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-5 h-5 text-white" />
          </button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-5">
        {/* Category */}
        <div className="text-xs font-medium text-pink-600 mb-2">
          {product.category}
        </div>

        {/* Title */}
        <Link 
          href={`/products/${product.slug}`}
          className="block"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating) 
                    ? 'text-yellow-400 fill-yellow-400' 
                    : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {product.rating} ({product.reviews})
          </span>
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              Rs. {product.price.toLocaleString()}
            </span>
            <div className="text-xs text-gray-500">+ Custom Stitching</div>
          </div>
          <Link
            href={`/products/${product.slug}`}
            className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-sm font-semibold rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}