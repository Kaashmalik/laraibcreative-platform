/**
 * Upload Middleware
 * Handles file uploads using Multer and Cloudinary
 * 
 * Features:
 * - Multiple file upload support
 * - File type validation
 * - File size limits
 * - Automatic Cloudinary upload
 * - Image optimization
 * - Error handling
 */

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('path');

// ============================================
// CLOUDINARY STORAGE CONFIGURATION
// ============================================

/**
 * Storage configuration for product images
 */
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'laraibcreative/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' }
    ]
  }
});

/**
 * Storage configuration for reference images (custom orders)
 */
const referenceStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'laraibcreative/references',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto:good' }
    ]
  }
});

/**
 * Storage configuration for payment receipts
 */
const receiptStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'laraibcreative/receipts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto'
  }
});

/**
 * Storage configuration for blog images
 */
const blogStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'laraibcreative/blog',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      { width: 1600, height: 900, crop: 'limit' },
      { quality: 'auto:best' }
    ]
  }
});

/**
 * Storage configuration for user avatars
 */
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'laraibcreative/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [
      { width: 300, height: 300, crop: 'fill', gravity: 'face' },
      { quality: 'auto:good' }
    ]
  }
});

// ============================================
// FILE FILTER VALIDATION
// ============================================

/**
 * Filter for images only
 */
const imageFileFilter = (req, file, cb) => {
  // Allowed extensions
  const allowedExtensions = /jpeg|jpg|png|webp/;
  
  // Check extension
  const extname = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );
  
  // Check mime type
  const mimetype = allowedExtensions.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, WebP) are allowed!'), false);
  }
};

/**
 * Filter for receipts (images and PDFs)
 */
const receiptFileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|pdf/;
  const extname = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedExtensions.test(file.mimetype) || file.mimetype === 'application/pdf';

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files or PDF are allowed for receipts!'), false);
  }
};

// ============================================
// MULTER CONFIGURATIONS
// ============================================

/**
 * Multer config for product images
 */
const productUpload = multer({
  storage: productStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10 // Max 10 files
  }
});

/**
 * Multer config for reference images
 */
const referenceUpload = multer({
  storage: referenceStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5 // Max 5 reference images
  }
});

/**
 * Multer config for payment receipts
 */
const receiptUpload = multer({
  storage: receiptStorage,
  fileFilter: receiptFileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB
    files: 1 // Single file only
  }
});

/**
 * Multer config for blog images
 */
const blogUpload = multer({
  storage: blogStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5
  }
});

/**
 * Multer config for user avatars
 */
const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1
  }
});

// ============================================
// MIDDLEWARE FUNCTIONS
// ============================================

/**
 * Upload single file
 * @param {string} fieldName - Form field name
 * @param {string} uploadType - Type of upload (product, receipt, avatar, etc.)
 */
const uploadSingle = (fieldName, uploadType = 'product') => {
  const uploaders = {
    product: productUpload,
    reference: referenceUpload,
    receipt: receiptUpload,
    blog: blogUpload,
    avatar: avatarUpload
  };

  const uploader = uploaders[uploadType] || productUpload;

  return (req, res, next) => {
    uploader.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer-specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size too large. Maximum size allowed is based on upload type.',
            error: err.message
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: 'Too many files uploaded',
            error: err.message
          });
        }
        return res.status(400).json({
          success: false,
          message: 'File upload error',
          error: err.message
        });
      } else if (err) {
        // Other errors (like file type validation)
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

/**
 * Upload multiple files
 * @param {string} fieldName - Form field name
 * @param {number} maxCount - Maximum number of files
 * @param {string} uploadType - Type of upload
 */
const uploadMultiple = (fieldName, maxCount = 5, uploadType = 'product') => {
  const uploaders = {
    product: productUpload,
    reference: referenceUpload,
    blog: blogUpload
  };

  const uploader = uploaders[uploadType] || productUpload;

  return (req, res, next) => {
    uploader.array(fieldName, maxCount)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'One or more files exceed the size limit',
            error: err.message
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: `Too many files. Maximum ${maxCount} files allowed`,
            error: err.message
          });
        }
        return res.status(400).json({
          success: false,
          message: 'File upload error',
          error: err.message
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

/**
 * Upload multiple fields with different files
 * @param {Array} fields - Array of field configurations [{name, maxCount}]
 * @param {string} uploadType - Type of upload
 */
const uploadFields = (fields, uploadType = 'product') => {
  const uploaders = {
    product: productUpload,
    reference: referenceUpload,
    blog: blogUpload
  };

  const uploader = uploaders[uploadType] || productUpload;

  return (req, res, next) => {
    uploader.fields(fields)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: 'File upload error',
          error: err.message
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

/**
 * Delete multiple files from Cloudinary
 * @param {Array} publicIds - Array of Cloudinary public IDs
 */
const deleteMultipleFromCloudinary = async (publicIds) => {
  try {
    await cloudinary.api.delete_resources(publicIds);
    return true;
  } catch (error) {
    console.error('Error deleting multiple files from Cloudinary:', error);
    throw error;
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string} - Public ID
 */
const extractPublicId = (url) => {
  if (!url) return null;
  
  // Extract public ID from Cloudinary URL
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  const publicId = filename.split('.')[0];
  
  // Include folder structure
  const folderIndex = parts.indexOf('laraibcreative');
  if (folderIndex !== -1) {
    const folder = parts.slice(folderIndex, parts.length - 1).join('/');
    return `${folder}/${publicId}`;
  }
  
  return publicId;
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Upload middleware
  uploadSingle,
  uploadMultiple,
  uploadFields,
  
  // Direct multer instances (for advanced usage)
  productUpload,
  referenceUpload,
  receiptUpload,
  blogUpload,
  avatarUpload,
  
  // Helper functions
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  extractPublicId
};