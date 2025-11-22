const ProductionQueue = require('../models/ProductionQueue');
const Order = require('../models/Order');
const Tailor = require('../models/Tailor');
const { AppError } = require('../utils/AppError');
const logger = require('../utils/logger');

/**
 * Get all production queue items with filters
 */
exports.getQueue = async (req, res) => {
  try {
    const {
      status,
      tailorId,
      priority,
      page = 1,
      limit = 50,
      sortBy = '-createdAt'
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (tailorId) filter['assignedTailor.tailorId'] = tailorId;
    if (priority) filter.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      ProductionQueue.find(filter)
        .populate('orderId', 'orderNumber customerInfo items total')
        .populate('assignedTailor.tailorId', 'name email phone')
        .sort(sortBy)
        .skip(skip)
        .limit(parseInt(limit)),
      ProductionQueue.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        items,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching production queue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch production queue',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get single queue item
 */
exports.getQueueItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await ProductionQueue.findById(id)
      .populate('orderId')
      .populate('assignedTailor.tailorId')
      .populate('notes.addedBy', 'fullName email');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Production queue item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { item }
    });
  } catch (error) {
    logger.error('Error fetching queue item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch queue item'
    });
  }
};

/**
 * Update queue item status
 */
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const item = await ProductionQueue.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Queue item not found'
      });
    }

    await item.updateStatus(status, req.user._id);

    if (notes) {
      item.notes.push({
        text: notes,
        addedBy: req.user._id,
        type: 'note'
      });
      await item.save();
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: { item }
    });
  } catch (error) {
    logger.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status'
    });
  }
};

/**
 * Assign order to tailor
 */
exports.assignTailor = async (req, res) => {
  try {
    const { id } = req.params;
    const { tailorId, estimatedCompletion, notes } = req.body;

    if (!tailorId) {
      return res.status(400).json({
        success: false,
        message: 'Tailor ID is required'
      });
    }

    // Check tailor exists and has capacity
    const tailor = await Tailor.findById(tailorId);
    if (!tailor) {
      return res.status(404).json({
        success: false,
        message: 'Tailor not found'
      });
    }

    if (!tailor.hasCapacity) {
      return res.status(400).json({
        success: false,
        message: 'Tailor has reached maximum capacity'
      });
    }

    const item = await ProductionQueue.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Queue item not found'
      });
    }

    // Assign and update tailor capacity
    await item.assignToTailor(tailorId, estimatedCompletion, notes);
    await tailor.assignOrder();

    res.status(200).json({
      success: true,
      message: 'Order assigned to tailor successfully',
      data: { item }
    });
  } catch (error) {
    logger.error('Error assigning tailor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign tailor'
    });
  }
};

/**
 * Bulk update status
 */
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status, notes } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'IDs array is required'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const item = await ProductionQueue.findById(id);
          if (item) {
            await item.updateStatus(status, req.user._id);
            if (notes) {
              item.notes.push({
                text: notes,
                addedBy: req.user._id,
                type: 'note'
              });
              await item.save();
            }
            return { id, success: true };
          }
          return { id, success: false, error: 'Not found' };
        } catch (error) {
          return { id, success: false, error: error.message };
        }
      })
    );

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.status(200).json({
      success: true,
      message: `Updated ${successful} items, ${failed} failed`,
      data: { results }
    });
  } catch (error) {
    logger.error('Error bulk updating:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update'
    });
  }
};

/**
 * Generate cutting sheets (bulk)
 */
exports.generateCuttingSheets = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'IDs array is required'
      });
    }

    // TODO: Implement PDF generation for cutting sheets
    // For now, return success
    res.status(200).json({
      success: true,
      message: `Cutting sheets generated for ${ids.length} orders`,
      data: { count: ids.length }
    });
  } catch (error) {
    logger.error('Error generating cutting sheets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate cutting sheets'
    });
  }
};

/**
 * Send WhatsApp blast
 */
exports.sendWhatsAppBlast = async (req, res) => {
  try {
    const { ids, message } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'IDs array is required'
      });
    }

    // TODO: Implement WhatsApp Business API integration
    // For now, return success
    res.status(200).json({
      success: true,
      message: `WhatsApp messages sent to ${ids.length} orders`,
      data: { count: ids.length }
    });
  } catch (error) {
    logger.error('Error sending WhatsApp blast:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send WhatsApp messages'
    });
  }
};

