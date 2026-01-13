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

    const PDFDocument = require('pdfkit');
    const fs = require('fs');
    const path = require('path');

    // Fetch orders with measurements
    const orders = await ProductionQueue.find({ _id: { $in: ids } })
      .populate('orderId')
      .populate('tailorId', 'name phone');

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No orders found'
      });
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const pdfBuffers = [];

    // Collect PDF data
    doc.on('data', (chunk) => pdfBuffers.push(chunk));

    // Generate PDF content
    doc.fontSize(20).text('LaraibCreative - Cutting Sheets', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    orders.forEach((order, index) => {
      if (index > 0) {
        doc.addPage();
      }

      // Order header
      doc.fontSize(14).text(`Order #${order.orderId?.orderNumber || order.orderId}`, { underline: true });
      doc.moveDown();

      // Customer info
      if (order.orderId?.customerInfo) {
        const customer = order.orderId.customerInfo;
        doc.fontSize(11).text(`Customer: ${customer.fullName || 'N/A'}`);
        doc.text(`Phone: ${customer.phone || 'N/A'}`);
        doc.moveDown();
      }

      // Tailor assignment
      if (order.tailorId) {
        doc.text(`Assigned Tailor: ${order.tailorId.name || 'N/A'}`);
        doc.text(`Tailor Phone: ${order.tailorId.phone || 'N/A'}`);
        doc.moveDown();
      }

      // Product info
      if (order.orderItem?.productSnapshot) {
        const product = order.orderItem.productSnapshot;
        doc.text(`Product: ${product.title || 'N/A'}`);
        doc.text(`Design Code: ${product.designCode || 'N/A'}`);
        doc.text(`Quantity: ${order.orderItem.quantity || 1}`);
        doc.moveDown();
      }

      // Measurements table
      if (order.orderItem?.measurements) {
        const measurements = order.orderItem.measurements;
        doc.fontSize(12).text('Measurements:', { underline: true });
        doc.moveDown(0.5);

        const measurementLabels = {
          bust: 'Bust',
          waist: 'Waist',
          hips: 'Hips',
          shoulder: 'Shoulder',
          sleeveLength: 'Sleeve Length',
          shirtLength: 'Shirt Length',
          trouserLength: 'Trouser Length',
          trouserWaist: 'Trouser Waist',
          neck: 'Neck',
          armHole: 'Arm Hole',
          wrist: 'Wrist'
        };

        const tableTop = doc.y;
        const rowHeight = 25;
        const colWidth = 200;

        // Table header
        doc.fontSize(10).fillColor('black');
        doc.text('Measurement', 50, tableTop);
        doc.text('Value (inches)', 250, tableTop);
        doc.moveTo(50, tableTop + 15).lineTo(400, tableTop + 15).stroke();

        // Table rows
        let currentY = tableTop + 25;
        Object.entries(measurementLabels).forEach(([key, label]) => {
          if (measurements[key]) {
            doc.text(label, 50, currentY);
            doc.text(`${measurements[key]}"`, 250, currentY);
            currentY += rowHeight;
          }
        });

        doc.moveTo(50, currentY - 5).lineTo(400, currentY - 5).stroke();
        doc.moveDown(2);
      }

      // Custom details
      if (order.orderItem?.customDetails) {
        const custom = order.orderItem.customDetails;
        doc.fontSize(12).text('Custom Details:', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);

        if (custom.size) doc.text(`Size: ${custom.size}`);
        if (custom.color) doc.text(`Color: ${custom.color}`);
        if (custom.fabric) doc.text(`Fabric: ${custom.fabric}`);
        if (custom.stitchingType) doc.text(`Stitching Type: ${custom.stitchingType}`);
        if (custom.notes) {
          doc.moveDown(0.5);
          doc.text(`Notes: ${custom.notes}`);
        }
        doc.moveDown(2);
      }

      // Notes
      if (order.orderId?.notes) {
        doc.fontSize(12).text('Order Notes:', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).text(order.orderId.notes);
        doc.moveDown(2);
      }

      // Priority indicator
      if (order.priority === 'urgent') {
        doc.fontSize(12).fillColor('red').text('⚠ URGENT ORDER', { align: 'right' });
        doc.fillColor('black');
      } else if (order.priority === 'high') {
        doc.fontSize(12).fillColor('orange').text('⚡ HIGH PRIORITY', { align: 'right' });
        doc.fillColor('black');
      }

      doc.moveDown();
    });

    // Finalize PDF
    doc.end();

    // Wait for PDF to finish generating
    await new Promise((resolve, reject) => {
      doc.on('end', resolve);
      doc.on('error', reject);
    });

    // Create PDF buffer
    const pdfBuffer = Buffer.concat(pdfBuffers);

    // Save PDF to file (optional)
    const pdfDir = path.join(__dirname, '../../temp/cutting-sheets');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const filename = `cutting-sheets-${Date.now()}.pdf`;
    const filepath = path.join(pdfDir, filename);
    fs.writeFileSync(filepath, pdfBuffer);

    res.status(200).json({
      success: true,
      message: `Cutting sheets generated for ${orders.length} orders`,
      data: {
        count: orders.length,
        filename,
        downloadUrl: `/api/production-queue/download-cutting-sheet/${filename}`
      }
    });
  } catch (error) {
    logger.error('Error generating cutting sheets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate cutting sheets',
      error: error.message
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

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const whatsapp = require('../config/whatsapp');

    // Fetch orders with customer phone numbers
    const orders = await ProductionQueue.find({ _id: { $in: ids } })
      .populate('orderId', 'customerInfo orderNumber');

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No orders found'
      });
    }

    // Send WhatsApp messages
    const results = {
      total: orders.length,
      sent: 0,
      failed: 0,
      errors: []
    };

    for (const order of orders) {
      const customerPhone = order.orderId?.customerInfo?.phone;
      const orderNumber = order.orderId?.orderNumber;

      if (!customerPhone) {
        results.failed++;
        results.errors.push({
          orderId: order.orderId?._id,
          error: 'No customer phone number'
        });
        continue;
      }

      // Personalize message with order number
      const personalizedMessage = message.replace('{orderNumber}', orderNumber || 'N/A');

      try {
        const result = await whatsapp.sendWhatsAppMessage(customerPhone, personalizedMessage);

        if (result.success) {
          results.sent++;
        } else {
          results.failed++;
          results.errors.push({
            orderId: order.orderId?._id,
            error: result.error
          });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          orderId: order.orderId?._id,
          error: error.message
        });
      }

      // Small delay between messages to avoid rate limiting
      if (orders.indexOf(order) < orders.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    res.status(200).json({
      success: results.failed === 0,
      message: `WhatsApp messages sent: ${results.sent}/${results.total}`,
      data: results
    });
  } catch (error) {
    logger.error('Error sending WhatsApp blast:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send WhatsApp messages',
      error: error.message
    });
  }
};

