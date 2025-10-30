// backend/src/controllers/settingsController.js

const Settings = require('../models/Settings');

/**
 * Settings Controller
 * Manages application-wide settings
 */

// ==================== PUBLIC ENDPOINTS ====================

/**
 * @desc    Get public settings (for frontend)
 * @route   GET /api/settings/public
 * @access  Public
 */
exports.getPublicSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      // Create default settings if none exist
      settings = await Settings.create({});
    }

    // Prepare public-safe settings
    const publicSettings = {
      general: {
        siteName: settings.general.siteName,
        siteDescription: settings.general.siteDescription,
        contactEmail: settings.general.contactEmail,
        contactPhone: settings.general.contactPhone,
        whatsappNumber: settings.general.whatsappNumber,
        address: settings.general.address,
        socialMedia: settings.general.socialMedia,
        businessHours: settings.general.businessHours,
        currency: settings.general.currency,
        timezone: settings.general.timezone
      },
      shipping: {
        freeShippingThreshold: settings.shipping.freeShippingThreshold,
        defaultShippingCost: settings.shipping.defaultShippingCost,
        estimatedDeliveryDays: settings.shipping.estimatedDeliveryDays,
        shippingZones: settings.shipping.shippingZones,
        shippingMethods: settings.shipping.shippingMethods
      },
      payment: {
        cashOnDelivery: {
          enabled: settings.payment.cashOnDelivery.enabled
        },
        bankTransfer: {
          enabled: settings.payment.bankTransfer.enabled,
          bankName: settings.payment.bankTransfer.bankName,
          accountTitle: settings.payment.bankTransfer.accountTitle,
          accountNumber: settings.payment.bankTransfer.accountNumber,
          iban: settings.payment.bankTransfer.iban
        },
        onlinePayment: {
          enabled: settings.payment.onlinePayment.enabled,
          gateway: settings.payment.onlinePayment.gateway
        }
      },
      seo: {
        defaultMetaTitle: settings.seo.defaultMetaTitle,
        defaultMetaDescription: settings.seo.defaultMetaDescription,
        defaultMetaKeywords: settings.seo.defaultMetaKeywords,
        googleAnalyticsId: settings.seo.googleAnalyticsId,
        facebookPixelId: settings.seo.facebookPixelId,
        twitterHandle: settings.seo.twitterHandle
      },
      features: {
        customOrders: settings.features.customOrders,
        guestCheckout: settings.features.guestCheckout,
        productReviews: settings.features.productReviews,
        wishlist: settings.features.wishlist,
        blog: settings.features.blog,
        newsletter: settings.features.newsletter
      }
    };

    res.status(200).json({
      success: true,
      data: publicSettings
    });
  } catch (error) {
    console.error('Error fetching public settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
};

// ==================== ADMIN ENDPOINTS ====================

/**
 * @desc    Get all settings (admin)
 * @route   GET /api/admin/settings
 * @access  Private (Admin)
 */
exports.getAllSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      // Create default settings if none exist
      settings = await Settings.create({});
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching all settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
};

/**
 * @desc    Update general settings
 * @route   PUT /api/admin/settings/general
 * @access  Private (Admin)
 */
exports.updateGeneralSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    // Update general settings
    Object.assign(settings.general, req.body);
    settings.lastUpdatedBy = req.user._id;
    
    await settings.save();

    res.status(200).json({
      success: true,
      data: settings.general,
      message: 'General settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating general settings:', error);
    
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
      message: 'Failed to update general settings',
      error: error.message
    });
  }
};

/**
 * @desc    Update payment settings
 * @route   PUT /api/admin/settings/payment
 * @access  Private (Admin)
 */
exports.updatePaymentSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    // Update payment settings
    Object.assign(settings.payment, req.body);
    settings.lastUpdatedBy = req.user._id;
    
    await settings.save();

    res.status(200).json({
      success: true,
      data: settings.payment,
      message: 'Payment settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating payment settings:', error);
    
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
      message: 'Failed to update payment settings',
      error: error.message
    });
  }
};

/**
 * @desc    Update shipping settings
 * @route   PUT /api/admin/settings/shipping
 * @access  Private (Admin)
 */
exports.updateShippingSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    // Update shipping settings
    Object.assign(settings.shipping, req.body);
    settings.lastUpdatedBy = req.user._id;
    
    await settings.save();

    res.status(200).json({
      success: true,
      data: settings.shipping,
      message: 'Shipping settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating shipping settings:', error);
    
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
      message: 'Failed to update shipping settings',
      error: error.message
    });
  }
};

/**
 * @desc    Update email settings
 * @route   PUT /api/admin/settings/email
 * @access  Private (Admin)
 */
exports.updateEmailSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    // Update email settings
    Object.assign(settings.email, req.body);
    settings.lastUpdatedBy = req.user._id;
    
    await settings.save();

    res.status(200).json({
      success: true,
      data: settings.email,
      message: 'Email settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating email settings:', error);
    
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
      message: 'Failed to update email settings',
      error: error.message
    });
  }
};

/**
 * @desc    Update SEO settings
 * @route   PUT /api/admin/settings/seo
 * @access  Private (Admin)
 */
exports.updateSEOSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    // Update SEO settings
    Object.assign(settings.seo, req.body);
    settings.lastUpdatedBy = req.user._id;
    
    await settings.save();

    res.status(200).json({
      success: true,
      data: settings.seo,
      message: 'SEO settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating SEO settings:', error);
    
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
      message: 'Failed to update SEO settings',
      error: error.message
    });
  }
};

/**
 * @desc    Update notification settings
 * @route   PUT /api/admin/settings/notifications
 * @access  Private (Admin)
 */
