'use client';

'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ImageGallery Component
 * 
 * Advanced image gallery with:
 * - Main large image display
 * - Thumbnail navigation
 * - Lightbox/modal view with zoom
 * - Touch/swipe support for mobile
 * - Keyboard navigation (arrow keys, ESC)
 * - Image loading states
 * - Zoom on hover (desktop)
 * - Full-screen mode
 * 
 * @param {Array} images - Array of image URLs
 * @param {string} primaryImage - Main image URL
 * @param {string} productTitle - Product title for alt text
 */
export default function ImageGallery({ 
  images = [], 
  primaryImage = '', 
  productTitle = 'Product' 
}) {
  // Ensure we have images to display
  const allImages = primaryImage 
    ? [primaryImage, ...images.filter(img => img !== primaryImage)]
    : images;

  // State management
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState({});
  
  const mainImageRef = useRef(null);

  /**
   * Handle thumbnail click
   */
  const handleThumbnailClick = (index) => {
    setSelectedIndex(index);
    setIsZoomed(false);
  };

  /**
   * Open lightbox
   */
  const openLightbox = () => {
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  };

  /**
   * Close lightbox
   */
  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setIsZoomed(false);
    document.body.style.overflow = 'unset';
  };

  /**
   * Navigate to previous image
   */
  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    setIsZoomed(false);
  };

  /**
   * Navigate to next image
   */
  const goToNext = () => {
    setSelectedIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    setIsZoomed(false);
  };

  /**
   * Handle mouse move for zoom effect
   */
  const handleMouseMove = (e) => {
    if (!isZoomed || !mainImageRef.current) return;

    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  };

  /**
   * Toggle zoom on click (desktop)
   */
  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  /**
   * Keyboard navigation
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLightboxOpen) return;

      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, selectedIndex]);

  /**
   * Track image loading state
   */
  const handleImageLoad = (index) => {
    setImageLoaded(prev => ({ ...prev, [index]: true }));
  };

  return (
    <>
      {/* Main Gallery Container */}
      <div className="space-y-4">
        {/* Main Image Display */}
        <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden group">
          {/* Loading skeleton */}
          {!imageLoaded[selectedIndex] && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}

          {/* Main Image */}
          <div
            ref={mainImageRef}
            className="relative w-full h-full cursor-zoom-in"
            onClick={openLightbox}
            onMouseMove={handleMouseMove}
          >
            <Image
              src={allImages[selectedIndex] || '/images/placeholder.png'}
              alt={`${productTitle} - Image ${selectedIndex + 1}`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={`object-cover transition-opacity duration-300 ${
                imageLoaded[selectedIndex] ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => handleImageLoad(selectedIndex)}
              priority={selectedIndex === 0}
              quality={90}
            />
          </div>

          {/* Zoom indicator overlay */}
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
          
          {/* Zoom icon hint */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </div>

          {/* Navigation arrows for mobile */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors lg:hidden"
                aria-label="Previous image"
              >
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors lg:hidden"
                aria-label="Next image"
              >
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-sm rounded-full">
            {selectedIndex + 1} / {allImages.length}
          </div>
        </div>

        {/* Thumbnail Grid */}
        {allImages.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {allImages.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                  selectedIndex === index
                    ? 'ring-2 ring-pink-600 ring-offset-2'
                    : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
                }`}
                aria-label={`View image ${index + 1}`}
              >
                {/* Loading skeleton */}
                {!imageLoaded[`thumb-${index}`] && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}

                <Image
                  src={image}
                  alt={`${productTitle} thumbnail ${index + 1}`}
                  fill
                  sizes="80px"
                  className={`object-cover transition-opacity ${
                    imageLoaded[`thumb-${index}`] ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => handleImageLoad(`thumb-${index}`)}
                />

                {/* Selected indicator */}
                {selectedIndex === index && (
                  <div className="absolute inset-0 bg-pink-600/10" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
              aria-label="Close lightbox"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white text-sm rounded-full z-10">
              {selectedIndex + 1} / {allImages.length}
            </div>

            {/* Main lightbox image */}
            <div 
              className="absolute inset-0 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="relative max-w-6xl max-h-full w-full h-full flex items-center justify-center"
              >
                <div 
                  className={`relative w-full h-full cursor-${isZoomed ? 'zoom-out' : 'zoom-in'}`}
                  onClick={toggleZoom}
                >
                  <Image
                    src={allImages[selectedIndex]}
                    alt={`${productTitle} - Lightbox image ${selectedIndex + 1}`}
                    fill
                    sizes="100vw"
                    className={`object-contain transition-transform duration-300 ${
                      isZoomed ? 'scale-150' : 'scale-100'
                    }`}
                    style={
                      isZoomed
                        ? {
                            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                          }
                        : {}
                    }
                    quality={100}
                  />
                </div>
              </motion.div>
            </div>

            {/* Navigation arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
                  aria-label="Previous image"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
                  aria-label="Next image"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Thumbnail strip at bottom */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-2xl w-full px-4">
                <div className="flex gap-2 justify-center overflow-x-auto scrollbar-hide py-2">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleThumbnailClick(index);
                      }}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                        selectedIndex === index
                          ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-black'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions hint */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/60 text-sm text-center hidden md:block">
              <p>Click image to zoom • Arrow keys to navigate • ESC to close</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}