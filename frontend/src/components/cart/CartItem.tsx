'use client';


/**
 * CartItem Component - Production Ready
 * Individual cart item with quantity controls, customization details, and remove functionality
 * 
 * @module components/cart/CartItem
 */

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Minus, Plus, Package, Ruler, AlertCircle } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import type { CartItem as CartItemType } from '@/types/cart';

interface CartItemProps {
  item: CartItemType;
  onRemove?: (itemId: string) => void;
}

/**
 * CartItem Component
 */
export default function CartItem({ item, onRemove }: CartItemProps) {
  const { updateQuantity, isLoading } = useCart();
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const product = item.product;
  
  // Extract product ID
  const productId = product?._id || product?.id || item.productId || '';
  
  // Extract product slug
  const productSlug = product?.slug || productId;
  
  // Extract product name with fallbacks
  const productName = product?.title || product?.name || item.customizations?.name || 'Product';
  
  // Extract and clean image URL
  const getImageUrl = (img: any) => {
    if (!img) return null;
    if (typeof img === 'string') return img.replace(/^"|"$/g, '');
    if (img?.url) return img.url.replace(/^"|"$/g, '');
    return null;
  };
  
  const productImage = getImageUrl(product?.primaryImage) 
    || getImageUrl(product?.images?.[0])
    || getImageUrl(product?.image)
    || getImageUrl(item.customizations?.image)
    || '/images/placeholder.png';
  
  // Extract product price with validation
  const productPrice = typeof item.priceAtAdd === 'number' && !isNaN(item.priceAtAdd)
    ? item.priceAtAdd
    : (product?.pricing?.basePrice || product?.pricing?.comparePrice || product?.price || 0);
  
  const validPrice = typeof productPrice === 'number' && !isNaN(productPrice) ? productPrice : 0;
  const subtotal = validPrice * localQuantity;
  const stockAvailable = item.stockAvailable || product?.inventory?.stockQuantity || product?.stockQuantity || 0;
  const isOutOfStock = stockAvailable > 0 && localQuantity > stockAvailable;

  // Handle quantity change
  const handleQuantityChange = useCallback(
    async (newQuantity: number) => {
      if (newQuantity < 1 || newQuantity > 99) return;
      if (stockAvailable > 0 && newQuantity > stockAvailable) return;

      setIsUpdating(true);
      setLocalQuantity(newQuantity);

      try {
        await updateQuantity(item.id, newQuantity);
      } catch (error: any) {
        // Revert on error
        setLocalQuantity(item.quantity);
        console.error('Failed to update quantity:', error);
      } finally {
        setIsUpdating(false);
      }
    },
    [item.id, item.quantity, updateQuantity, stockAvailable]
  );

  // Handle remove
  const { removeItem: removeItemFromCart } = useCart();
  const handleRemove = useCallback(async () => {
    setShowRemoveConfirm(false);
    try {
      if (onRemove) {
        onRemove(item.id);
      } else {
        await removeItemFromCart(item.id);
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  }, [item.id, onRemove, removeItemFromCart]);

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <motion.article
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        className="flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
        itemScope
        itemType="https://schema.org/Product"
      >
        {/* Product Image */}
        <Link
          href={`/products/${productSlug}`}
          className="flex-shrink-0 group"
          aria-label={`View ${productName}`}
        >
          <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <Image
              src={productImage}
              alt={productName}
              fill
              sizes="(max-width: 768px) 96px, 112px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              itemProp="image"
              quality={75}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPg=="
            />
          </div>
        </Link>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-3">
            <div className="flex-1">
              <Link href={`/products/${productSlug}`} className="block group">
                <h3
                  className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2"
                  itemProp="name"
                >
                  {productName}
                </h3>
              </Link>

              {/* SKU */}
              {product.sku && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <Package className="w-3 h-3" aria-hidden="true" />
                  <span>SKU: {product.sku}</span>
                </p>
              )}

              {/* Custom Order Badge */}
              {item.isCustom && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                    Custom Order
                  </span>
                </div>
              )}

              {/* Customizations */}
              {item.customizations && Object.keys(item.customizations).length > 0 && (
                <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {item.customizations.fabric && (
                    <p>
                      <span className="font-medium">Fabric:</span> {item.customizations.fabric}
                    </p>
                  )}
                  {item.customizations.color && (
                    <p>
                      <span className="font-medium">Color:</span> {item.customizations.color}
                    </p>
                  )}
                  {item.customizations.size && (
                    <p>
                      <span className="font-medium">Size:</span> {item.customizations.size}
                    </p>
                  )}
                  {item.customizations.measurements && (
                    <div className="flex items-start gap-2">
                      <Ruler className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <p className="font-medium">Custom Measurements</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Unit Price */}
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100" itemProp="price">
                {formatPrice(productPrice)}
              </p>
              <meta itemProp="priceCurrency" content="PKR" />
            </div>
          </div>

          {/* Stock Warning */}
          {isOutOfStock && (
            <div className="flex items-center gap-2 mb-3 text-sm text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              <span>Only {stockAvailable} available in stock</span>
            </div>
          )}

          {/* Quantity Controls & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-3">
              <label htmlFor={`quantity-${item.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Quantity:
              </label>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(localQuantity - 1)}
                  disabled={localQuantity <= 1 || isUpdating || isLoading}
                  className="px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" aria-hidden="true" />
                </button>

                <input
                  id={`quantity-${item.id}`}
                  type="number"
                  value={localQuantity}
                  readOnly
                  className="w-16 text-center border-x border-gray-300 dark:border-gray-600 py-2 font-medium focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  aria-label="Item quantity"
                  min="1"
                  max={stockAvailable > 0 ? stockAvailable : 99}
                />

                <button
                  type="button"
                  onClick={() => handleQuantityChange(localQuantity + 1)}
                  disabled={
                    localQuantity >= 99 ||
                    (stockAvailable > 0 && localQuantity >= stockAvailable) ||
                    isUpdating ||
                    isLoading
                  }
                  className="px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              {isUpdating && (
                <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            {/* Subtotal & Remove Button */}
            <div className="flex items-center justify-between sm:justify-end gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Subtotal</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {formatPrice(subtotal)}
                </p>
              </div>

              <button
                onClick={() => setShowRemoveConfirm(true)}
                disabled={isUpdating || isLoading}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={`Remove ${productName} from cart`}
              >
                <Trash2 className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </motion.article>

      {/* Remove Confirmation Modal */}
      <AnimatePresence>
        {showRemoveConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Remove Item?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to remove &quot;{productName}&quot; from your cart?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowRemoveConfirm(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemove}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

