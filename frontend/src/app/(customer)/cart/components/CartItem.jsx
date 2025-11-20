"use client";

/**
 * CartItem Component
 * Individual cart item display with quantity controls and customization details
 * @location src/app/(customer)/cart/components/CartItem.jsx
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Minus, Plus, Package, Ruler } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { formatCurrency } from '@/lib/formatters';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const {
    productId,
    product,
    customizations = {},
    isCustom = false,
  } = item;

  const { id, title, image, price, sku } = product;
  const subtotal = price * quantity;

  // Handle quantity change with optimistic UI update
  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1 || newQuantity > 10) return;
    
    setIsUpdating(true);
    setQuantity(newQuantity);
    
    try {
      await onUpdateQuantity(productId, newQuantity);
    } catch (error) {
      // Revert on error
      setQuantity(item.quantity);
      console.error('Failed to update quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle item removal with confirmation
  const handleRemove = async () => {
    setShowRemoveDialog(false);
    try {
      await onRemove(productId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  return (
    <>
      <article 
        className="flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
        itemScope 
        itemType="https://schema.org/Product"
      >
        {/* Product Image */}
        <Link 
          href={`/products/${id}`}
          className="flex-shrink-0"
          aria-label={`View ${title}`}
        >
          <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={image || '/images/placeholder.png'}
              alt={title}
              fill
              sizes="(max-width: 768px) 96px, 112px"
              className="object-cover hover:scale-105 transition-transform duration-300"
              itemProp="image"
              quality={60}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPg=="
            />
          </div>
        </Link>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-3">
            <div>
              <Link 
                href={`/products/${id}`}
                className="block group"
              >
                <h3 
                  className="text-base md:text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2"
                  itemProp="name"
                >
                  {title}
                </h3>
              </Link>
              
              {/* SKU/Design Code */}
              {sku && (
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  <span>SKU: {sku}</span>
                </p>
              )}
            </div>

            {/* Unit Price */}
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900" itemProp="price">
                {formatCurrency(price)}
              </p>
              <meta itemProp="priceCurrency" content="PKR" />
            </div>
          </div>

          {/* Custom Order Badge & Details */}
          {isCustom && (
            <div className="mb-3">
              <Badge variant="secondary" className="mb-2">
                Custom Order
              </Badge>
              
              <div className="space-y-1 text-sm text-gray-600">
                {customizations.fabric && (
                  <p className="flex items-start gap-2">
                    <span className="font-medium">Fabric:</span>
                    <span>{customizations.fabric}</span>
                  </p>
                )}
                
                {customizations.measurements && (
                  <div className="flex items-start gap-2">
                    <Ruler className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Custom Measurements:</p>
                      <ul className="mt-1 space-y-0.5 text-xs">
                        {Object.entries(customizations.measurements).map(([key, value]) => (
                          <li key={key} className="capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}: {value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quantity Controls & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-3">
              <label htmlFor={`quantity-${productId}`} className="text-sm font-medium text-gray-700">
                Quantity:
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1 || isUpdating}
                  className="px-3 py-2 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                
                <input
                  id={`quantity-${productId}`}
                  type="number"
                  value={quantity}
                  readOnly
                  className="w-16 text-center border-x border-gray-300 py-2 font-medium focus:outline-none"
                  aria-label="Item quantity"
                  min="1"
                  max="10"
                />
                
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 10 || isUpdating}
                  className="px-3 py-2 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {isUpdating && (
                <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            {/* Subtotal & Remove Button */}
            <div className="flex items-center justify-between sm:justify-end gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-0.5">Subtotal</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(subtotal)}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRemoveDialog(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 min-w-[44px] min-h-[44px]"
                aria-label="Remove item from cart"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </article>

      {/* Remove Confirmation Dialog */}
      <Dialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
        title="Remove Item"
        description={`Are you sure you want to remove "${title}" from your cart?`}
      >
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => setShowRemoveDialog(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemove}
          >
            Remove
          </Button>
        </div>
      </Dialog>
    </>
  );
};

export default CartItem;