'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'

/**
 * MiniCart Component
 * 
 * Features:
 * - Slide-in drawer from right
 * - Cart items list with images
 * - Quantity adjustment (+ / -)
 * - Remove item with confirmation
 * - Subtotal calculation
 * - Quick checkout button
 * - Empty cart state
 * - Smooth animations
 */
export default function MiniCart({ isOpen, onClose }) {
  const { 
    cartItems, 
    cartCount, 
    cartSubtotal,
    updateQuantity, 
    removeFromCart 
  } = useCart()

  // Handle quantity change
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return
    updateQuantity(itemId, newQuantity)
  }

  // Handle remove item
  const handleRemove = (itemId) => {
    if (confirm('Remove this item from cart?')) {
      removeFromCart(itemId)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Cart Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2 text-primary-600" />
                Shopping Cart ({cartCount})
              </h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {cartItems.length === 0 ? (
                // Empty Cart State
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="w-16 h-16 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Add some beautiful designs to get started!
                  </p>
                  <Link
                    href="/products"
                    onClick={onClose}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                // Cart Items List
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex space-x-4 p-3 bg-gray-50 rounded-lg"
                    >
                      {/* Product Image */}
                      <Link
                        href={`/products/${item.productId}`}
                        onClick={onClose}
                        className="flex-shrink-0"
                      >
                        <Image
                          src={item.image || '/images/placeholder.png'}
                          alt={item.title}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.productId}`}
                          onClick={onClose}
                          className="font-medium text-gray-900 hover:text-primary-600 line-clamp-2 text-sm"
                        >
                          {item.title}
                        </Link>
                        
                        {/* Custom Order Badge */}
                        {item.isCustom && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">
                            Custom Order
                          </span>
                        )}

                        {/* Price */}
                        <p className="text-primary-600 font-semibold mt-1">
                          PKR {item.price.toLocaleString()}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="p-1.5 text-gray-600 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={item.quantity >= 10}
                              className="p-1.5 text-gray-600 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer - Subtotal & Checkout */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 px-6 py-4 space-y-4">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-xl font-bold text-gray-900">
                    PKR {cartSubtotal.toLocaleString()}
                  </span>
                </div>

                {/* Shipping Note */}
                <p className="text-xs text-gray-500 text-center">
                  Shipping charges will be calculated at checkout
                </p>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Link
                    href="/checkout"
                    onClick={onClose}
                    className="block w-full px-6 py-3 bg-primary-600 text-white text-center rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Proceed to Checkout
                  </Link>
                  <Link
                    href="/cart"
                    onClick={onClose}
                    className="block w-full px-6 py-3 bg-gray-100 text-gray-900 text-center rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    View Full Cart
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}