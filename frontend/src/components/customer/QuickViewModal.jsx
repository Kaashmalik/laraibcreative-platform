'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, ShoppingCart, Heart, Share2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';

/**
 * Quick View Modal Component
 * Fast product preview without leaving the page
 */
export default function QuickViewModal({ product, isOpen, onClose, onAddToCart }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = product?.images || [product?.primaryImage || product?.image].filter(Boolean);
  const currentImage = images[currentImageIndex] || images[0];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product._id || product.id,
        name: product.title || product.name,
        price: product.pricing?.basePrice || product.price,
        image: product.primaryImage || product.images?.[0] || product.image,
        size: selectedSize,
        color: selectedColor,
        quantity,
      });
      if (onAddToCart) onAddToCart();
    }
  };

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-gray-900">
                  {product.title || product.name}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="grid md:grid-cols-2 gap-6 p-6">
                {/* Images */}
                <div>
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <Image
                      src={currentImage || '/images/placeholder.png'}
                      alt={product.title || product.name}
                      fill
                      className="object-cover"
                      quality={85}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  {images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {images.slice(0, 4).map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            currentImageIndex === idx
                              ? 'border-pink-600 scale-105'
                              : 'border-gray-200 hover:border-pink-300'
                          }`}
                        >
                          <Image
                            src={img || '/images/placeholder.png'}
                            alt={`${product.title} - Image ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="100px"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-4">
                  {/* Price */}
                  <div>
                    <p className="text-3xl font-bold text-pink-600">
                      Rs. {(product.pricing?.basePrice || product.price)?.toLocaleString()}
                    </p>
                    {product.sku && (
                      <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 line-clamp-4">
                    {product.description}
                  </p>

                  {/* Fabric Info */}
                  {product.fabric && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Fabric:</span> {product.fabric.type}
                      </p>
                    </div>
                  )}

                  {/* Size Selection */}
                  {product.availableSizes && product.availableSizes.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Size</label>
                      <div className="flex gap-2 flex-wrap">
                        {product.availableSizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-2 border rounded transition-colors ${
                              selectedSize === size
                                ? 'bg-pink-600 text-white border-pink-600'
                                : 'bg-white hover:bg-gray-50'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Quantity</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-1 border rounded hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="px-4 font-medium">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-1 border rounded hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleAddToCart}
                      className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                    >
                      <ShoppingCart size={18} className="mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outlined"
                      className="px-4"
                      aria-label="Add to wishlist"
                    >
                      <Heart size={18} />
                    </Button>
                    <Button
                      variant="outlined"
                      className="px-4"
                      aria-label="Share"
                    >
                      <Share2 size={18} />
                    </Button>
                  </div>

                  {/* View Full Details Link */}
                  <a
                    href={`/products/${product._id || product.id}`}
                    className="block text-center text-pink-600 hover:text-pink-700 font-medium text-sm"
                  >
                    View Full Details →
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

