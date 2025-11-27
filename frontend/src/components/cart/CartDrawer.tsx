'use client'

/**
 * Cart Drawer Component - Phase 4
 * Slide-out cart panel
 */

import { Fragment } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore, type CartItem } from '@/store/cart-store'

export function CartDrawer() {
  const { 
    items, 
    isOpen, 
    closeCart, 
    updateQuantity, 
    removeItem,
    getSubtotal,
    getStitchingTotal,
    getTotal,
    getItemCount
  } = useCartStore()

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary-gold" />
                <h2 className="text-lg font-semibold text-neutral-800">
                  Your Cart ({getItemCount()})
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <ShoppingBag className="w-16 h-16 text-neutral-300 mb-4" />
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-neutral-500 mb-6">
                  Looks like you haven&apos;t added anything yet
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="px-6 py-3 bg-primary-gold text-white rounded-xl font-semibold hover:bg-primary-gold-dark transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <Fragment>
                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {items.map((item) => (
                    <CartItemCard
                      key={item.id}
                      item={item}
                      onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
                      onRemove={() => removeItem(item.id)}
                    />
                  ))}
                </div>

                {/* Summary */}
                <div className="border-t border-neutral-200 p-4 space-y-4">
                  {/* Subtotal */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-neutral-600">
                      <span>Subtotal</span>
                      <span>PKR {getSubtotal().toLocaleString()}</span>
                    </div>
                    {getStitchingTotal() > 0 && (
                      <div className="flex justify-between text-neutral-600">
                        <span>Stitching</span>
                        <span>PKR {getStitchingTotal().toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-neutral-800">
                      <span>Total</span>
                      <span className="text-primary-gold">PKR {getTotal().toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Shipping Note */}
                  <p className="text-xs text-neutral-500 text-center">
                    Shipping calculated at checkout
                  </p>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Link
                      href="/checkout"
                      onClick={closeCart}
                      className="block w-full py-4 bg-primary-gold text-white text-center rounded-xl font-semibold hover:bg-primary-gold-dark transition-colors"
                    >
                      Checkout - PKR {getTotal().toLocaleString()}
                    </Link>
                    <button
                      onClick={closeCart}
                      className="block w-full py-3 border border-neutral-300 text-neutral-700 text-center rounded-xl font-medium hover:bg-neutral-50 transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </Fragment>
            )}
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>
  )
}

function CartItemCard({ 
  item, 
  onUpdateQuantity, 
  onRemove 
}: { 
  item: CartItem
  onUpdateQuantity: (qty: number) => void
  onRemove: () => void
}) {
  const price = item.product.salePrice || item.product.price
  const itemTotal = price * item.quantity
  const stitchingTotal = item.customization?.isStitched && item.product.stitchingPrice
    ? item.product.stitchingPrice * item.quantity
    : 0

  return (
    <div className="flex gap-4 p-3 bg-neutral-50 rounded-xl">
      {/* Image */}
      <Link href={`/products/${item.product.slug}`} className="relative w-20 h-24 rounded-lg overflow-hidden bg-neutral-200 flex-shrink-0">
        <Image
          src={item.product.image}
          alt={item.product.title}
          fill
          className="object-cover"
        />
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link 
          href={`/products/${item.product.slug}`}
          className="font-medium text-neutral-800 line-clamp-2 hover:text-primary-gold transition-colors"
        >
          {item.product.title}
        </Link>

        {/* Badges */}
        <div className="flex flex-wrap gap-1 mt-1">
          {item.customization?.isStitched && (
            <span className="text-xs bg-primary-rose/20 text-primary-rose-dark px-2 py-0.5 rounded">
              Stitched
            </span>
          )}
          {item.customization?.neckStyle && (
            <span className="text-xs bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded">
              {item.customization.neckStyle}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mt-2">
          <span className="font-semibold text-primary-gold">
            PKR {itemTotal.toLocaleString()}
          </span>
          {stitchingTotal > 0 && (
            <span className="text-xs text-neutral-500 ml-1">
              +{stitchingTotal.toLocaleString()} stitching
            </span>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-neutral-300 rounded-lg">
            <button
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              className="p-2 hover:bg-neutral-100 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-medium">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              className="p-2 hover:bg-neutral-100 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onRemove}
            className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
            aria-label="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default CartDrawer
