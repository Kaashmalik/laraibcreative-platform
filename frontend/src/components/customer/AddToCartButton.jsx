'use client';

import { ShoppingCart, Check } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import useAuth from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

export default function AddToCartButton({ 
  product, 
  quantity = 1,
  size = null,
  className = '' 
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const router = useRouter();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async () => {
    // Require login before adding to cart
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to your cart');
      const productSlug = product?.slug || product?._id || product?.id || '';
      router.push(`/auth/login?returnUrl=${encodeURIComponent(`/products/${productSlug}`)}`);
      return;
    }

    setIsAdding(true);
    
    try {
      const customizations = size ? { size } : undefined;
      await addItem(product, quantity, customizations);
      
      setAdded(true);
      toast.success('Added to cart!');
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding || added}
      className={`
        flex items-center justify-center gap-2 
        px-6 py-3 
        bg-blue-600 text-white 
        rounded-lg 
        hover:bg-blue-700 
        disabled:opacity-50 
        disabled:cursor-not-allowed
        transition-all duration-200
        font-medium
        ${className}
      `}
    >
      {added ? (
        <>
          <Check className="w-5 h-5" />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" />
          {isAdding ? 'Adding...' : 'Add to Cart'}
        </>
      )}
    </button>
  );
}
