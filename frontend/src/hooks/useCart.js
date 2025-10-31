/**
 * Custom hook for cart management
 * Re-exports useCart from CartContext for centralized cart state management
 * 
 * @module hooks/useCart
 * @returns {Object} Cart context with items, addToCart, removeFromCart, updateQuantity, clearCart
 * 
 * @example
 * import useCart from '@/hooks/useCart'
 * 
 * function ProductCard({ product }) {
 *   const { addToCart, items } = useCart()
 *   
 *   const handleAddToCart = () => {
 *     addToCart({
 *       id: product.id,
 *       name: product.name,
 *       price: product.price,
 *       quantity: 1,
 *       image: product.image
 *     })
 *   }
 *   
 *   return (
 *     <div>
 *       <h3>{product.name}</h3>
 *       <button onClick={handleAddToCart}>Add to Cart</button>
 *       <span>Cart Items: {items.length}</span>
 *     </div>
 *   )
 * }
 */

import { useCart } from '@/context/CartContext'

export default useCart