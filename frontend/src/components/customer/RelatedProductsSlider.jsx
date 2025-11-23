'use client';


import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import QuickViewModal from './QuickViewModal';

/**
 * Related Products Slider Component
 * Shows similar products, especially replicas
 */
export default function RelatedProductsSlider({ 
  products = [], 
  title = 'Related Products',
  subtitle = 'You might also like'
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const productsPerView = 4;
  const maxIndex = Math.max(0, products.length - productsPerView);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const visibleProducts = products.slice(currentIndex, currentIndex + productsPerView);

  if (products.length === 0) return null;

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">{subtitle}</p>
      </div>

      {/* Slider Container */}
      <div className="relative overflow-hidden">
        {/* Navigation Buttons */}
        {products.length > productsPerView && (
          <>
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous products"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next products"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Products Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          animate={{
            x: currentIndex * -(100 / productsPerView) + '%',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {products.map((product, index) => (
            <motion.div
              key={product._id || product.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductCard
                product={product}
                onQuickView={() => setQuickViewProduct(product)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Dots Indicator */}
      {products.length > productsPerView && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(products.length / productsPerView) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * productsPerView)}
              className={`w-2 h-2 rounded-full transition-all ${
                Math.floor(currentIndex / productsPerView) === index
                  ? 'bg-pink-600 w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}

