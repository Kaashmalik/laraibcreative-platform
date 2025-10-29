// backend/src/config/cloudinary.js
// ==========================================
// CLOUDINARY IMAGE STORAGE CONFIGURATION
// ==========================================
// Handles image uploads, transformations, and optimization
// for product images, reference images, and payment receipts
// ==========================================

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ==========================================
// CLOUDINARY CONFIGURATION
// ==========================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Force HTTPS URLs
});

// Verify configuration
const verifyCloudinaryConfig = () => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || 
      !process.env.CLOUDINARY_API_KEY || 
      !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('❌ Cloudinary credentials are missing in environment variables');
  }
  console.log('✅ Cloudinary: Configuration verified');
};

// ==========================================
// STORAGE CONFIGURATIONS FOR DIFFERENT TYPES
// ==========================================

/**
 * Product Images Storage
 * High quality, optimized for web
 */
const productImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'laraibcreative/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    transformation: [
      {
        width: 1920,
        height: 1920,
        crop: 'limit', // Don't upscale
        quality: 'auto:good',
        fetch_format: 'auto', // Automatically serve best format
      }
    ],
    public_id: (req, file) => {
      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      return `product_${timestamp}_${random}`;
    },
  },
});

/**
 * Thumbnail Images Storage
 * Smaller size for faster loading
 */
const thumbnailStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'laraibcreative/thumbnails',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      {
        width: 300,
        height: 300,
        crop: 'fill',
        gravity: 'auto',
        quality: 'auto:good',
        fetch_format: 'auto',
      }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      return `thumb_${timestamp}_${random}`;
    },
  },
});

/**
 * Reference Images Storage (Custom Orders)
 * Original quality preserved
 */
const referenceImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'laraibcreative/references',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      {
        quality: 'auto:best',
        fetch_format: 'auto',
      }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      return `ref_${timestamp}_${random}`;
    },
  },
});

/**
 * Payment Receipt Storage
 * Original quality, PDF support
 */
const receiptStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'laraibcreative/receipts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto', // Auto-detect image or raw
    public_id: (req, file) => {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      return `receipt_${timestamp}_${random}`;
    },
  },
});

/**
 * Blog Images Storage
 * Optimized for blog content
 */
const blogImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'laraibcreative/blog',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      {
        width: 1200,
        height: 630,
        crop: 'limit',
        quality: 'auto:good',
        fetch_format: 'auto',
      }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      return `blog_${timestamp}_${random}`;
    },
  },
});

/**
 * Profile Pictures Storage
 * Small, circular optimized
 */
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'laraibcreative/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [
      {
        width: 200,
        height: 200,
        crop: 'fill',
        gravity: 'face',
        quality: 'auto:good',
        fetch_format: 'auto',
      }
    ],
    public_id: (req, file) => {
      const userId = req.user?._id || 'guest';
      const timestamp = Date.now();
      return `avatar_${userId}_${timestamp}`;
    },
  },
});

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Upload single image to Cloudinary
 * @param {String} imagePath - Local file path or base64
 * @param {String} folder - Cloudinary folder name
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Upload result
 */
const uploadImage = async (imagePath, folder = 'laraibcreative/misc', options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder,
      quality: 'auto:good',
      fetch_format: 'auto',
      ...options,
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    console.error('❌ Cloudinary Upload Error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Upload multiple images
 * @param {Array} imagePaths - Array of local file paths
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise<Array>} Array of upload results
 */
const uploadMultipleImages = async (imagePaths, folder = 'laraibcreative/misc') => {
  try {
    const uploadPromises = imagePaths.map(path => uploadImage(path, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('❌ Multiple Upload Error:', error.message);
    throw error;
  }
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
    return {
      success: result.result === 'ok',
      message: result.result === 'ok' ? 'Image deleted successfully' : 'Image not found',
    };
  } catch (error) {
    console.error('❌ Cloudinary Delete Error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete multiple images
 * @param {Array} publicIds - Array of Cloudinary public IDs
 * @returns {Promise<Object>} Deletion result
 */
const deleteMultipleImages = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    
    return {
      success: true,
      deleted: result.deleted,
      notFound: result.not_found || [],
    };
  } catch (error) {
    console.error('❌ Multiple Delete Error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get image details
 * @param {String} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Image details
 */
const getImageDetails = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    
    return {
      success: true,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
      createdAt: result.created_at,
    };
  } catch (error) {
    console.error('❌ Get Image Details Error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Generate optimized image URL with transformations
 * @param {String} publicId - Cloudinary public ID
 * @param {Object} transformations - Transformation options
 * @returns {String} Transformed image URL
 */
const getOptimizedUrl = (publicId, transformations = {}) => {
  const defaultTransformations = {
    quality: 'auto:good',
    fetch_format: 'auto',
  };

  return cloudinary.url(publicId, {
    ...defaultTransformations,
    ...transformations,
  });
};

/**
 * Extract public ID from Cloudinary URL
 * @param {String} url - Cloudinary image URL
 * @returns {String} Public ID
 */
const extractPublicId = (url) => {
  try {
    // Extract from URL pattern: .../v1234567890/folder/filename.ext
    const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
    return matches ? matches[1] : null;
  } catch (error) {
    console.error('❌ Extract Public ID Error:', error.message);
    return null;
  }
};

/**
 * Check Cloudinary connection
 * @returns {Promise<Boolean>} Connection status
 */
const checkConnection = async () => {
  try {
    await cloudinary.api.ping();
    console.log('✅ Cloudinary: Connection successful');
    return true;
  } catch (error) {
    console.error('❌ Cloudinary Connection Failed:', error.message);
    return false;
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  cloudinary,
  
  // Storage configurations
  productImageStorage,
  thumbnailStorage,
  referenceImageStorage,
  receiptStorage,
  blogImageStorage,
  avatarStorage,
  
  // Utility functions
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  getImageDetails,
  getOptimizedUrl,
  extractPublicId,
  checkConnection,
  verifyCloudinaryConfig,
};