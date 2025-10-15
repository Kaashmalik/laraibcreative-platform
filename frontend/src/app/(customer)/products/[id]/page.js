// app/(customer)/products/[id]/page.js
import { notFound } from 'next/navigation';
import ImageGallery from '@/components/customer/ImageGallery';
import ReviewCard from '@/components/customer/ReviewCard';
import AddToCartButton from '@/components/customer/AddToCartButton';
import RatingStars from '@/components/customer/RatingStars';
import SocialShare from '@/components/customer/SocialShare';

/**
 * Product Detail Page
 * 
 * Features:
 * - Image gallery with zoom and lightbox
 * - Detailed product information
 * - Custom stitching options
 * - Measurement form integration
 * - Customer reviews with images
 * - Related products slider
 * - Social sharing
 * - Add to cart/wishlist
 * - SEO optimized with structured data
 * 
 * @param {Object} params - URL parameters containing product ID
 */

/**
 * Fetch product data server-side
 */
async function getProduct(id) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/api/products/${id}`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch product');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

/**
 * Fetch related products
 */
async function getRelatedProducts(categoryId, currentProductId) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(
      `${baseUrl}/api/products?category=${categoryId}&limit=6&exclude=${currentProductId}`,
      { next: { revalidate: 600 } }
    );

    if (!response.ok) return [];
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }) {
  const product = await getProduct(params.id);

  if (!product) {
    return {
      title: 'Product Not Found | LaraibCreative',
    };
  }

  return {
    title: `${product.title} - Custom Stitching Available | LaraibCreative`,
    description: product.description.substring(0, 160),
    keywords: [
      product.title,
      product.fabric?.type,
      'custom stitching',
      'ladies suits',
      'Pakistani fashion',
      ...product.seo?.keywords || [],
    ],
    openGraph: {
      title: product.title,
      description: product.description,
      images: [
        {
          url: product.primaryImage || product.images[0],
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
      type: 'product',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.description,
      images: [product.primaryImage || product.images[0]],
    },
  };
}

/**
 * Main Product Detail Component
 */
export default async function ProductDetailPage({ params }) {
  // Fetch product data
  const product = await getProduct(params.id);

  // Show 404 if product not found
  if (!product) {
    notFound();
  }

  // Fetch related products
  const relatedProducts = await getRelatedProducts(product.category, product._id);

  // Calculate discount percentage
  const discountPercentage = product.pricing?.discount || 0;
  const originalPrice = product.pricing?.basePrice || 0;
  const discountedPrice = originalPrice - (originalPrice * discountPercentage / 100);

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.images,
    description: product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'LaraibCreative',
    },
    offers: {
      '@type': 'Offer',
      url: `https://laraibcreative.com/products/${product._id}`,
      priceCurrency: 'PKR',
      price: discountedPrice,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: product.availability === 'in-stock' 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/PreOrder',
    },
    aggregateRating: product.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating,
      reviewCount: product.reviewCount,
    } : undefined,
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <a href="/" className="text-gray-500 hover:text-gray-700 transition-colors">
                  Home
                </a>
              </li>
              <li><span className="text-gray-400">/</span></li>
              <li>
                <a href="/products" className="text-gray-500 hover:text-gray-700 transition-colors">
                  Products
                </a>
              </li>
              <li><span className="text-gray-400">/</span></li>
              <li>
                <span className="text-gray-900 font-medium line-clamp-1">
                  {product.title}
                </span>
              </li>
            </ol>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12">
            {/* Image Gallery - Left Side */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <ImageGallery 
                images={product.images}
                primaryImage={product.primaryImage}
                productTitle={product.title}
              />
            </div>

            {/* Product Info - Right Side */}
            <div className="mt-8 lg:mt-0">
              {/* Title and Rating */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {product.title}
                </h1>
                
                <div className="flex items-center gap-4">
                  <RatingStars 
                    rating={product.averageRating || 0}
                    reviewCount={product.reviewCount || 0}
                  />
                  <span className="text-sm text-gray-500">
                    SKU: {product.sku}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6 p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-100">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    PKR {discountedPrice.toLocaleString()}
                  </span>
                  {discountPercentage > 0 && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        PKR {originalPrice.toLocaleString()}
                      </span>
                      <span className="px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded-full">
                        Save {discountPercentage}%
                      </span>
                    </>
                  )}
                </div>

                {product.pricing?.customStitchingCharge && (
                  <p className="text-sm text-pink-600 font-medium">
                    + PKR {product.pricing.customStitchingCharge.toLocaleString()} for custom stitching
                  </p>
                )}
              </div>

              {/* Fabric Information */}
              <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Fabric Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {product.fabric?.type || 'Premium Fabric'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Composition:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {product.fabric?.composition || 'N/A'}
                    </span>
                  </div>
                </div>
                {product.fabric?.care && (
                  <p className="mt-3 text-xs text-gray-600">
                    <span className="font-semibold">Care:</span> {product.fabric.care}
                  </p>
                )}
              </div>

              {/* Availability Status */}
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  {product.availability === 'in-stock' ? (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-700">In Stock</span>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium text-orange-700">Custom Order Only</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Estimated delivery: {product.estimatedDelivery || '7-10 business days'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-8">
                <AddToCartButton product={product} />
                
                <a
                  href="/custom-order"
                  className="block w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white text-center font-semibold rounded-lg transition-colors"
                >
                  Order Custom Stitching
                </a>

                <button
                  className="w-full px-6 py-4 border-2 border-pink-600 text-pink-600 hover:bg-pink-50 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  aria-label="Add to wishlist"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Add to Wishlist
                </button>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                <div className="prose prose-sm max-w-none text-gray-600">
                  {product.description}
                </div>
              </div>

              {/* Social Share */}
              <div className="border-t border-gray-200 pt-6">
                <SocialShare 
                  title={product.title}
                  url={`https://laraibcreative.com/products/${product._id}`}
                />
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
              <button className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition-colors">
                Write a Review
              </button>
            </div>

            {product.reviews && product.reviews.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {product.reviews.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-600 mb-4">Be the first to review this product!</p>
              </div>
            )}
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">You May Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <a
                    key={relatedProduct._id}
                    href={`/products/${relatedProduct._id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                        <img
                          src={relatedProduct.primaryImage || relatedProduct.images[0]}
                          alt={relatedProduct.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                          {relatedProduct.title}
                        </h3>
                        <p className="text-lg font-bold text-gray-900">
                          PKR {relatedProduct.pricing?.basePrice?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/**
 * Generate static params for popular products
 * This enables ISR for better performance
 */
export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/api/products?limit=20&featured=true`);
    
    if (!response.ok) return [];
    
    const data = await response.json();
    const products = data.products || [];
    
    return products.map((product) => ({
      id: product._id,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}