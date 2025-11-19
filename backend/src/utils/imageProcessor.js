// backend/src/utils/imageProcessor.js
// ==========================================
// IMAGE PROCESSOR
// ==========================================
// Advanced image processing, optimization, and validation using Sharp
// ==========================================

const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const logger = require('./logger');

// ==========================================
// CONFIGURATION
// ==========================================

const CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxWidth: 4000,
  maxHeight: 4000,
  minWidth: 100,
  minHeight: 100,
  allowedFormats: ['jpeg', 'jpg', 'png', 'webp', 'avif'],
  quality: {
    high: 90,
    medium: 80,
    low: 60
  },
  thumbnailSizes: {
    small: { width: 150, height: 150 },
    medium: { width: 300, height: 300 },
    large: { width: 600, height: 600 }
  }
};

// ==========================================
// VALIDATION FUNCTIONS
// ==========================================

/**
 * Validate image file
 * @param {String} filePath - Path to image file
 * @returns {Promise<Object>} Validation result
 */
exports.validateImage = async (filePath) => {
  try {
    const metadata = await sharp(filePath).metadata();
    const stats = await fs.stat(filePath);

    const errors = [];

    // Check file size
    if (stats.size > CONFIG.maxFileSize) {
      errors.push(`File size exceeds maximum ${CONFIG.maxFileSize / (1024 * 1024)}MB`);
    }

    // Check dimensions
    if (metadata.width > CONFIG.maxWidth || metadata.height > CONFIG.maxHeight) {
      errors.push(`Image dimensions exceed maximum ${CONFIG.maxWidth}x${CONFIG.maxHeight}px`);
    }

    if (metadata.width < CONFIG.minWidth || metadata.height < CONFIG.minHeight) {
      errors.push(`Image dimensions below minimum ${CONFIG.minWidth}x${CONFIG.minHeight}px`);
    }

    // Check format
    if (!CONFIG.allowedFormats.includes(metadata.format)) {
      errors.push(`Format ${metadata.format} not allowed. Allowed: ${CONFIG.allowedFormats.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: stats.size,
        hasAlpha: metadata.hasAlpha,
        space: metadata.space
      }
    };
  } catch (error) {
    logger.error('Image validation error:', error);
    return {
      valid: false,
      errors: ['Failed to validate image file'],
      metadata: null
    };
  }
};

/**
 * Check if image is corrupted
 * @param {String} filePath - Path to image file
 * @returns {Promise<Boolean>}
 */
exports.isImageCorrupted = async (filePath) => {
  try {
    await sharp(filePath).metadata();
    return false;
  } catch (error) {
    logger.error('Corrupted image detected:', error);
    return true;
  }
};

// ==========================================
// OPTIMIZATION FUNCTIONS
// ==========================================

/**
 * Optimize image (compress and resize if needed)
 * @param {String} inputPath - Input image path
 * @param {String} outputPath - Output image path
 * @param {Object} options - Optimization options
 * @returns {Promise<Object>} Optimization result
 */
exports.optimizeImage = async (inputPath, outputPath, options = {}) => {
  try {
    const {
      maxWidth = 1920,
      maxHeight = 1920,
      quality = CONFIG.quality.high,
      format = 'jpeg'
    } = options;

    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Resize if needed
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      image.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Apply format and quality
    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        image.jpeg({ quality, progressive: true });
        break;
      case 'png':
        image.png({ quality, compressionLevel: 9 });
        break;
      case 'webp':
        image.webp({ quality });
        break;
      case 'avif':
        image.avif({ quality });
        break;
    }

    await image.toFile(outputPath);

    const originalStats = await fs.stat(inputPath);
    const optimizedStats = await fs.stat(outputPath);
    const savedBytes = originalStats.size - optimizedStats.size;
    const savedPercent = ((savedBytes / originalStats.size) * 100).toFixed(2);

    logger.info(`Image optimized: ${savedPercent}% reduction`);

    return {
      success: true,
      originalSize: originalStats.size,
      optimizedSize: optimizedStats.size,
      savedBytes,
      savedPercent
    };
  } catch (error) {
    logger.error('Image optimization error:', error);
    throw error;
  }
};

/**
 * Generate thumbnail
 * @param {String} inputPath - Input image path
 * @param {String} outputPath - Output thumbnail path
 * @param {String} size - Thumbnail size (small, medium, large)
 * @returns {Promise<Object>}
 */
exports.generateThumbnail = async (inputPath, outputPath, size = 'medium') => {
  try {
    const dimensions = CONFIG.thumbnailSizes[size] || CONFIG.thumbnailSizes.medium;

    await sharp(inputPath)
      .resize(dimensions.width, dimensions.height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: CONFIG.quality.medium })
      .toFile(outputPath);

    logger.info(`Thumbnail generated: ${size} (${dimensions.width}x${dimensions.height})`);

    return {
      success: true,
      size,
      dimensions
    };
  } catch (error) {
    logger.error('Thumbnail generation error:', error);
    throw error;
  }
};

/**
 * Generate multiple thumbnails
 * @param {String} inputPath - Input image path
 * @param {String} outputDir - Output directory
 * @param {String} baseName - Base name for thumbnails
 * @returns {Promise<Object>}
 */
exports.generateMultipleThumbnails = async (inputPath, outputDir, baseName) => {
  try {
    const thumbnails = {};

    for (const [sizeName, dimensions] of Object.entries(CONFIG.thumbnailSizes)) {
      const outputPath = path.join(outputDir, `${baseName}_${sizeName}.jpg`);
      await exports.generateThumbnail(inputPath, outputPath, sizeName);
      thumbnails[sizeName] = outputPath;
    }

    logger.info(`Multiple thumbnails generated: ${Object.keys(thumbnails).length}`);

    return {
      success: true,
      thumbnails
    };
  } catch (error) {
    logger.error('Multiple thumbnails generation error:', error);
    throw error;
  }
};

// ==========================================
// TRANSFORMATION FUNCTIONS
// ==========================================

/**
 * Convert image format
 * @param {String} inputPath - Input image path
 * @param {String} outputPath - Output image path
 * @param {String} format - Target format
 * @param {Number} quality - Quality (1-100)
 * @returns {Promise<Object>}
 */
exports.convertFormat = async (inputPath, outputPath, format, quality = 80) => {
  try {
    const image = sharp(inputPath);

    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        await image.jpeg({ quality }).toFile(outputPath);
        break;
      case 'png':
        await image.png({ quality }).toFile(outputPath);
        break;
      case 'webp':
        await image.webp({ quality }).toFile(outputPath);
        break;
      case 'avif':
        await image.avif({ quality }).toFile(outputPath);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    logger.info(`Image converted to ${format}`);

    return {
      success: true,
      format,
      outputPath
    };
  } catch (error) {
    logger.error('Format conversion error:', error);
    throw error;
  }
};

/**
 * Add watermark to image
 * @param {String} inputPath - Input image path
 * @param {String} watermarkPath - Watermark image path
 * @param {String} outputPath - Output image path
 * @param {Object} options - Watermark options
 * @returns {Promise<Object>}
 */
exports.addWatermark = async (inputPath, watermarkPath, outputPath, options = {}) => {
  try {
    const {
      gravity = 'southeast',
      opacity = 0.5
    } = options;

    const watermark = await sharp(watermarkPath)
      .resize({ width: 200 })
      .composite([{
        input: Buffer.from([255, 255, 255, Math.round(opacity * 255)]),
        raw: { width: 1, height: 1, channels: 4 },
        tile: true,
        blend: 'dest-in'
      }])
      .toBuffer();

    await sharp(inputPath)
      .composite([{
        input: watermark,
        gravity
      }])
      .toFile(outputPath);

    logger.info('Watermark added successfully');

    return {
      success: true,
      outputPath
    };
  } catch (error) {
    logger.error('Watermark error:', error);
    throw error;
  }
};

/**
 * Crop image
 * @param {String} inputPath - Input image path
 * @param {String} outputPath - Output image path
 * @param {Object} cropData - Crop dimensions {left, top, width, height}
 * @returns {Promise<Object>}
 */
exports.cropImage = async (inputPath, outputPath, cropData) => {
  try {
    const { left, top, width, height } = cropData;

    await sharp(inputPath)
      .extract({ left, top, width, height })
      .toFile(outputPath);

    logger.info('Image cropped successfully');

    return {
      success: true,
      cropData,
      outputPath
    };
  } catch (error) {
    logger.error('Crop error:', error);
    throw error;
  }
};

/**
 * Rotate image
 * @param {String} inputPath - Input image path
 * @param {String} outputPath - Output image path
 * @param {Number} angle - Rotation angle (90, 180, 270)
 * @returns {Promise<Object>}
 */
exports.rotateImage = async (inputPath, outputPath, angle) => {
  try {
    await sharp(inputPath)
      .rotate(angle)
      .toFile(outputPath);

    logger.info(`Image rotated ${angle} degrees`);

    return {
      success: true,
      angle,
      outputPath
    };
  } catch (error) {
    logger.error('Rotation error:', error);
    throw error;
  }
};

// ==========================================
// METADATA FUNCTIONS
// ==========================================

/**
 * Get image metadata
 * @param {String} filePath - Path to image file
 * @returns {Promise<Object>}
 */
exports.getImageMetadata = async (filePath) => {
  try {
    const metadata = await sharp(filePath).metadata();
    const stats = await fs.stat(filePath);

    return {
      success: true,
      data: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: stats.size,
        space: metadata.space,
        channels: metadata.channels,
        depth: metadata.depth,
        density: metadata.density,
        hasAlpha: metadata.hasAlpha,
        orientation: metadata.orientation
      }
    };
  } catch (error) {
    logger.error('Metadata extraction error:', error);
    throw error;
  }
};

/**
 * Strip metadata (EXIF, etc.)
 * @param {String} inputPath - Input image path
 * @param {String} outputPath - Output image path
 * @returns {Promise<Object>}
 */
exports.stripMetadata = async (inputPath, outputPath) => {
  try {
    await sharp(inputPath)
      .withMetadata({
        exif: {},
        icc: null
      })
      .toFile(outputPath);

    logger.info('Metadata stripped successfully');

    return {
      success: true,
      outputPath
    };
  } catch (error) {
    logger.error('Strip metadata error:', error);
    throw error;
  }
};

// ==========================================
// CLEANUP FUNCTIONS
// ==========================================

/**
 * Delete temporary file
 * @param {String} filePath - Path to file
 * @returns {Promise<Boolean>}
 */
exports.deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    logger.info(`File deleted: ${filePath}`);
    return true;
  } catch (error) {
    logger.error('File deletion error:', error);
    return false;
  }
};

/**
 * Delete multiple temporary files
 * @param {Array} filePaths - Array of file paths
 * @returns {Promise<Object>}
 */
exports.deleteFiles = async (filePaths) => {
  try {
    const results = await Promise.allSettled(
      filePaths.map(filePath => fs.unlink(filePath))
    );

    const deleted = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    logger.info(`Files deleted: ${deleted} successful, ${failed} failed`);

    return {
      deleted,
      failed,
      total: filePaths.length
    };
  } catch (error) {
    logger.error('Multiple file deletion error:', error);
    throw error;
  }
};