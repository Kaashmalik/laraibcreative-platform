/**
 * Custom Order Controller
 * Handles custom order creation, image uploads, and notifications
 * 
 * @module controllers/customOrderController
 */

const Order = require('../models/Order');
const User = require('../models/User');
const Measurement = require('../models/Measurement');
const orderService = require('../services/orderService');
const notificationService = require('../services/notificationService');
// Note: Images are uploaded via multer middleware, no need to import uploadImage
const logger = require('../utils/logger');
const { sendWhatsAppMessage } = require('../config/whatsapp');
const { sendEmail } = require('../config/email');
const { customOrderConfirmationEmail, customOrderAdminNotificationEmail } = require('../utils/emailTemplates');
const { customOrderConfirmation, customOrderAdminNotification } = require('../utils/whatsappTemplates');

/**
 * Upload reference images for custom order
 * @route POST /api/v1/orders/custom/upload-images
 * @access Private/Public
 */
exports.uploadReferenceImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    // Validate file count
    if (req.files.length > 6) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 6 images allowed'
      });
    }

    // Validate file types and sizes
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of req.files) {
      if (!validTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `Invalid file type: ${file.originalname}. Only JPG, PNG, and WEBP are allowed.`
        });
      }

      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File too large: ${file.originalname}. Maximum size is 5MB.`
        });
      }
    }

    // Extract URLs from uploaded files
    // When using multer-storage-cloudinary, files are already uploaded
    // The URL is available in file.path
    const urls = req.files.map(file => {
      // file.path contains the Cloudinary URL when using CloudinaryStorage
      return file.path || file.secure_url || file.url;
    });

    const uploadResults = await Promise.all(uploadPromises);

    // Check for upload failures
    const failedUploads = uploadResults.filter(result => !result.success);
    if (failedUploads.length > 0) {
      logger.error('Some images failed to upload', { failedUploads });
      return res.status(500).json({
        success: false,
        message: 'Some images failed to upload',
        errors: failedUploads.map(r => r.error)
      });
    }

    // Extract URLs
    const urls = uploadResults.map(result => result.url);

    logger.info(`Reference images uploaded successfully: ${urls.length} images`);

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      urls
    });

  } catch (error) {
    logger.error('Error uploading reference images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Submit custom order
 * @route POST /api/v1/orders/custom
 * @access Private/Public
 */
exports.submitCustomOrder = async (req, res) => {
  try {
    const {
      serviceType,
      designIdea,
      referenceImages,
      fabricSource,
      selectedFabric,
      fabricDetails,
      useStandardSize,
      standardSize,
      measurements,
      saveMeasurements,
      measurementLabel,
      specialInstructions,
      rushOrder,
      customerInfo,
      estimatedPrice
    } = req.body;

    // Validation
    if (!serviceType || !['fully-custom', 'brand-article'].includes(serviceType)) {
      return res.status(400).json({
        success: false,
        message: 'Valid service type is required (fully-custom or brand-article)'
      });
    }

    if (serviceType === 'fully-custom' && (!designIdea || designIdea.trim().length < 50)) {
      return res.status(400).json({
        success: false,
        message: 'Design idea is required and must be at least 50 characters for fully custom orders'
      });
    }

    if (serviceType === 'brand-article' && (!referenceImages || referenceImages.length < 2)) {
      return res.status(400).json({
        success: false,
        message: 'At least 2 reference images are required for brand article orders'
      });
    }

    if (!fabricSource || !['lc-provides', 'customer-provides'].includes(fabricSource)) {
      return res.status(400).json({
        success: false,
        message: 'Fabric source is required (lc-provides or customer-provides)'
      });
    }

    if (fabricSource === 'lc-provides' && !selectedFabric) {
      return res.status(400).json({
        success: false,
        message: 'Fabric selection is required when LC provides fabric'
      });
    }

    if (fabricSource === 'customer-provides' && (!fabricDetails || fabricDetails.trim().length < 20)) {
      return res.status(400).json({
        success: false,
        message: 'Fabric details are required (minimum 20 characters) when customer provides fabric'
      });
    }

    if (!useStandardSize && !standardSize) {
      // Validate required measurements
      const required = ['shirtLength', 'shoulderWidth', 'bust', 'waist'];
      const missing = required.filter(field => !measurements[field] || measurements[field] === '');
      
      if (missing.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Required measurements missing: ${missing.join(', ')}`
        });
      }
    }

    if (!customerInfo || !customerInfo.fullName || !customerInfo.phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer information is required (fullName and phone)'
      });
    }

    // Get or create user
    let user = null;
    if (req.user) {
      user = req.user;
    } else {
      // Try to find user by email or phone
      if (customerInfo.email) {
        user = await User.findOne({ email: customerInfo.email });
      }
      if (!user && customerInfo.phone) {
        user = await User.findOne({ phone: customerInfo.phone });
      }
    }

    // Calculate pricing
    const baseStitching = 2500;
    const fabricCost = fabricSource === 'lc-provides' && selectedFabric ? selectedFabric.price : 0;
    const rushFee = rushOrder ? 1000 : 0;
    const complexDesignSurcharge = serviceType === 'fully-custom' && designIdea && designIdea.length > 200 ? 500 : 0;
    
    const subtotal = baseStitching + fabricCost + rushFee + complexDesignSurcharge;
    const tax = subtotal * 0.05;
    const total = Math.round(subtotal + tax);

    // Generate order number
    const orderNumber = await orderService.generateOrderNumber();

    // Prepare order item
    const orderItem = {
      product: null, // Custom orders don't have a product reference
      productSnapshot: {
        title: serviceType === 'fully-custom' ? 'Fully Custom Design' : 'Brand Article Copy',
        sku: `CUSTOM-${orderNumber}`,
        primaryImage: referenceImages && referenceImages.length > 0 ? referenceImages[0] : null,
        description: designIdea || 'Custom order based on reference images',
        category: 'Custom Order',
        fabricType: selectedFabric?.type || fabricDetails || 'Custom'
      },
      isCustom: true,
      customDetails: {
        serviceType: serviceType === 'fully-custom' ? 'fully-custom' : 'brand-article-copy',
        measurements: {
          ...measurements,
          unit: 'inches',
          sizeLabel: useStandardSize ? standardSize : 'Custom'
        },
        referenceImages: (referenceImages || []).map(url => ({
          url,
          caption: '',
          uploadedAt: new Date()
        })),
        fabric: {
          providedBy: fabricSource === 'lc-provides' ? 'laraibcreative' : 'customer',
          type: selectedFabric?.type || '',
          color: selectedFabric?.color || '',
          quality: selectedFabric?.name || '',
          metersRequired: selectedFabric?.metersIncluded || 3
        },
        specialInstructions: specialInstructions || '',
        estimatedDays: rushOrder ? 7 : 15,
        rushOrder: rushOrder || false
      },
      price: total,
      quantity: 1,
      subtotal: total
    };

    // Prepare order data
    const orderData = {
      orderNumber,
      customer: user ? user._id : null,
      customerInfo: {
        name: customerInfo.fullName,
        email: customerInfo.email || '',
        phone: customerInfo.phone,
        whatsapp: customerInfo.whatsapp || customerInfo.phone
      },
      items: [orderItem],
      shippingAddress: {
        fullName: customerInfo.fullName,
        phone: customerInfo.phone,
        whatsapp: customerInfo.whatsapp,
        addressLine1: 'To be provided',
        city: 'Lahore',
        province: 'Punjab'
      },
      payment: {
        method: 'pending',
        status: 'pending'
      },
      pricing: {
        subtotal,
        shippingCharges: 0,
        discount: 0,
        tax,
        total
      },
      status: 'pending-payment',
      statusHistory: [{
        status: 'pending-payment',
        timestamp: new Date(),
        note: 'Custom order received, awaiting payment confirmation'
      }],
      estimatedCompletion: new Date(Date.now() + (rushOrder ? 7 : 15) * 24 * 60 * 60 * 1000),
      priority: rushOrder ? 'high' : 'normal',
      source: 'website'
    };

    // Create order
    const order = await Order.create(orderData);

    // Save measurements if requested
    if (saveMeasurements && user && measurementLabel) {
      try {
        await Measurement.create({
          user: user._id,
          label: measurementLabel,
          measurements: {
            ...measurements,
            unit: 'inches',
            sizeLabel: useStandardSize ? standardSize : 'Custom'
          }
        });
        logger.info(`Measurements saved for user: ${user._id}`, { label: measurementLabel });
      } catch (measurementError) {
        logger.error('Failed to save measurements:', measurementError);
        // Don't fail the order if measurement save fails
      }
    }

    // Populate order
    await order.populate('customer', 'fullName email phone whatsapp');

    // Send notifications
    try {
      // WhatsApp notification
      if (customerInfo.phone || customerInfo.whatsapp) {
        const whatsappNumber = customerInfo.whatsapp || customerInfo.phone;
        const whatsappMessage = customOrderConfirmation({
          orderNumber,
          customerName: customerInfo.fullName,
          serviceType: serviceType === 'fully-custom' ? 'Fully Custom Design' : 'Brand Article Copy',
          estimatedPrice: total,
          estimatedDays: rushOrder ? '7-10' : '15-20'
        });

        await sendWhatsAppMessage(whatsappNumber, whatsappMessage);
      }

      // Email notification
      if (customerInfo.email) {
        const emailHtml = customOrderConfirmationEmail({
          orderNumber,
          customerName: customerInfo.fullName,
          serviceType: serviceType === 'fully-custom' ? 'Fully Custom Design' : 'Brand Article Copy',
          estimatedPrice: total,
          estimatedDays: rushOrder ? '7-10' : '15-20'
        });

        await sendEmail({
          to: customerInfo.email,
          subject: `Custom Order Confirmation - ${orderNumber}`,
          html: emailHtml
        });
      }

      // Admin notification
      await notificationService.notifyAdminNewOrder(order);
      
      // Admin email
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@laraibcreative.com';
      const adminEmailHtml = customOrderAdminNotificationEmail({
        orderNumber,
        customerName: customerInfo.fullName,
        customerPhone: customerInfo.phone,
        serviceType: serviceType === 'fully-custom' ? 'Fully Custom Design' : 'Brand Article Copy',
        estimatedPrice: total,
        rushOrder: rushOrder
      });

      await sendEmail({
        to: adminEmail,
        subject: `New Custom Order - ${orderNumber}`,
        html: adminEmailHtml
      });

      // Admin WhatsApp notification
      const adminWhatsApp = process.env.ADMIN_WHATSAPP;
      if (adminWhatsApp) {
        const adminWhatsAppMessage = customOrderAdminNotification({
          orderNumber,
          customerName: customerInfo.fullName,
          customerPhone: customerInfo.phone,
          serviceType: serviceType === 'fully-custom' ? 'Fully Custom Design' : 'Brand Article Copy',
          estimatedPrice: total,
          rushOrder: rushOrder
        });

        await sendWhatsAppMessage(adminWhatsApp, adminWhatsAppMessage);
      }

    } catch (notificationError) {
      logger.error('Notification error (order still created):', notificationError);
      // Don't fail the order if notifications fail
    }

    logger.info(`Custom order created successfully: ${orderNumber}`, {
      orderId: order._id,
      customer: customerInfo.email || customerInfo.phone,
      total
    });

    res.status(201).json({
      success: true,
      message: 'Custom order submitted successfully',
      orderId: order._id.toString(),
      orderNumber,
      data: {
        order,
        trackingUrl: `${process.env.FRONTEND_URL || 'https://laraibcreative.com'}/orders/${order._id}`
      }
    });

  } catch (error) {
    logger.error('Error submitting custom order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit custom order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get custom order by ID
 * @route GET /api/v1/orders/custom/:id
 * @access Private
 */
exports.getCustomOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('customer', 'fullName email phone whatsapp')
      .populate('items.product', 'title images sku');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user has access
    if (req.user.role !== 'admin' && order.customer?._id?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: { order }
    });

  } catch (error) {
    logger.error('Error fetching custom order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = exports;

