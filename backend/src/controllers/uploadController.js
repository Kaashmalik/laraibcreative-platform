// backend/src/controllers/uploadController.js
// ==========================================
// UPLOAD CONTROLLER
// ==========================================
// Handles all file upload operations with comprehensive error handling
// ==========================================

const { cloudinary, deleteImage, deleteMultipleImages } = require('../config/cloudinary');
const { processImage, validateImage } = require('../utils/imageProcessor');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

// ==========================================
// UPLOAD SINGLE FILE
// ==========================================
/**
 * @desc    Upload single file
 * @route   POST /api/upload/single
 * @access  Private
 */
exports.uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    logger.info(`File upload initiated: ${req.file.originalname}`);

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: req.file.path, // Cloudinary URL
        publicId: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        format: path.extname(req.file.originalname).substring(1)
      }
    });

    logger.info(`File uploaded successfully: ${req.file.filename}`);
  } catch (error) {
    logger.error('Upload Single Error:', error);
    
    // Cleanup on error
    if (req.file?.filename) {
      await deleteImage(req.file.filename).catch(err => 
        logger.error('Cleanup failed:', err)
      );
    }

    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ==========================================
// UPLOAD MULTIPLE FILES
// ==========================================
/**
 * @desc    Upload multiple files
 * @route   POST /api/upload/multiple
 * @access  Private
 */
exports.uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    logger.info(`Multiple file upload initiated: ${req.files.length} files`);

    const uploadedFiles = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      originalName: file.originalname,
      size: file.size,
      format: path.extname(file.originalname).substring(1)
    }));

    res.status(200).json({
      success: true,
      message: `${req.files.length} files uploaded successfully`,
      data: uploadedFiles
    });

    logger.info(`${req.files.length} files uploaded successfully`);
  } catch (error) {
    logger.error('Upload Multiple Error:', error);

    // Cleanup all uploaded files on error
    if (req.files && req.files.length > 0) {
      const publicIds = req.files.map(file => file.filename);
      await deleteMultipleImages(publicIds).catch(err =>
        logger.error('Cleanup failed:', err)
      );
    }

    res.status(500).json({
      success: false,
      message: 'Multiple file upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ==========================================
// UPLOAD PRODUCT IMAGES (Admin Only)
// ==========================================
/**
 * @desc    Upload product images with metadata
 * @route   POST /api/upload/product
 * @access  Private/Admin
 */
exports.uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No product images uploaded'
      });
    }

    const { altTexts } = req.body;
    let altTextArray = [];

    // Parse alt texts if provided
    if (altTexts) {
      try {
        altTextArray = JSON.parse(altTexts);
      } catch (e) {
        logger.warn('Failed to parse alt texts:', e.message);
      }
    }

    logger.info(`Product images upload: ${req.files.length} images`);

    const productImages = req.files.map((file, index) => ({
      url: file.path,
      publicId: file.filename,
      altText: altTextArray[index] || `Product image ${index + 1}`,
      isPrimary: index === 0, // First image is primary
      size: file.size,
      format: path.extname(file.originalname).substring(1)
    }));

    res.status(200).json({
      success: true,
      message: 'Product images uploaded successfully',
      data: productImages
    });

    logger.info(`Product images uploaded: ${req.files.length} images`);
  } catch (error) {
    logger.error('Product Images Upload Error:', error);

    // Cleanup on error
    if (req.files && req.files.length > 0) {
      const publicIds = req.files.map(file => file.filename);
      await deleteMultipleImages(publicIds).catch(err =>
        logger.error('Cleanup failed:', err)
      );
    }

    res.status(500).json({
      success: false,
      message: 'Product images upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ==========================================
// UPLOAD REFERENCE IMAGES (Custom Orders)
// ==========================================
/**
 * @desc    Upload reference images for custom orders
 * @route   POST /api/upload/reference
 * @access  Private
 */
exports.uploadReferenceImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No reference images uploaded'
      });
    }

    const { orderId, notes } = req.body;

    logger.info(`Reference images upload for order: ${orderId || 'New order'}`);

    const referenceImages = req.files.map((file, index) => ({
      url: file.path,
      publicId: file.filename,
      notes: notes ? JSON.parse(notes)[index] : '',
      size: file.size,
      uploadedAt: new Date()
    }));

    res.status(200).json({
      success: true,
      message: 'Reference images uploaded successfully',
      data: {
        orderId: orderId || null,
        images: referenceImages,
        totalImages: referenceImages.length
      }
    });

    logger.info(`Reference images uploaded: ${req.files.length} images`);
  } catch (error) {
    logger.error('Reference Images Upload Error:', error);

    // Cleanup on error
    if (req.files && req.files.length > 0) {
      const publicIds = req.files.map(file => file.filename);
      await deleteMultipleImages(publicIds).catch(err =>
        logger.error('Cleanup failed:', err)
      );
    }

    res.status(500).json({
      success: false,
      message: 'Reference images upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ==========================================
// UPLOAD PAYMENT RECEIPT
// ==========================================
/**
 * @desc    Upload payment receipt (image or PDF)
 * @route   POST /api/upload/receipt
 * @access  Private
 */
exports.uploadPaymentReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No receipt uploaded'
      });
    }

    const { orderId, paymentMethod, transactionId } = req.body;

    if (!orderId) {
      // Cleanup uploaded file
      await deleteImage(req.file.filename).catch(err =>
        logger.error('Cleanup failed:', err)
      );

      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    logger.info(`Payment receipt upload for order: ${orderId}`);

    const receiptData = {
      url: req.file.path,
      publicId: req.file.filename,
      orderId,
      paymentMethod: paymentMethod || 'bank_transfer',
      transactionId: transactionId || null,
      fileType: path.extname(req.file.originalname).substring(1).toLowerCase(),
      size: req.file.size,
      uploadedAt: new Date()
    };

    res.status(200).json({
      success: true,
      message: 'Payment receipt uploaded successfully',
      data: receiptData
    });

    logger.info(`Payment receipt uploaded for order: ${orderId}`);
  } catch (error) {
    logger.error('Receipt Upload Error:', error);

    // Cleanup on error
    if (req.file?.filename) {
      await deleteImage(req.file.filename).catch(err =>
        logger.error('Cleanup failed:', err)
      );
    }

    res.status(500).json({
      success: false,
      message: 'Receipt upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ==========================================
// UPLOAD BLOG IMAGE
// ==========================================
/**
 * @desc    Upload blog post image
 * @route   POST /api/upload/blog
 * @access  Private/Admin
 */
exports.uploadBlogImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No blog image uploaded'
      });
    }

    const { altText, caption } = req.body;

    logger.info(`Blog image upload: ${req.file.originalname}`);

    res.status(200).json({
      success: true,
      message: 'Blog image uploaded successfully',
      data: {
        url: req.file.path,
        publicId: req.file.filename,
        altText: altText || 'Blog image',
        caption: caption || '',
        size: req.file.size
      }
    });

    logger.info(`Blog image uploaded: ${req.file.filename}`);
  } catch (error) {
    logger.error('Blog Image Upload Error:', error);

    // Cleanup on error
    if (req.file?.filename) {
      await deleteImage(req.file.filename).catch(err =>
        logger.error('Cleanup failed:', err)
      );
    }

    res.status(500).json({
      success: false,
      message: 'Blog image upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ==========================================
// UPLOAD USER AVATAR
// ==========================================
/**
 * @desc    Upload user profile picture
 * @route   POST /api/upload/avatar
 * @access  Private
 */
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No avatar image uploaded'
      });
    }

    const userId = req.user._id;

    logger.info(`Avatar upload for user: ${userId}`);

    // TODO: Update user profile with new avatar URL
    // This would typically update the User model

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        url: req.file.path,
        publicId: req.file.filename,
        userId
      }
    });

    logger.info(`Avatar uploaded for user: ${userId}`);
  } catch (error) {
    logger.error('Avatar Upload Error:', error);

    // Cleanup on error
    if (req.file?.filename) {
      await deleteImage(req.file.filename).catch(err =>
        logger.error('Cleanup failed:', err)
      );
    }

    res.status(500).json({
      success: false,
      message: 'Avatar upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ==========================================
// DELETE IMAGE
// ==========================================
/**
 * @desc    Delete image from Cloudinary
 * @route   DELETE /api/upload/:publicId
 * @access  Private
 */
exports.deleteUploadedImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    // Decode publicId (it comes URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);

    logger.info(`Image deletion requested: ${decodedPublicId}`);

    const result = await deleteImage(decodedPublicId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: 'Image not found or already deleted'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });

    logger.info(`Image deleted: ${decodedPublicId}`);
  } catch (error) {
    logger.error('Delete Image Error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ==========================================
// DELETE MULTIPLE IMAGES
// ==========================================
/**
 * @desc    Delete multiple images from Cloudinary
 * @route   POST /api/upload/delete-multiple
 * @access  Private/Admin
 */
exports.deleteMultipleUploadedImages = async (req, res) => {
  try {
    const { publicIds } = req.body;

    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Public IDs array is required'
      });
    }

    logger.info(`Multiple images deletion requested: ${publicIds.length} images`);

    const result = await deleteMultipleImages(publicIds);

    res.status(200).json({
      success: true,
      message: `${Object.keys(result.deleted).length} images deleted successfully`,
      data: {
        deleted: Object.keys(result.deleted).length,
        notFound: result.notFound.length
      }
    });

    logger.info(`Multiple images deleted: ${Object.keys(result.deleted).length} images`);
  } catch (error) {
    logger.error('Delete Multiple Images Error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to delete images',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ==========================================
// GET UPLOAD STATS (Admin Only)
// ==========================================
/**
 * @desc    Get upload statistics
 * @route   GET /api/upload/stats
 * @access  Private/Admin
 */
exports.getUploadStats = async (req, res) => {
  try {
    // Get Cloudinary usage stats
    const usage = await cloudinary.api.usage();

    res.status(200).json({
      success: true,
      data: {
        storage: {
          used: usage.storage.usage,
          limit: usage.storage.limit,
          usedPercent: ((usage.storage.usage / usage.storage.limit) * 100).toFixed(2)
        },
        bandwidth: {
          used: usage.bandwidth.usage,
          limit: usage.bandwidth.limit,
          usedPercent: ((usage.bandwidth.usage / usage.bandwidth.limit) * 100).toFixed(2)
        },
        resources: usage.resources,
        requests: usage.requests
      }
    });

    logger.info('Upload stats retrieved successfully');
  } catch (error) {
    logger.error('Get Upload Stats Error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve upload statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};