'use client';

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Card Component - Reusable card container with multiple variants
 * 
 * @component
 * @example
 * // Basic card
 * <Card>
 *   <p>Card content goes here</p>
 * </Card>
 * 
 * // With header and footer
 * <Card
 *   header={<h3>Card Title</h3>}
 *   footer={<Button>Action</Button>}
 * >
 *   Card body content
 * </Card>
 * 
 * // Hoverable card
 * <Card hoverable onClick={handleClick}>
 *   Interactive card
 * </Card>
 */
const Card = ({
  children,
  header = null,
  footer = null,
  variant = 'default',
  hoverable = false,
  bordered = true,
  padding = 'md',
  className = '',
  onClick,
  ...rest
}) => {
  // Base styles
  const baseStyles = `
    rounded-xl bg-white
    transition-all duration-200 ease-out
    ${bordered ? 'border border-gray-200' : ''}
    ${hoverable ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  // Variant styles
  const variants = {
    default: 'shadow-md',
    flat: 'shadow-none',
    elevated: 'shadow-lg',
    gradient: 'bg-gradient-to-br from-pink-50 to-purple-50 shadow-md',
    outlined: 'shadow-none border-2 border-pink-200',
  };

  // Padding sizes
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const cardStyles = `${baseStyles} ${variants[variant]}`;

  return (
    <div className={cardStyles} onClick={onClick} {...rest}>
      {/* Header */}
      {header && (
        <div className={`${paddings[padding]} border-b border-gray-200 pb-4 mb-4`}>
          {header}
        </div>
      )}

      {/* Body */}
      <div className={header || footer ? paddings[padding] : paddings[padding]}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className={`${paddings[padding]} border-t border-gray-200 pt-4 mt-4`}>
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  /** Card content */
  children: PropTypes.node.isRequired,
  /** Card header */
  header: PropTypes.node,
  /** Card footer */
  footer: PropTypes.node,
  /** Visual variant */
  variant: PropTypes.oneOf(['default', 'flat', 'elevated', 'gradient', 'outlined']),
  /** Enable hover effect */
  hoverable: PropTypes.bool,
  /** Show border */
  bordered: PropTypes.bool,
  /** Padding size */
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
  /** Additional classes */
  className: PropTypes.string,
  /** Click handler */
  onClick: PropTypes.func,
};

// ProductCard - Specialized card for products
const ProductCard = ({ 
  image, 
  title, 
  price, 
  originalPrice,
  badge,
  rating,
  reviews,
  onClick,
  onWishlist,
  className = ''
}) => {
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  const handleWishlist = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onWishlist?.(!isWishlisted);
  };

  return (
    <Card 
      hoverable 
      padding="none" 
      onClick={onClick}
      className={`overflow-hidden group ${className}`}
    >
      {/* Image container */}
      <div className="relative overflow-hidden aspect-[3/4] bg-gray-100">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Badge */}
        {badge && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-pink-500 text-white text-xs font-semibold rounded-full shadow-md">
            {badge}
          </span>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all hover:scale-110"
          aria-label="Add to wishlist"
        >
          <svg 
            className={`w-5 h-5 transition-all ${isWishlisted ? 'fill-pink-500 text-pink-500' : 'fill-none text-gray-600'}`}
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Quick view overlay (appears on hover) */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform">
            Quick View
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
          {title}
        </h3>

        {/* Rating */}
        {rating && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            {reviews && (
              <span className="text-sm text-gray-500">({reviews})</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-pink-600">
            PKR {price.toLocaleString()}
          </span>
          {originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              PKR {originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

ProductCard.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  originalPrice: PropTypes.number,
  badge: PropTypes.string,
  rating: PropTypes.number,
  reviews: PropTypes.number,
  onClick: PropTypes.func,
  onWishlist: PropTypes.func,
  className: PropTypes.string,
};

// Demo component
const CardDemo = () => {
  const handleCardClick = (title) => {
    alert(`Clicked: ${title}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Card Component Library
          </h1>
          <p className="text-gray-600 mb-8">
            Production-ready card components for LaraibCreative platform
          </p>

          {/* Basic Cards */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <h3 className="font-semibold text-gray-900 mb-2">Default Card</h3>
                <p className="text-gray-600">This is a default card with shadow and border.</p>
              </Card>

              <Card variant="flat">
                <h3 className="font-semibold text-gray-900 mb-2">Flat Card</h3>
                <p className="text-gray-600">Card without shadow, minimal style.</p>
              </Card>

              <Card variant="elevated">
                <h3 className="font-semibold text-gray-900 mb-2">Elevated Card</h3>
                <p className="text-gray-600">Card with larger shadow for emphasis.</p>
              </Card>
            </div>
          </section>

          {/* Variant Styles */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Variant Styles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="gradient">
                <h3 className="font-semibold text-gray-900 mb-2">Gradient Card</h3>
                <p className="text-gray-600">Beautiful gradient background perfect for highlights.</p>
              </Card>

              <Card variant="outlined">
                <h3 className="font-semibold text-gray-900 mb-2">Outlined Card</h3>
                <p className="text-gray-600">Card with colored border and no shadow.</p>
              </Card>
            </div>
          </section>

          {/* With Header and Footer */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">With Header & Footer</h2>
            <Card
              header={
                <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
              }
              footer={
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all">
                    Confirm Order
                  </button>
                </div>
              }
            >
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">PKR 5,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">PKR 200</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-pink-600">PKR 5,200</span>
                </div>
              </div>
            </Card>
          </section>

          {/* Hoverable Cards */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Hoverable Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Bridal Collection', 'Party Wear', 'Casual Suits'].map((title) => (
                <Card 
                  key={title}
                  hoverable 
                  onClick={() => handleCardClick(title)}
                >
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-500 mt-1">Click to explore</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Padding Sizes */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Padding Sizes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card padding="sm" className="bg-pink-50">
                <p className="text-sm text-gray-700">Small padding (p-4)</p>
              </Card>
              <Card padding="md" className="bg-purple-50">
                <p className="text-sm text-gray-700">Medium padding (p-6)</p>
              </Card>
              <Card padding="lg" className="bg-blue-50">
                <p className="text-sm text-gray-700">Large padding (p-8)</p>
              </Card>
            </div>
          </section>
        </div>

        {/* Product Cards Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Cards</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProductCard
              image="https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=600&fit=crop"
              title="Elegant Bridal Red Velvet Suit with Heavy Embroidery"
              price={12500}
              originalPrice={15000}
              badge="Sale"
              rating={4.5}
              reviews={24}
              onClick={() => alert('Product clicked!')}
            />
            
            <ProductCard
              image="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop"
              title="Designer Party Wear Suit - Premium Chiffon"
              price={8500}
              badge="New"
              rating={5}
              reviews={18}
              onClick={() => alert('Product clicked!')}
            />
            
            <ProductCard
              image="https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=600&fit=crop"
              title="Casual Lawn Suit - Summer Collection"
              price={3500}
              rating={4}
              reviews={32}
              onClick={() => alert('Product clicked!')}
            />
            
            <ProductCard
              image="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=600&fit=crop"
              title="Formal Silk Suit with Embroidered Dupatta"
              price={9500}
              originalPrice={11000}
              rating={4.5}
              reviews={15}
              onClick={() => alert('Product clicked!')}
            />
          </div>
        </div>

        {/* Usage Code */}
        <div className="mt-8 bg-gray-900 rounded-xl p-6 text-gray-100 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-3 text-pink-400">Usage Examples</h3>
          <pre className="text-sm">
{`// Basic card
<Card>
  <p>Content goes here</p>
</Card>

// With header and footer
<Card
  header={<h3>Title</h3>}
  footer={<Button>Action</Button>}
>
  Card body content
</Card>

// Hoverable card
<Card hoverable onClick={handleClick}>
  Interactive content
</Card>

// Product card
<ProductCard
  image="/product.jpg"
  title="Product Name"
  price={5000}
  originalPrice={6000}
  badge="Sale"
  rating={4.5}
  reviews={24}
  onClick={handleClick}
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export { Card, ProductCard };
export default CardDemo;