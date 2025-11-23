'use client';

export const dynamic = 'force-dynamic';

import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    subtotal,
    shipping,
    discount,
    total,
    applyPromoCode,
    removePromoCode,
    promoCode: appliedPromoCode
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setIsApplyingPromo(true);
    try {
      await applyPromoCode(promoInput);
      setPromoInput('');
    } catch (error) {
      console.error('Failed to apply promo code:', error);
      // Error is handled in the context/store usually, but we can show a generic one if needed
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    removePromoCode();
    toast.success('Promo code removed');
  };

  if (!items || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link href="/products">
            <Button className="w-full sm:w-auto">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="p-4 sm:p-6 flex gap-4 sm:gap-6 transition-colors hover:bg-gray-50/50">
                  {/* Product Image */}
                  <div className="relative w-24 h-32 sm:w-32 sm:h-40 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={item.product.primaryImage || item.product.image || '/images/placeholder.png'}
                      alt={item.product.title || item.product.name || 'Product'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 96px, 128px"
                    />
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">
                          <Link href={`/products/${item.productId}`} className="hover:text-rose-600 transition-colors">
                            {item.product.title || item.product.name}
                          </Link>
                        </h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="mt-1 space-y-1">
                        {item.customizations?.size && (
                          <p className="text-sm text-gray-600">
                            Size: <span className="font-medium text-gray-900">{item.customizations.size}</span>
                          </p>
                        )}
                        {item.customizations?.color && (
                          <p className="text-sm text-gray-600">
                            Color: <span className="font-medium text-gray-900">{item.customizations.color}</span>
                          </p>
                        )}
                        {item.isCustom && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                            Custom Order
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-4 mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-50"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-medium text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-50 text-gray-600 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">
                          Rs. {((item.product.pricing?.basePrice || item.product.price || 0) * item.quantity).toLocaleString()}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-sm text-gray-500">
                            Rs. {(item.product.pricing?.basePrice || item.product.price || 0).toLocaleString()} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 justify-between items-center">
            <Link href="/products">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                Continue Shopping
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Clear Cart
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-medium text-gray-900">Rs. {subtotal.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-gray-600">
                <span>Shipping Estimate</span>
                <span className="font-medium text-gray-900">
                  {shipping === 0 ? 'Free' : `Rs. ${shipping.toLocaleString()}`}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-600 bg-green-50 p-2 rounded-lg">
                  <span className="flex items-center gap-2">
                    Discount
                    {appliedPromoCode && (
                      <span className="text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded">
                        {appliedPromoCode}
                      </span>
                    )}
                  </span>
                  <span className="font-medium">-Rs. {discount.toLocaleString()}</span>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4 flex justify-between items-end">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-rose-600">Rs. {total.toLocaleString()}</span>
                  <p className="text-xs text-gray-500 mt-1">Including taxes</p>
                </div>
              </div>
            </div>

            {/* Promo Code Section */}
            <div className="mb-6">
              <label htmlFor="promo" className="block text-sm font-medium text-gray-700 mb-2">
                Promo Code
              </label>
              {appliedPromoCode ? (
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <span className="font-medium text-gray-900">{appliedPromoCode}</span>
                  <button
                    onClick={handleRemovePromo}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    id="promo"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1"
                    disabled={isApplyingPromo}
                  />
                  <Button 
                    variant="secondary" 
                    onClick={handleApplyPromo}
                    disabled={isApplyingPromo || !promoInput.trim()}
                    isLoading={isApplyingPromo}
                  >
                    Apply
                  </Button>
                </div>
              )}
            </div>

            <Button 
              className="w-full py-4 text-lg shadow-lg shadow-rose-500/20"
              onClick={() => router.push('/checkout')}
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure Checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
