/**
 * Promo Code Controller
 * Manages promo code operations for admin
 */

const PromoCode = require('../models/PromoCode');
const logger = require('../utils/logger');

// ============================================================
// ADMIN CRUD OPERATIONS
// ============================================================

/**
 * @desc    Get all promo codes with pagination and filters
 * @route   GET /api/v1/admin/promo-codes
 * @access  Private (Admin)
 */
exports.getAllPromoCodes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (type) {
      filter.type = type;
    }

    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [promoCodes, total] = await Promise.all([
      PromoCode.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      PromoCode.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: promoCodes,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error in getAllPromoCodes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch promo codes',
      error: error.message
    });
  }
};

/**
 * @desc    Get active promo codes
 * @route   GET /api/v1/admin/promo-codes/active
 * @access  Private (Admin)
 */
exports.getActivePromoCodes = async (req, res) => {
  try {
    const now = new Date();

    const activeCodes = await PromoCode.find({
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { maxUses: { $gt: 0 } },
        { maxUses: null }
      ]
    })
    .sort({ createdAt: -1 })
    .lean();

    res.status(200).json({
      success: true,
      data: activeCodes,
      count: activeCodes.length
    });
  } catch (error) {
    logger.error('Error in getActivePromoCodes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active promo codes',
      error: error.message
    });
  }
};

/**
 * @desc    Get promo code statistics
 * @route   GET /api/v1/admin/promo-codes/stats
 * @access  Private (Admin)
 */
exports.getPromoCodeStats = async (req, res) => {
  try {
    const stats = await Promise.all([
      PromoCode.countDocuments(),
      PromoCode.countDocuments({ status: 'active' }),
      PromoCode.countDocuments({ status: 'inactive' }),
      PromoCode.countDocuments({ status: 'expired' }),
      PromoCode.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ]),
      PromoCode.aggregate([
        {
          $group: {
            _id: null,
            totalUses: { $sum: '$currentUses' },
            totalDiscount: { $sum: '$totalDiscountValue' }
          }
        }
      ])
    ]);

    const typeStats = stats[4].reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        total: stats[0],
        active: stats[1],
        inactive: stats[2],
        expired: stats[3],
        byType: typeStats,
        totalUses: stats[5][0]?.totalUses || 0,
        totalDiscount: stats[5][0]?.totalDiscount || 0
      }
    });
  } catch (error) {
    logger.error('Error in getPromoCodeStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch promo code statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Get promo code by ID
 * @route   GET /api/v1/admin/promo-codes/:id
 * @access  Private (Admin)
 */
exports.getPromoCodeById = async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.id);

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found'
      });
    }

    res.status(200).json({
      success: true,
      data: promoCode
    });
  } catch (error) {
    logger.error('Error in getPromoCodeById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch promo code',
      error: error.message
    });
  }
};

/**
 * @desc    Create new promo code
 * @route   POST /api/v1/admin/promo-codes
 * @access  Private (Admin)
 */
exports.createPromoCode = async (req, res) => {
  try {
    const promoCode = await PromoCode.create({
      ...req.body,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Promo code created successfully',
      data: promoCode
    });
  } catch (error) {
    logger.error('Error in createPromoCode:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Promo code already exists'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create promo code',
      error: error.message
    });
  }
};

/**
 * @desc    Update promo code
 * @route   PUT /api/v1/admin/promo-codes/:id
 * @access  Private (Admin)
 */
exports.updatePromoCode = async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.id);

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found'
      });
    }

    Object.assign(promoCode, req.body);
    promoCode.updatedBy = req.user._id;
    await promoCode.save();

    res.status(200).json({
      success: true,
      message: 'Promo code updated successfully',
      data: promoCode
    });
  } catch (error) {
    logger.error('Error in updatePromoCode:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Promo code already exists'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update promo code',
      error: error.message
    });
  }
};

/**
 * @desc    Delete promo code
 * @route   DELETE /api/v1/admin/promo-codes/:id
 * @access  Private (Admin)
 */
exports.deletePromoCode = async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.id);

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found'
      });
    }

    await promoCode.delete();

    res.status(200).json({
      success: true,
      message: 'Promo code deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deletePromoCode:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete promo code',
      error: error.message
    });
  }
};

/**
 * @desc    Duplicate promo code
 * @route   POST /api/v1/admin/promo-codes/:id/duplicate
 * @access  Private (Admin)
 */
exports.duplicatePromoCode = async (req, res) => {
  try {
    const originalCode = await PromoCode.findById(req.params.id);

    if (!originalCode) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found'
      });
    }

    // Create duplicate with new code
    const { newLabel } = req.body;
    const newCode = await PromoCode.create({
      ...originalCode.toObject(),
      _id: undefined,
      code: `${originalCode.code}-COPY-${Date.now()}`,
      label: newLabel || `${originalCode.label} (Copy)`,
      currentUses: 0,
      status: 'inactive',
      createdBy: req.user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Promo code duplicated successfully',
      data: newCode
    });
  } catch (error) {
    logger.error('Error in duplicatePromoCode:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to duplicate promo code',
      error: error.message
    });
  }
};

/**
 * @desc    Validate promo code (test)
 * @route   POST /api/v1/admin/promo-codes/validate
 * @access  Private (Admin)
 */
exports.validatePromoCode = async (req, res) => {
  try {
    const { code, cartTotal, userId } = req.body;

    const promoCode = await PromoCode.findOne({ code: code.toUpperCase() });

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Invalid promo code'
      });
    }

    const validation = await promoCode.validatePromoCode(cartTotal, userId);

    res.status(200).json({
      success: validation.valid,
      message: validation.valid ? 'Promo code is valid' : validation.message,
      data: validation
    });
  } catch (error) {
    logger.error('Error in validatePromoCode:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate promo code',
      error: error.message
    });
  }
};

/**
 * @desc    Bulk delete promo codes
 * @route   DELETE /api/v1/admin/promo-codes/bulk-delete
 * @access  Private (Admin)
 */
exports.bulkDeletePromoCodes = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide promo code IDs'
      });
    }

    const result = await PromoCode.deleteMany({
      _id: { $in: ids }
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} promo codes`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    logger.error('Error in bulkDeletePromoCodes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete promo codes',
      error: error.message
    });
  }
};

/**
 * @desc    Bulk update promo code status
 * @route   PUT /api/v1/admin/promo-codes/bulk-update-status
 * @access  Private (Admin)
 */
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide promo code IDs'
      });
    }

    if (!['active', 'inactive', 'expired'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const result = await PromoCode.updateMany(
      { _id: { $in: ids } },
      {
        status,
        updatedBy: req.user._id,
        updatedAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: `Updated ${result.modifiedCount} promo codes to ${status}`,
      updatedCount: result.modifiedCount
    });
  } catch (error) {
    logger.error('Error in bulkUpdateStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update promo codes',
      error: error.message
    });
  }
};
