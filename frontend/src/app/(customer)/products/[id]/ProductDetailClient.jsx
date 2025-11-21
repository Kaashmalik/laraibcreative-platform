"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ZoomIn, Upload, Sparkles, Calculator } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import ProductStructuredData from '@/components/shared/ProductStructuredData';
import ProductImageZoom from '@/components/customer/ProductImageZoom';
import ReplicaUploadSection from '@/components/customer/ReplicaUploadSection';
import KarhaiEmbroideryOptions from '@/components/customer/KarhaiEmbroideryOptions';
import CustomPriceCalculator from '@/components/customer/CustomPriceCalculator';
import RelatedProductsSlider from '@/components/customer/RelatedProductsSlider';
import api from '@/lib/api';

/**
 * Enhanced Product Detail Client Component
 * Includes zoom, replica upload, karhai options, price calculator, and related products
 */
export default function ProductDetailClient({ params: serverParams }) {
  const clientParams = useParams();
  const router = useRouter();
  const params = serverParams || clientParams;
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [replicaFiles, setReplicaFiles] = useState([]);
  const [embroideryOptions, setEmbroideryOptions] = useState(null);
  const [calculatedPrice, setCalculatedPrice] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.products.getById(params.id);
        const productData = response?.product || response;
        setProduct(productData);
        
        // Fetch related products
        if (productData) {
          try {
            const related = await api.products.getRelated(productData._id || productData.id, {
              type: productData.type,
              category: productData.category?._id || productData.category,
              limit: 8,
            });
            setRelatedProducts(related?.products || related?.data || related || []);
          } catch (error) {
            console.error('Error fetching related products:', error);
            setRelatedProducts([]);
          }
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
      const cartItem = {
        id: product._id || product.id,
        name: product.title || product.name,
        price: calculatedPrice?.totalPrice || product.pricing?.basePrice || product.price,
        image: product.primaryImage || product.images?.[0] || product.image,
        size: selectedSize,
        color: selectedColor,
        quantity,
        customizations: {
          replicaFiles: product.type === 'replica' ? replicaFiles : null,
          embroidery: product.type === 'karhai' ? embroideryOptions : null,
          priceBreakdown: calculatedPrice,
        },
      };
      addToCart(cartItem);
    }
  };

  // Safely handle images array
  const images = product?.images?.length > 0 
    ? product.images.map(img => typeof img === 'string' ? img : img?.url || img)
    : (product?.primaryImage || product?.image ? [product.primaryImage || product.image] : []);
  const currentImage = images[currentImageIndex] || images[0] || '/images/placeholder.png';
  
  // Ensure currentImageIndex is within bounds
  useEffect(() => {
    if (currentImageIndex >= images.length && images.length > 0) {
      setCurrentImageIndex(0);
    }
  }, [images.length, currentImageIndex]);
  const basePrice = product?.pricing?.basePrice || product?.price || 0;
  const productType = product?.type || 'ready-made';

  // Get current page URL for structured data
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

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
      {/* JSON-LD Structured Data */}
      {product && (
        <ProductStructuredData
          product={product}
          url={currentUrl}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        {product && (
          <>
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm text-gray-600">
              <a href="/" className="hover:text-pink-600">Home</a>
              {' / '}
              <a href="/products" className="hover:text-pink-600">Products</a>
              {' / '}
              <span className="text-gray-900">{product.title || product.name}</span>
            </nav>

            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Product Images with Zoom */}
              <div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 cursor-zoom-in"
                  onClick={() => setShowZoom(true)}
                >
                  <Image
                    src={currentImage || '/images/placeholder.png'}
                    alt={product.title || product.name}
                    fill
                    className="object-cover"
                    priority
                    quality={90}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPg=="
                  />
                  <div className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full">
                    <ZoomIn className="w-5 h-5 text-gray-700" />
                  </div>
                </motion.div>

                {/* Thumbnail Gallery */}
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.slice(0, 4).map((img, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          currentImageIndex === idx
                            ? 'border-pink-600'
                            : 'border-gray-200 hover:border-pink-300'
                        }`}
                      >
                        <Image
                          src={img || '/images/placeholder.png'}
                          alt={`${product.title} - Image ${idx + 1}`}
                          fill
                          className="object-cover"
                          quality={75}
                          sizes="100px"
                        />
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                {/* Title & Price */}
                <div>
                  <h1 className="text-4xl font-bold mb-2">{product.title || product.name}</h1>
                  {product.sku && (
                    <p className="text-sm text-gray-500 mb-4">SKU: {product.sku}</p>
                  )}
                  <div className="flex items-baseline gap-4">
                    <p className="text-3xl font-bold text-pink-600">
                      Rs. {basePrice.toLocaleString()}
                    </p>
                    {product.pricing?.originalPrice && (
                      <p className="text-lg text-gray-400 line-through">
                        Rs. {product.pricing.originalPrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>

                {/* Fabric Info */}
                {product.fabric && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Fabric Details</h3>
                    <p className="text-sm text-gray-600">Type: {product.fabric.type}</p>
                    {product.fabric.composition && (
                      <p className="text-sm text-gray-600">Composition: {product.fabric.composition}</p>
                    )}
                  </div>
                )}

                {/* Replica Upload Section */}
                {productType === 'replica' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-white border border-gray-200 rounded-lg"
                  >
                    <ReplicaUploadSection
                      onFilesChange={setReplicaFiles}
                      maxFiles={5}
                    />
                  </motion.div>
                )}

                {/* Karhai Embroidery Options */}
                {productType === 'karhai' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-white border border-gray-200 rounded-lg"
                  >
                    <KarhaiEmbroideryOptions
                      embroideryDetails={product.embroideryDetails}
                      onEmbroideryChange={setEmbroideryOptions}
                      basePrice={basePrice}
                    />
                  </motion.div>
                )}

                {/* Custom Price Calculator */}
                {(productType === 'replica' || productType === 'karhai' || product.customization?.allowFullyCustom) && (
                  <CustomPriceCalculator
                    basePrice={basePrice + (embroideryOptions?.additionalCost || 0)}
                    product={product}
                    onPriceChange={setCalculatedPrice}
                  />
                )}

                {/* Size Selection */}
                {product.sizeAvailability?.standardSizes && product.sizeAvailability.standardSizes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Size</label>
                    <div className="flex gap-2 flex-wrap">
                      {product.sizeAvailability.standardSizes.map((size) => (
                        <motion.button
                          key={size}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 border rounded transition-colors ${
                            selectedSize === size
                              ? 'bg-pink-600 text-white border-pink-600'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          {size}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium mb-2">Quantity</label>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 border rounded hover:bg-gray-50"
                    >
                      -
                    </motion.button>
                    <span className="px-6 font-medium text-lg">{quantity}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 border rounded hover:bg-gray-50"
                    >
                      +
                    </motion.button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleAddToCart}
                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-lg py-4"
                  >
                    Add to Cart
                  </Button>
                </motion.div>

                {/* Custom Order Button */}
                {product.availability?.status === 'custom-only' && (
                  <Button
                    onClick={() => router.push('/custom-order')}
                    variant="outlined"
                    className="w-full border-2 border-pink-600 text-pink-600 hover:bg-pink-50"
                  >
                    Order Custom Stitching
                  </Button>
                )}
              </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="mt-16">
                <RelatedProductsSlider
                  products={relatedProducts}
                  title={productType === 'replica' ? 'Similar Replicas' : 'Related Products'}
                  subtitle="You might also like"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Image Zoom Modal */}
      {showZoom && images.length > 0 && (
        <ProductImageZoom
          images={images}
          currentIndex={currentImageIndex}
          onClose={() => setShowZoom(false)}
        />
      )}
    </>
  );
}
