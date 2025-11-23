/**
 * Cloudinary Image Loader for Next.js Image Optimization
 * Provides automatic format and quality optimization
 */

interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

// Default export required by Next.js
const cloudinaryLoader = ({ src, width, quality = 75 }: ImageLoaderProps): string => {
  // If it's already a Cloudinary URL, optimize it
  if (src.includes('res.cloudinary.com')) {
    // Extract the path from Cloudinary URL
    const url = new URL(src);
    const pathParts = url.pathname.split('/');
    const uploadIndex = pathParts.findIndex(part => part === 'upload');
    
    if (uploadIndex !== -1) {
      // Reconstruct with optimizations
      const beforeUpload = pathParts.slice(0, uploadIndex + 1).join('/');
      const afterUpload = pathParts.slice(uploadIndex + 1).join('/');
      
      // Add transformations: auto format, auto quality, width
      const transformations = [
        `w_${width}`,
        'c_limit', // Limit to original dimensions
        'f_auto', // Auto format (WebP, AVIF when supported)
        `q_auto:${quality === 75 ? 'good' : quality > 85 ? 'best' : 'eco'}`, // Auto quality
        'dpr_auto', // Auto device pixel ratio
      ].join(',');
      
      return `${url.origin}${beforeUpload}/${transformations}/${afterUpload}`;
    }
  }
  
  // For non-Cloudinary images, use Next.js optimization
  // This will be handled by Next.js Image component
  return src;
};

// Export as default for Next.js
export default cloudinaryLoader;

/**
 * Generate blur placeholder for images
 */
export const generateBlurPlaceholder = (): string => {
  // Base64 encoded 1x1 transparent PNG
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPg==';
};

/**
 * Get optimized image URL with Cloudinary transformations
 */
export const getOptimizedImageUrl = (
  src: string,
  width: number,
  height?: number,
  quality: number = 75
): string => {
  if (!src) return '/images/placeholder.png';
  
  // If it's a Cloudinary URL, add optimizations
  if (src.includes('res.cloudinary.com')) {
    const url = new URL(src);
    const pathParts = url.pathname.split('/');
    const uploadIndex = pathParts.findIndex(part => part === 'upload');
    
    if (uploadIndex !== -1) {
      const beforeUpload = pathParts.slice(0, uploadIndex + 1).join('/');
      const afterUpload = pathParts.slice(uploadIndex + 1).join('/');
      
      const transformations = [
        `w_${width}`,
        height ? `h_${height}` : '',
        'c_limit',
        'f_auto',
        `q_auto:${quality === 75 ? 'good' : quality > 85 ? 'best' : 'eco'}`,
        'dpr_auto',
      ].filter(Boolean).join(',');
      
      return `${url.origin}${beforeUpload}/${transformations}/${afterUpload}`;
    }
  }
  
  return src;
};