exports.updateNotificationSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    // Update notification settings
    Object.assign(settings.notifications, req.body);
    settings.lastUpdatedBy = req.user._id;
    
    await settings.save();

    res.status(200).json({
      success: true,
      data: settings.notifications,
      message: 'Notification settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    
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
      message: 'Failed to update notification settings',
      error: error.message
    });
  }
};

/**
 * @desc    Update order settings
 * @route   PUT /api/admin/settings/orders
 * @access  Private (Admin)
 */
exports.updateOrderSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    // Update order settings
    Object.assign(settings.orders, req.body);
    settings.lastUpdatedBy = req.user._id;
    
    await settings.save();

    res.status(200).json({
      success: true,
      data: settings.orders,
      message: 'Order settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating order settings:', error);
    
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
      message: 'Failed to update order settings',
      error: error.message
    });
  }
};

/**
 * @desc    Update feature toggles
 * @route   PUT /api/admin/settings/features
 * @access  Private (Admin)
 */
exports.updateFeatureSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    // Update feature settings
    Object.assign(settings.features, req.body);
    settings.lastUpdatedBy = req.user._id;
    
    await settings.save();

    res.status(200).json({
      success: true,
      data: settings.features,
      message: 'Feature settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating feature settings:', error);
    
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
      message: 'Failed to update feature settings',
      error: error.message
    });
  }
};

/**
 * @desc    Update maintenance mode settings
 * @route   PUT /api/admin/settings/maintenance
 * @access  Private (Admin)
 */
exports.updateMaintenanceSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    // Update maintenance settings
    Object.assign(settings.maintenance, req.body);
    settings.lastUpdatedBy = req.user._id;
    
    await settings.save();

    res.status(200).json({
      success: true,
      data: settings.maintenance,
      message: 'Maintenance settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating maintenance settings:', error);
    
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
      message: 'Failed to update maintenance settings',
      error: error.message
    });
  }
};

/**
 * @desc    Test email configuration
 * @route   POST /api/admin/settings/email/test
 * @access  Private (Admin)
 */
exports.testEmailSettings = async (req, res) => {
  try {
    const { testEmail } = req.body;

    if (!testEmail) {
      return res.status(400).json({
        success: false,
        message: 'Test email address is required'
      });
    }

    const settings = await Settings.findOne();

    if (!settings || !settings.email.host) {
      return res.status(400).json({
        success: false,
        message: 'Email settings not configured'
      });
    }

    // Import email service
    const emailService = require('../utils/emailService');

    // Send test email
    await emailService.sendTestEmail(testEmail, settings.email);

    res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${testEmail}`
    });
  } catch (error) {
    console.error('Error testing email settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
};

/**
 * @desc    Reset settings to defaults
 * @route   POST /api/admin/settings/reset
 * @access  Private (Admin)
 */
exports.resetSettings = async (req, res) => {
  try {
    const { section } = req.body;

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    if (section && settings[section]) {
      // Reset specific section to defaults
      const defaultSettings = new Settings();
      settings[section] = defaultSettings[section];
    } else {
      // Reset all settings
      const defaultSettings = new Settings();
      Object.assign(settings, defaultSettings.toObject());
      settings._id = settings._id; // Preserve ID
    }

    settings.lastUpdatedBy = req.user._id;
    await settings.save();

    res.status(200).json({
      success: true,
      data: settings,
      message: section 
        ? `${section} settings reset to defaults` 
        : 'All settings reset to defaults'
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset settings',
      error: error.message
    });
  }
};

/**
 * @desc    Export settings as JSON
 * @route   GET /api/admin/settings/export
 * @access  Private (Admin)
 */
exports.exportSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne().lean();

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'No settings found'
      });
    }

    // Remove sensitive fields
    delete settings._id;
    delete settings.__v;
    delete settings.createdAt;
    delete settings.updatedAt;
    delete settings.lastUpdatedBy;

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=settings-backup.json');
    
    res.status(200).json(settings);
  } catch (error) {
    console.error('Error exporting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export settings',
      error: error.message
    });
  }
};

/**
 * @desc    Import settings from JSON
 * @route   POST /api/admin/settings/import
 * @access  Private (Admin)
 */
exports.importSettings = async (req, res) => {
  try {
    const importedSettings = req.body;

    if (!importedSettings || typeof importedSettings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings data'
      });
    }

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings();
    }

    // Merge imported settings (preserve ID and timestamps)
    Object.keys(importedSettings).forEach(key => {
      if (key !== '_id' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt') {
        settings[key] = importedSettings[key];
      }
    });

    settings.lastUpdatedBy = req.user._id;
    await settings.save();

    res.status(200).json({
      success: true,
      data: settings,
      message: 'Settings imported successfully'
    });
  } catch (error) {
    console.error('Error importing settings:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Invalid settings data',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to import settings',
      error: error.message
    });
  }
};

/**
 * @desc    Get settings change history
 * @route   GET /api/admin/settings/history
 * @access  Private (Admin)
 */
exports.getSettingsHistory = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const settings = await Settings.findOne()
      .select('updatedAt lastUpdatedBy')
      .populate('lastUpdatedBy', 'fullName email')
      .lean();

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'No settings found'
      });
    }

    // In a production system, you'd want to implement actual change tracking
    // For now, we'll return the last update info
    res.status(200).json({
      success: true,
      data: {
        lastUpdate: {
          timestamp: settings.updatedAt,
          user: settings.lastUpdatedBy
        }
      },
      message: 'For full change history, implement audit logging'
    });
  } catch (error) {
    console.error('Error fetching settings history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings history',
      error: error.message
    });
  }
};