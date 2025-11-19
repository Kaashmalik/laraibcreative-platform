// backend/src/models/Settings.js

const mongoose = require('mongoose');

/**
 * Settings Schema
 * Singleton model for application-wide settings
 * Only one document should exist in this collection
 */
const settingsSchema = new mongoose.Schema(
  {
    // ==================== GENERAL SETTINGS ====================
    
    general: {
      /**
       * Site name
       * Displayed in header, emails, and SEO
       */
      siteName: {
        type: String,
        default: 'LaraibCreative',
        trim: true,
        maxlength: [100, 'Site name cannot exceed 100 characters']
      },

      /**
       * Site tagline/description
       */
      siteDescription: {
        type: String,
        default: 'Premium Tailoring & Stitching Services',
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
      },

      /**
       * Contact information
       */
      contactEmail: {
        type: String,
        default: 'laraibcreative.business@gmail.com',
        trim: true,
        lowercase: true
      },

      contactPhone: {
        type: String,
        default: '+92-XXX-XXXXXXX',
        trim: true
      },

      whatsappNumber: {
        type: String,
        default: '+92-XXX-XXXXXXX',
        trim: true
      },

      /**
       * Business address
       */
      address: {
        street: {
          type: String,
          default: '',
          trim: true
        },
        city: {
          type: String,
          default: 'Lahore',
          trim: true
        },
        state: {
          type: String,
          default: 'Punjab',
          trim: true
        },
        country: {
          type: String,
          default: 'Pakistan',
          trim: true
        },
        postalCode: {
          type: String,
          default: '',
          trim: true
        }
      },

      /**
       * Social media links
       */
      socialMedia: {
        facebook: {
          type: String,
          default: '',
          trim: true
        },
        instagram: {
          type: String,
          default: '',
          trim: true
        },
        twitter: {
          type: String,
          default: '',
          trim: true
        },
        pinterest: {
          type: String,
          default: '',
          trim: true
        },
        youtube: {
          type: String,
          default: '',
          trim: true
        }
      },

      /**
       * Business hours
       */
      businessHours: {
        monday: {
          open: { type: String, default: '09:00' },
          close: { type: String, default: '18:00' },
          closed: { type: Boolean, default: false }
        },
        tuesday: {
          open: { type: String, default: '09:00' },
          close: { type: String, default: '18:00' },
          closed: { type: Boolean, default: false }
        },
        wednesday: {
          open: { type: String, default: '09:00' },
          close: { type: String, default: '18:00' },
          closed: { type: Boolean, default: false }
        },
        thursday: {
          open: { type: String, default: '09:00' },
          close: { type: String, default: '18:00' },
          closed: { type: Boolean, default: false }
        },
        friday: {
          open: { type: String, default: '09:00' },
          close: { type: String, default: '18:00' },
          closed: { type: Boolean, default: false }
        },
        saturday: {
          open: { type: String, default: '09:00' },
          close: { type: String, default: '18:00' },
          closed: { type: Boolean, default: false }
        },
        sunday: {
          open: { type: String, default: '09:00' },
          close: { type: String, default: '18:00' },
          closed: { type: Boolean, default: true }
        }
      },

      /**
       * Currency settings
       */
      currency: {
        type: String,
        enum: ['PKR', 'USD', 'EUR', 'GBP'],
        default: 'PKR'
      },

      /**
       * Timezone
       */
      timezone: {
        type: String,
        default: 'Asia/Karachi'
      }
    },

    // ==================== PAYMENT SETTINGS ====================
    
    payment: {
      /**
       * Cash on Delivery
       */
      cashOnDelivery: {
        enabled: {
          type: Boolean,
          default: true
        },
        minimumAmount: {
          type: Number,
          default: 0
        },
        maximumAmount: {
          type: Number,
          default: 50000
        }
      },

      /**
       * Bank Transfer
       */
      bankTransfer: {
        enabled: {
          type: Boolean,
          default: true
        },
        bankName: {
          type: String,
          default: 'Bank Name',
          trim: true
        },
        accountTitle: {
          type: String,
          default: 'Account Title',
          trim: true
        },
        accountNumber: {
          type: String,
          default: 'XXXX-XXXX-XXXX-XXXX',
          trim: true
        },
        iban: {
          type: String,
          default: 'PK00XXXX0000000000000000',
          trim: true
        },
        instructions: {
          type: String,
          default: 'Please upload payment receipt after transfer',
          trim: true
        }
      },

      /**
       * Online Payment Gateway
       */
      onlinePayment: {
        enabled: {
          type: Boolean,
          default: false
        },
        gateway: {
          type: String,
          enum: ['stripe', 'paypal', 'razorpay', 'jazzcash', 'easypaisa'],
          default: 'stripe'
        },
        apiKey: {
          type: String,
          default: '',
          select: false // Don't expose in normal queries
        },
        apiSecret: {
          type: String,
          default: '',
          select: false
        },
        webhookSecret: {
          type: String,
          default: '',
          select: false
        },
        testMode: {
          type: Boolean,
          default: true
        }
      },

      /**
       * Tax settings
       */
      tax: {
        enabled: {
          type: Boolean,
          default: false
        },
        rate: {
          type: Number,
          default: 0,
          min: 0,
          max: 100
        },
        included: {
          type: Boolean,
          default: false
        }
      }
    },

    // ==================== SHIPPING SETTINGS ====================
    
    shipping: {
      /**
       * Free shipping threshold
       */
      freeShippingThreshold: {
        type: Number,
        default: 5000,
        min: 0
      },

      /**
       * Default shipping cost
       */
      defaultShippingCost: {
        type: Number,
        default: 200,
        min: 0
      },

      /**
       * Estimated delivery time
       */
      estimatedDeliveryDays: {
        min: {
          type: Number,
          default: 5,
          min: 1
        },
        max: {
          type: Number,
          default: 10,
          min: 1
        }
      },

      /**
       * Shipping zones with custom rates
       */
      shippingZones: [
        {
          name: {
            type: String,
            required: true,
            trim: true
          },
          cities: {
            type: [String],
            default: []
          },
          cost: {
            type: Number,
            required: true,
            min: 0
          },
          estimatedDays: {
            min: { type: Number, default: 5 },
            max: { type: Number, default: 10 }
          }
        }
      ],

      /**
       * Available shipping methods
       */
      shippingMethods: [
        {
          name: {
            type: String,
            required: true,
            trim: true
          },
          description: {
            type: String,
            trim: true
          },
          cost: {
            type: Number,
            required: true,
            min: 0
          },
          estimatedDays: {
            min: { type: Number, default: 5 },
            max: { type: Number, default: 10 }
          },
          enabled: {
            type: Boolean,
            default: true
          }
        }
      ]
    },

    // ==================== EMAIL SETTINGS ====================
    
    email: {
      /**
       * SMTP configuration
       */
      host: {
        type: String,
        default: 'smtp.gmail.com',
        trim: true
      },

      port: {
        type: Number,
        default: 587,
        min: 1,
        max: 65535
      },

      username: {
        type: String,
        default: '',
        trim: true,
        select: false
      },

      password: {
        type: String,
        default: '',
        select: false
      },

      fromEmail: {
        type: String,
        default: 'laraibcreative.business@gmail.com',
        trim: true,
        lowercase: true
      },

      fromName: {
        type: String,
        default: 'LaraibCreative',
        trim: true
      },

      secure: {
        type: Boolean,
        default: true
      },

      /**
       * Email templates enabled/disabled
       */
      templates: {
        orderConfirmation: {
          type: Boolean,
          default: true
        },
        orderStatusUpdate: {
          type: Boolean,
          default: true
        },
        paymentReceived: {
          type: Boolean,
          default: true
        },
        welcomeEmail: {
          type: Boolean,
          default: true
        },
        passwordReset: {
          type: Boolean,
          default: true
        }
      }
    },

    // ==================== SEO SETTINGS ====================
    
    seo: {
      /**
       * Default meta tags
       */
      defaultMetaTitle: {
        type: String,
        default: 'LaraibCreative - Premium Tailoring Services',
        trim: true,
        maxlength: [60, 'Meta title should not exceed 60 characters']
      },

      defaultMetaDescription: {
        type: String,
        default: 'Expert tailoring and stitching services with premium fabrics. Custom orders, bridal wear, and everyday fashion.',
        trim: true,
        minlength: [120, 'Meta description should be at least 120 characters'],
        maxlength: [160, 'Meta description should not exceed 160 characters']
      },

      defaultMetaKeywords: {
        type: [String],
        default: ['tailoring', 'stitching', 'custom clothes', 'bridal wear', 'fashion']
      },

      /**
       * Analytics tracking
       */
      googleAnalyticsId: {
        type: String,
        default: '',
        trim: true
      },

      googleTagManagerId: {
        type: String,
        default: '',
        trim: true
      },

      facebookPixelId: {
        type: String,
        default: '',
        trim: true
      },

      /**
       * Social meta tags
       */
      ogImage: {
        type: String,
        default: '',
        trim: true
      },

      twitterHandle: {
        type: String,
        default: '',
        trim: true
      },

      /**
       * Structured data
       */
      enableStructuredData: {
        type: Boolean,
        default: true
      }
    },

    // ==================== NOTIFICATION SETTINGS ====================
    
    notifications: {
      /**
       * Email notifications
       */
      email: {
        newOrder: {
          type: Boolean,
          default: true
        },
        orderStatusChange: {
          type: Boolean,
          default: true
        },
        lowStock: {
          type: Boolean,
          default: true
        },
        newReview: {
          type: Boolean,
          default: true
        },
        newCustomer: {
          type: Boolean,
          default: false
        }
      },

      /**
       * WhatsApp notifications
       */
      whatsapp: {
        enabled: {
          type: Boolean,
          default: false
        },
        apiKey: {
          type: String,
          default: '',
          select: false
        },
        newOrder: {
          type: Boolean,
          default: true
        },
        orderStatusChange: {
          type: Boolean,
          default: true
        }
      },

      /**
       * Admin notification recipients
       */
      adminEmails: {
        type: [String],
        default: ['laraibcreative.business@gmail.com']
      }
    },

    // ==================== ORDER SETTINGS ====================
    
    orders: {
      /**
       * Order number configuration
       */
      orderPrefix: {
        type: String,
        default: 'LC',
        trim: true,
        uppercase: true,
        maxlength: [10, 'Order prefix too long']
      },

      startingNumber: {
        type: Number,
        default: 1000,
        min: 1
      },

      /**
       * Order processing
       */
      autoApproval: {
        type: Boolean,
        default: false
      },

      requirePaymentProof: {
        type: Boolean,
        default: true
      },

      autoArchiveDays: {
        type: Number,
        default: 90,
        min: 1,
        max: 365
      },

      /**
       * Checkout options
       */
      enableGuestCheckout: {
        type: Boolean,
        default: true
      },

      requirePhone: {
        type: Boolean,
        default: true
      },

      /**
       * Order statuses (for reference)
       */
      availableStatuses: {
        type: [String],
        default: [
          'pending_payment',
          'payment_received',
          'confirmed',
          'in_progress',
          'ready_for_delivery',
          'shipped',
          'delivered',
          'cancelled'
        ]
      }
    },

    // ==================== FEATURE TOGGLES ====================
    
    features: {
      /**
       * Enable/disable major features
       */
      customOrders: {
        type: Boolean,
        default: true
      },

      guestCheckout: {
        type: Boolean,
        default: true
      },

      productReviews: {
        type: Boolean,
        default: true
      },

      wishlist: {
        type: Boolean,
        default: true
      },

      blog: {
        type: Boolean,
        default: true
      },

      newsletter: {
        type: Boolean,
        default: true
      },

      livechat: {
        type: Boolean,
        default: false
      },

      multiLanguage: {
        type: Boolean,
        default: false
      }
    },

    // ==================== MAINTENANCE MODE ====================
    
    maintenance: {
      /**
       * Maintenance mode settings
       */
      enabled: {
        type: Boolean,
        default: false
      },

      message: {
        type: String,
        default: 'We are currently performing scheduled maintenance. Please check back soon.',
        trim: true,
        maxlength: [500, 'Maintenance message too long']
      },

      allowedIPs: {
        type: [String],
        default: []
      },

      estimatedEndTime: {
        type: Date
      }
    },

    // ==================== METADATA ====================
    
    /**
     * Last updated by
     */
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        // Remove sensitive fields
        delete ret.__v;
        delete ret.payment.onlinePayment.apiKey;
        delete ret.payment.onlinePayment.apiSecret;
        delete ret.payment.onlinePayment.webhookSecret;
        delete ret.email.username;
        delete ret.email.password;
        delete ret.notifications.whatsapp.apiKey;
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

// ==================== INDEXES ====================

// Ensure only one settings document exists
settingsSchema.index({}, { unique: true });

// ==================== METHODS ====================

/**
 * Get public-safe settings
 * Excludes sensitive information
 */
settingsSchema.methods.getPublicSettings = function() {
  const settings = this.toObject();
  
  // Remove sensitive fields
  delete settings.payment.onlinePayment.apiKey;
  delete settings.payment.onlinePayment.apiSecret;
  delete settings.payment.onlinePayment.webhookSecret;
  delete settings.email;
  delete settings.notifications.whatsapp.apiKey;
  delete settings.lastUpdatedBy;
  
  return settings;
};

/**
 * Check if maintenance mode is active
 */
settingsSchema.methods.isMaintenanceMode = function() {
  return this.maintenance.enabled;
};

/**
 * Check if IP is allowed during maintenance
 */
settingsSchema.methods.isIPAllowed = function(ip) {
  if (!this.maintenance.enabled) return true;
  if (this.maintenance.allowedIPs.length === 0) return false;
  return this.maintenance.allowedIPs.includes(ip);
};

// ==================== STATIC METHODS ====================

/**
 * Get or create settings (singleton pattern)
 */
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  
  if (!settings) {
    settings = await this.create({});
  }
  
  return settings;
};

/**
 * Update specific section
 */
settingsSchema.statics.updateSection = async function(section, data, userId) {
  let settings = await this.getSettings();
  
  if (settings[section]) {
    Object.assign(settings[section], data);
    settings.lastUpdatedBy = userId;
    await settings.save();
  }
  
  return settings;
};

// ==================== HOOKS ====================

/**
 * Pre-save validation
 */
settingsSchema.pre('save', function(next) {
  // Ensure only one settings document exists
  if (this.isNew) {
    this.constructor.countDocuments().then(count => {
      if (count > 0) {
        next(new Error('Settings document already exists. Use update instead.'));
      } else {
        next();
      }
    }).catch(next);
  } else {
    next();
  }
});

/**
 * Validate email configuration
 */
settingsSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    if (!this.email.host || !this.email.port || !this.email.fromEmail) {
      return next(new Error('Email host, port, and from email are required'));
    }
  }
  next();
});

/**
 * Validate shipping settings
 */
settingsSchema.pre('save', function(next) {
  if (this.isModified('shipping.estimatedDeliveryDays')) {
    if (this.shipping.estimatedDeliveryDays.max < this.shipping.estimatedDeliveryDays.min) {
      return next(new Error('Maximum delivery days must be greater than or equal to minimum'));
    }
  }
  next();
});

// ==================== EXPORT MODEL ====================

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;