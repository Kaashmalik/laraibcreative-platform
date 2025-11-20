/**
 * Image Utility Functions
 * Helper functions for image optimization, blur placeholders, and responsive sizing
 */

/**
 * Generate a blur placeholder data URL
 * Creates a tiny base64-encoded image for smooth loading transitions
 * 
 * @param {number} width - Width of placeholder (default: 20)
 * @param {number} height - Height of placeholder (default: 20)
 * @returns {string} Base64 data URL
 */
export function generateBlurPlaceholder(width = 20, height = 20) {
  // Create a tiny 1x1 pixel transparent PNG, then scale it
  // This creates a blur effect when Next.js scales it up
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  
  if (!canvas) {
    // Server-side: return a simple base64 placeholder
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPg==';
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Fill with light gray
  ctx.fillStyle = '#F3F4F6';
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL();
}

/**
 * Get optimal image quality based on use case
 * 
 * @param {string} useCase - 'thumbnail' | 'card' | 'detail' | 'hero' | 'zoom' | 'logo'
 * @returns {number} Quality value (60-100)
 */
export function getImageQuality(useCase = 'card') {
  const qualityMap = {
    thumbnail: 60,
    card: 75,
    detail: 80,
    hero: 75,
    zoom: 100,
    logo: 75
  };
  
  return qualityMap[useCase] || 75;
}

/**
 * Get responsive sizes string based on use case
 * 
 * @param {string} useCase - 'thumbnail' | 'productCard' | 'productDetail' | 'hero' | 'cart' | 'review' | 'search'
 * @returns {string} Sizes string for Next.js Image
 */
export function getImageSizes(useCase = 'productCard') {
  const sizesMap = {
    thumbnail: "(max-width: 640px) 150px, 150px",
    productCard: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    productDetail: "(max-width: 1024px) 100vw, 50vw",
    hero: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw",
    cart: "(max-width: 768px) 96px, 112px",
    review: "80px",
    search: "64px",
    admin: "256px"
  };
  
  return sizesMap[useCase] || "(max-width: 768px) 100vw, 50vw";
}

/**
 * Check if image should have priority loading
 * 
 * @param {string} context - Image context (e.g., 'hero', 'productDetail', 'productCard')
 * @param {number} index - Image index in array (0 = first)
 * @returns {boolean} Whether to use priority loading
 */
export function shouldUsePriority(context, index = 0) {
  const priorityContexts = ['hero', 'logo', 'productDetail'];
  return priorityContexts.includes(context) && index === 0;
}

/**
 * Generate Cloudinary URL with optimization parameters
 * 
 * @param {string} imageUrl - Original image URL
 * @param {Object} options - Optimization options
 * @param {number} options.width - Desired width
 * @param {number} options.height - Desired height
 * @param {number} options.quality - Quality (1-100)
 * @param {string} options.format - Format ('webp', 'avif', 'auto')
 * @returns {string} Optimized Cloudinary URL
 */
export function getOptimizedImageUrl(imageUrl, options = {}) {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return imageUrl; // Return as-is if not Cloudinary
  }

  const {
    width,
    height,
    quality = 80,
    format = 'auto'
  } = options;

  const params = [];
  
  if (width) params.push(`w_${width}`);
  if (height) params.push(`h_${height}`);
  if (quality) params.push(`q_${quality}`);
  if (format) params.push(`f_${format}`);
  
  // Add auto-optimization
  params.push('c_limit'); // Limit dimensions
  params.push('fl_progressive'); // Progressive JPEG
  
  if (params.length === 0) return imageUrl;
  
  // Insert transformation parameters before filename
  const urlParts = imageUrl.split('/upload/');
  if (urlParts.length !== 2) return imageUrl;
  
  return `${urlParts[0]}/upload/${params.join(',')}/${urlParts[1]}`;
}

/**
 * Preload critical images
 * 
 * @param {string[]} imageUrls - Array of image URLs to preload
 */
export function preloadImages(imageUrls) {
  if (typeof window === 'undefined') return;
  
  imageUrls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Get image dimensions from URL (if available in metadata)
 * 
 * @param {string} imageUrl - Image URL
 * @returns {Promise<{width: number, height: number}>} Image dimensions
 */
export async function getImageDimensions(imageUrl) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve({ width: 1200, height: 1200 }); // Default server-side
      return;
    }
    
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      resolve({ width: 1200, height: 1200 }); // Default on error
    };
    img.src = imageUrl;
  });
}

