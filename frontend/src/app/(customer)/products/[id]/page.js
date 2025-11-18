"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import SEO from '@/components/shared/SEO';
import { useCart } from '@/hooks/useCart';
import api from '@/lib/api';

export default function ProductDetailPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.products.getById(params.id);
        if (response && response.product) {
          setProduct(response.product);
        } else if (response) {
          setProduct(response);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product._id || product.id,
        name: product.title || product.name,
        price: product.pricing?.basePrice || product.price,
        image: product.primaryImage || product.images?.[0] || product.image,
        size: selectedSize,
        color: selectedColor,
        quantity
      });
    }
  };

  // SEO Structured Data for Product
  const structuredData = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title || product.name,
    description: product.description,
    image: product.images || [product.primaryImage || product.image],
    brand: {
      '@type': 'Brand',
      name: 'LaraibCreative'
    },
    offers: {
      '@type': 'Offer',
      price: product.pricing?.basePrice || product.price,
      priceCurrency: 'PKR',
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: typeof window !== 'undefined' ? window.location.href : ''
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 0
    } : undefined
  } : null;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {product && (
        <SEO
          title={product.title || product.name}
          description={product.description}
          keywords={product.seo?.keywords || [product.fabric?.type, product.category]}
          image={product.primaryImage || product.images?.[0] || product.image}
          url={typeof window !== 'undefined' ? window.location.href : ''}
          type="product"
          structuredData={structuredData}
        />
      )}
      <div className="container mx-auto px-4 py-8">
        {product && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Images */}
            <div>
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <Image
                  src={product.primaryImage || product.images?.[0] || product.image || '/images/placeholder.png'}
                  alt={product.title || product.name}
                  fill
                  className="object-cover"
                />
              </div>
              {/* Additional Images */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(0, 4).map((img, idx) => (
                    <div key={idx} className="relative aspect-square bg-gray-100 rounded overflow-hidden">
                      <Image
                        src={img}
                        alt={`${product.title || product.name} - Image ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold mb-4">{product.title || product.name}</h1>
              {product.sku && (
                <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
              )}
              <p className="text-2xl font-bold text-rose-600 mb-6">
                Rs. {(product.pricing?.basePrice || product.price)?.toLocaleString()}
              </p>

              <div className="mb-6">
                <p className="text-gray-700">{product.description}</p>
              </div>

              {/* Fabric Info */}
              {product.fabric && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Fabric Details</h3>
                  <p className="text-sm text-gray-600">Type: {product.fabric.type}</p>
                  {product.fabric.composition && (
                    <p className="text-sm text-gray-600">Composition: {product.fabric.composition}</p>
                  )}
                </div>
              )}

          {/* Size Selection */}
          {product.availableSizes && product.availableSizes.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Size</label>
              <div className="flex gap-2 flex-wrap">
                {product.availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded transition-colors ${
                      selectedSize === size ? 'bg-rose-600 text-white border-rose-600' : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 border rounded"
              >
                -
              </button>
              <span className="px-4">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-1 border rounded"
              >
                +
              </button>
            </div>
          </div>

          <Button onClick={handleAddToCart} className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700">
            Add to Cart
          </Button>

          {/* Custom Order Button */}
          {product.availability === 'custom-only' && (
            <Button 
              onClick={() => window.location.href = '/custom-order'} 
              className="w-full mt-4 bg-white border-2 border-pink-600 text-pink-600 hover:bg-pink-50"
            >
              Order Custom Stitching
            </Button>
          )}
        </div>
      </div>
        )}
      </div>
    </>
  );
}
