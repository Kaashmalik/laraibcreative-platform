'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Thumbs, Zoom, Pagination } from 'swiper/modules';

// Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/zoom';
import 'swiper/css/pagination';

// Custom styles for Swiper navigation buttons if needed
import './gallery.css';

/**
 * ImageGallery Component
 * 
 * Professional image gallery using Swiper.js
 * Features:
 * - Mobile-friendly touch gestures
 * - Double-tap/Pinch to zoom (in lightbox)
 * - Thumbnail navigation
 * - Smooth physics-based transitions
 */
export default function ImageGallery({
  images = [],
  primaryImage = '',
  productTitle = 'Product'
}) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [initialSlide, setInitialSlide] = useState(0);

  // Normalize images array
  const allImages = primaryImage
    ? [primaryImage, ...images.filter(img => img !== primaryImage)]
    : images.length > 0 ? images : ['/images/placeholder.png'];

  const openLightbox = (index) => {
    setInitialSlide(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = 'unset';
  };

  return (
    <>
      <div className="space-y-4">
        {/* Main Swiper - Page View */}
        <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden group">
          <Swiper
            spaceBetween={10}
            navigation={true}
            pagination={{ clickable: true }}
            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            modules={[FreeMode, Navigation, Thumbs, Pagination]}
            className="h-full w-full"
            loop={allImages.length > 1}
          >
            {allImages.map((src, index) => (
              <SwiperSlide key={index} className="relative">
                <div
                  className="relative w-full h-full cursor-zoom-in"
                  onClick={() => openLightbox(index)}
                >
                  <Image
                    src={src}
                    alt={`${productTitle} - Image ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority={index === 0}
                  />

                  {/* Zoom hint overlay */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Thumbnail Swiper */}
        {allImages.length > 1 && (
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={10}
            slidesPerView={4}
            freeMode={true}
            watchSlidesProgress={true}
            modules={[FreeMode, Navigation, Thumbs]}
            className="thumbs-swiper h-24"
            breakpoints={{
              640: { slidesPerView: 5 },
              768: { slidesPerView: 6 }
            }}
          >
            {allImages.map((src, index) => (
              <SwiperSlide key={index} className="cursor-pointer rounded-md overflow-hidden opacity-60 hover:opacity-100 transition-opacity thumb-slide">
                <div className="relative w-full h-full aspect-square">
                  <Image
                    src={src}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      {/* Lightbox Modal with Zoom */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-20 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Lightbox Swiper */}
            <Swiper
              initialSlide={initialSlide}
              zoom={{
                maxRatio: 3,
                minRatio: 1,
                toggle: true
              }}
              navigation={true}
              pagination={{
                type: 'fraction',
                clickable: true,
              }}
              modules={[Zoom, Navigation, Pagination]}
              className="w-full h-full"
            >
              {allImages.map((src, index) => (
                <SwiperSlide key={index} className="flex items-center justify-center">
                  <div className="swiper-zoom-container">
                    <Image
                      src={src}
                      alt={`${productTitle} - Full View ${index + 1}`}
                      fill
                      sizes="100vw"
                      className="object-contain"
                      quality={100}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Instructions (Mobile only) */}
            <div className="absolute bottom-6 left-0 right-0 text-center text-white/50 text-sm pointer-events-none z-20">
              Double tap to zoom • Swipe to navigate
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .thumb-slide.swiper-slide-thumb-active {
          opacity: 1;
          ring: 2px solid #db2777; /* pink-600 */
        }
        .swiper-button-next, .swiper-button-prev {
          color: #db2777;
        }
        .swiper-pagination-bullet-active {
          background: #db2777;
        }
        /* Fix for Next.js Image in swiper-zoom-container */
        .swiper-zoom-container img {
          position: relative !important;
          width: auto !important;
          height: auto !important;
          max-width: 100%;
          max-height: 100%;
        }
      `}</style>
    </>
  );
}