'use client';

import { ShoppingCart, Check } from 'lucide-react';
import { useState } from 'react';

export default function AddToCartButton({ 
  product, 
  quantity = 1,
  size = null,
  className = '' 
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    try {
      // Simulate API call or cart addition
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Here you would typically:
      // - Add to cart context/store
      // - Call API endpoint
      // - Update cart state
      
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
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
