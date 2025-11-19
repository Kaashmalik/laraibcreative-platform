// backend/src/controllers/measurementController.js

const Measurement = require('../models/Measurement');
const User = require('../models/User');
const logger = require('../utils/logger');
const { generateMeasurementSheet } = require('../utils/pdfGenerator');

/**
 * Create new measurement
 * @route POST /api/measurements
 * @access Private (Customer)
 */
exports.createMeasurement = async (req, res) => {
  try {
    const {
      label,
      measurementType,
      standardSize,
      measurements,
      tailorNotes,
      bodyType,
      isDefault,
      measurementImage
    } = req.body;

    // Validate measurement type
    if (!measurementType || !['standard', 'custom'].includes(measurementType)) {
      return res.status(400).json({
        success: false,
        message: 'Valid measurement type is required (standard or custom)'
      });
    }

    // Validate standard size if type is standard
    if (measurementType === 'standard') {
      if (!standardSize || !['XS', 'S', 'M', 'L', 'XL'].includes(standardSize)) {
        return res.status(400).json({
          success: false,
          message: 'Valid standard size is required for standard measurements'
        });
      }
    }

    // Validate custom measurements if type is custom
    if (measurementType === 'custom') {
      if (!measurements || typeof measurements !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Measurements object is required for custom type'
        });
      }

      // Check required fields
      const requiredFields = ['shoulder', 'bust', 'waist', 'hip', 'armhole', 'wrist', 'sleeveLength', 'shirtLength'];
      const missingFields = requiredFields.filter(field => !measurements[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required measurements: ${missingFields.join(', ')}`
        });
      }
    }

    // Prepare measurement data
    const measurementData = {
      user: req.user._id,
      label: label || 'My Measurements',
      measurementType,
      standardSize: measurementType === 'standard' ? standardSize : null,
      measurements: measurements || {},
      tailorNotes: tailorNotes || '',
      bodyType: bodyType || null,
      isDefault: isDefault || false,
      measurementImage: measurementImage || null
    };

    // Create measurement
    const measurement = await Measurement.create(measurementData);

    // Populate user details
    await measurement.populate('user', 'fullName email phone');

    logger.info(`Measurement created: ${measurement._id}`, {
      userId: req.user._id,
      type: measurementType
    });

    res.status(201).json({
      success: true,
      message: 'Measurement saved successfully',
      data: { measurement }
    });

  } catch (error) {
    logger.error('Error creating measurement:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create measurement',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all measurements for current user
 * @route GET /api/measurements
 * @access Private (Customer)
 */
exports.getMeasurements = async (req, res) => {
  try {
    const { includeDeleted = false, sortBy = '-updatedAt' } = req.query;

    // Build query
    const query = { user: req.user._id };
    
    if (includeDeleted !== 'true') {
      query.isDeleted = false;
    }

    // Fetch measurements
    const measurements = await Measurement.find(query)
      .sort(sortBy)
      .select('-__v')
      .lean();

    // Get default measurement
    const defaultMeasurement = measurements.find(m => m.isDefault);

    res.json({
      success: true,
      data: {
        measurements,
        defaultMeasurement,
        total: measurements.length
      }
    });

  } catch (error) {
    logger.error('Error fetching measurements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch measurements',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get single measurement by ID
 * @route GET /api/measurements/:id
 * @access Private (Customer)
 */
exports.getMeasurementById = async (req, res) => {
  try {
    const measurement = await Measurement.findById(req.params.id)
      .populate('user', 'fullName email phone')
      .populate('verifiedBy', 'fullName');

    if (!measurement) {
      return res.status(404).json({
        success: false,
        message: 'Measurement not found'
      });
    }

    // Check authorization (users can only view their own measurements)
    if (measurement.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this measurement'
      });
    }

    res.json({
      success: true,
      data: { measurement }
    });

  } catch (error) {
    logger.error('Error fetching measurement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch measurement',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update measurement
 * @route PUT /api/measurements/:id
 * @access Private (Customer)
 */
exports.updateMeasurement = async (req, res) => {
  try {
    const measurement = await Measurement.findById(req.params.id);

    if (!measurement) {
      return res.status(404).json({
        success: false,
        message: 'Measurement not found'
      });
    }

    // Check authorization
    if (measurement.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this measurement'
      });
    }

    // Check if measurement is deleted
    if (measurement.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update deleted measurement. Please restore it first.'
      });
    }

    const {
      label,
      measurementType,
      standardSize,
      measurements,
      tailorNotes,
      bodyType,
      isDefault,
      measurementImage
    } = req.body;

    // Update allowed fields
    if (label !== undefined) measurement.label = label;
    if (measurementType !== undefined) measurement.measurementType = measurementType;
    if (standardSize !== undefined) measurement.standardSize = standardSize;
    if (measurements !== undefined) measurement.measurements = measurements;
    if (tailorNotes !== undefined) measurement.tailorNotes = tailorNotes;
    if (bodyType !== undefined) measurement.bodyType = bodyType;
    if (isDefault !== undefined) measurement.isDefault = isDefault;
    if (measurementImage !== undefined) measurement.measurementImage = measurementImage;

    // Reset verification if measurements are modified
    if (measurements !== undefined) {
      measurement.isVerified = false;
      measurement.verifiedBy = null;
      measurement.verifiedAt = null;
    }

    await measurement.save();

    logger.info(`Measurement updated: ${measurement._id}`, {
      userId: req.user._id
    });

    res.json({
      success: true,
      message: 'Measurement updated successfully',
      data: { measurement }
    });

  } catch (error) {
    logger.error('Error updating measurement:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update measurement',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete measurement (soft delete)
 * @route DELETE /api/measurements/:id
 * @access Private (Customer)
 */
exports.deleteMeasurement = async (req, res) => {
  try {
    const measurement = await Measurement.findById(req.params.id);

    if (!measurement) {
      return res.status(404).json({
        success: false,
        message: 'Measurement not found'
      });
    }

    // Check authorization
    if (measurement.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this measurement'
      });
    }

    // Check if already deleted
    if (measurement.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Measurement is already deleted'
      });
    }

    // Soft delete
    await measurement.softDelete();

    logger.info(`Measurement deleted: ${measurement._id}`, {
      userId: req.user._id
    });

    res.json({
      success: true,
      message: 'Measurement deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting measurement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete measurement',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Restore soft-deleted measurement
 * @route PUT /api/measurements/:id/restore
 * @access Private (Customer)
 */
exports.restoreMeasurement = async (req, res) => {
  try {
    const measurement = await Measurement.findById(req.params.id).select('+isDeleted +deletedAt');

    if (!measurement) {
      return res.status(404).json({
        success: false,
        message: 'Measurement not found'
      });
    }

    // Check authorization
    if (measurement.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to restore this measurement'
      });
    }

    // Check if it's deleted
    if (!measurement.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Measurement is not deleted'
      });
    }

    // Restore
    await measurement.restore();

    logger.info(`Measurement restored: ${measurement._id}`, {
      userId: req.user._id
    });

    res.json({
      success: true,
      message: 'Measurement restored successfully',
      data: { measurement }
    });

  } catch (error) {
    logger.error('Error restoring measurement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore measurement',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Set measurement as default
 * @route PUT /api/measurements/:id/set-default
 * @access Private (Customer)
 */
exports.setDefaultMeasurement = async (req, res) => {
  try {
    const measurement = await Measurement.findById(req.params.id);

    if (!measurement) {
      return res.status(404).json({
        success: false,
        message: 'Measurement not found'
      });
    }

    // Check authorization
    if (measurement.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this measurement'
      });
    }

    // Check if deleted
    if (measurement.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Cannot set deleted measurement as default'
      });
    }

    // Set as default (this will automatically unset other defaults)
    await measurement.setAsDefault();

    logger.info(`Default measurement set: ${measurement._id}`, {
      userId: req.user._id
    });

    res.json({
      success: true,
      message: 'Default measurement updated successfully',
      data: { measurement }
    });

  } catch (error) {
    logger.error('Error setting default measurement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set default measurement',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Duplicate measurement
 * @route POST /api/measurements/:id/duplicate
 * @access Private (Customer)
 */
exports.duplicateMeasurement = async (req, res) => {
  try {
    const { newLabel } = req.body;

    const measurement = await Measurement.findById(req.params.id);

    if (!measurement) {
      return res.status(404).json({
        success: false,
        message: 'Measurement not found'
      });
    }

    // Check authorization
    if (measurement.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to duplicate this measurement'
      });
    }

    // Duplicate
    const duplicate = await measurement.duplicate(newLabel);

    logger.info(`Measurement duplicated: ${measurement._id} -> ${duplicate._id}`, {
      userId: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Measurement duplicated successfully',
      data: { measurement: duplicate }
    });

  } catch (error) {
    logger.error('Error duplicating measurement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to duplicate measurement',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Compare measurement with standard size
 * @route GET /api/measurements/:id/compare/:size
 * @access Private (Customer)
 */
exports.compareWithStandardSize = async (req, res) => {
  try {
    const { size } = req.params;

    // Validate size
    if (!['XS', 'S', 'M', 'L', 'XL'].includes(size)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid standard size'
      });
    }

    const measurement = await Measurement.findById(req.params.id);

    if (!measurement) {
      return res.status(404).json({
        success: false,
        message: 'Measurement not found'
      });
    }

    // Check authorization
    if (measurement.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this measurement'
      });
    }

    // Compare
    const comparison = measurement.compareWithStandardSize(size);

    res.json({
      success: true,
      data: { comparison, size }
    });

  } catch (error) {
    logger.error('Error comparing measurements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare measurements',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get suggested standard size
 * @route GET /api/measurements/:id/suggest-size
 * @access Private (Customer)
 */
exports.suggestStandardSize = async (req, res) => {
  try {
    const measurement = await Measurement.findById(req.params.id);

    if (!measurement) {
      return res.status(404).json({
        success: false,
        message: 'Measurement not found'
      });
    }

    // Check authorization
    if (measurement.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this measurement'
      });
    }

    // Get suggestion
    const suggestion = measurement.suggestStandardSize();

    res.json({
      success: true,
      data: { suggestion }
    });

  } catch (error) {
    logger.error('Error suggesting size:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suggest size',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get standard size chart
 * @route GET /api/measurements/size-chart
 * @access Public
 */
exports.getSizeChart = async (req, res) => {
  try {
    const sizeChart = Measurement.getSizeChart();

    res.json({
      success: true,
      data: { sizeChart }
    });

  } catch (error) {
    logger.error('Error fetching size chart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch size chart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Download measurement sheet as PDF
 * @route GET /api/measurements/:id/download
 * @access Private (Customer)
 */
exports.downloadMeasurementSheet = async (req, res) => {
  try {
    const measurement = await Measurement.findById(req.params.id);

    if (!measurement) {
      return res.status(404).json({
        success: false,
        message: 'Measurement not found'
      });
    }

    // Check authorization
    if (measurement.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to download this measurement'
      });
    }

    // Get user details
    const customer = await User.findById(measurement.user).select('fullName email phone');

    // Generate PDF
    const pdfBuffer = await generateMeasurementSheet(measurement, customer);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=measurement-${measurement.label.replace(/\s+/g, '-')}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);

    logger.info(`Measurement sheet downloaded: ${measurement._id}`, {
      userId: req.user._id
    });

  } catch (error) {
    logger.error('Error downloading measurement sheet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download measurement sheet',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Verify measurement (Admin only)
 * @route PUT /api/measurements/:id/verify
 * @access Private (Admin)
 */
exports.verifyMeasurement = async (req, res) => {
  try {
    const { notes } = req.body;

    const measurement = await Measurement.findById(req.params.id);

    if (!measurement) {
      return res.status(404).json({
        success: false,
        message: 'Measurement not found'
      });
    }

    // Check if already verified
    if (measurement.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Measurement is already verified'
      });
    }

    // Verify
    await measurement.verify(req.user._id);

    // Add notes if provided
    if (notes) {
      // You can extend the model to store verification notes if needed
      // For now, we'll just log it
      logger.info(`Measurement verified with notes: ${notes}`);
    }

    logger.info(`Measurement verified: ${measurement._id}`, {
      verifiedBy: req.user._id
    });

    res.json({
      success: true,
      message: 'Measurement verified successfully',
      data: { measurement }
    });

  } catch (error) {
    logger.error('Error verifying measurement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify measurement',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get measurement statistics (Admin only)
 * @route GET /api/measurements/analytics/stats
 * @access Private (Admin)
 */
exports.getMeasurementStatistics = async (req, res) => {
  try {
    const stats = await Measurement.getStats();

    res.json({
      success: true,
      data: { stats: stats[0] || {} }
    });

  } catch (error) {
    logger.error('Error fetching measurement statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all measurements for admin view
 * @route GET /api/measurements/admin/all
 * @access Private (Admin)
 */
exports.getAllMeasurementsAdmin = async (req, res) => {
  try {
    const {
      verified,
      needsUpdate,
      search,
      page = 1,
      limit = 20,
      sortBy = '-createdAt'
    } = req.query;

    // Build query
    let query = Measurement.find().active();

    // Filter by verification status
    if (verified === 'true') {
      query = query.verified();
    } else if (verified === 'false') {
      query = query.where({ isVerified: false });
    }

    // Filter measurements needing update
    if (needsUpdate === 'true') {
      query = query.needingUpdate();
    }

    // Search by user name or label
    if (search) {
      const users = await User.find({
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      const userIds = users.map(u => u._id);

      query = query.where({
        $or: [
          { user: { $in: userIds } },
          { label: { $regex: search, $options: 'i' } }
        ]
      });
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [measurements, total] = await Promise.all([
      query
        .populate('user', 'fullName email phone')
        .populate('verifiedBy', 'fullName')
        .sort(sortBy)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Measurement.countDocuments(query.getQuery())
    ]);

    res.json({
      success: true,
      data: {
        measurements,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching measurements for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch measurements',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = exports;