/**
 * Facebook Conversion API Hook
 * Client-side wrapper for conversion tracking
 */

import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import type { CartStore, CartItem } from '@/types/cart';

export function useFacebookConversion() {
  const user = useAuthStore((state: any) => state.user);
  const cart = useCartStore((state: CartStore) => state);

  const getUserData = () => {
    if (!user) return undefined;
    return {
      email: user.email,
      externalId: user.id,
      firstName: user.fullName?.split(' ')[0],
      lastName: user.fullName?.split(' ').slice(1).join(' '),
    };
  };

  const trackPurchase = async (orderId: string, value: number, currency: string = 'PKR') => {
    try {
      await fetch('/api/v1/facebook/conversion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventName: 'Purchase',
          eventId: orderId,
          userData: getUserData(),
          customData: {
            currency,
            value,
            contentIds: cart.items.map((item: CartItem) => item.productId),
            contentType: 'product',
          },
          eventSourceUrl: window.location.href,
        }),
      });
    } catch (error) {
      console.error('Failed to track purchase:', error);
    }
  };

  const trackAddToCart = async (productId: string, value: number, currency: string = 'PKR') => {
    try {
      await fetch('/api/v1/facebook/conversion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventName: 'AddToCart',
          userData: getUserData(),
          customData: {
            currency,
            value,
            contentIds: [productId],
            contentType: 'product',
          },
          eventSourceUrl: window.location.href,
        }),
      });
    } catch (error) {
      console.error('Failed to track add to cart:', error);
    }
  };

  const trackInitiateCheckout = async (currency: string = 'PKR') => {
    try {
      await fetch('/api/v1/facebook/conversion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventName: 'InitiateCheckout',
          userData: getUserData(),
          customData: {
            currency,
            value: cart.subtotal,
            contentIds: cart.items.map((item: CartItem) => item.productId),
            contentType: 'product',
          },
          eventSourceUrl: window.location.href,
        }),
      });
    } catch (error) {
      console.error('Failed to track checkout:', error);
    }
  };

  return {
    trackPurchase,
    trackAddToCart,
    trackInitiateCheckout,
  };
}

