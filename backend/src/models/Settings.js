const mongoose = require('mongoose');
const crypto = require('crypto');

// FIXED: Critical encryption key validation
const ENCRYPTION_KEY = (() => {
  const key = process.env.SETTINGS_ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error(
      'CRITICAL: SETTINGS_ENCRYPTION_KEY environment variable is required.\n' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  
  // Convert hex string to buffer
  if (key.length === 64) {
    return Buffer.from(key, 'hex');
  }
  
  // If raw string, ensure it's 32 bytes
  if (Buffer.from(key).length !== 32) {
    throw new Error('SETTINGS_ENCRYPTION_KEY must be exactly 32 bytes (64 hex characters)');
  }
  
  return Buffer.from(key);
})();

const IV_LENGTH = 16;

function encrypt(text) {
  if (!text) return text;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  if (!text) return text;
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Sub-schemas
const PaymentAccountSchema = new mongoose.Schema({
  bankName: {
    type: String,
    required: true,
    trim: true
  },
  accountTitle: {
    type: String,
    required: true,
    trim: true
  },
  accountNumber: {
    type: String,
    required: true,
    trim: true
  },
  iban: {
    type: String,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return !v || /^PK\d{2}[A-Z]{4}\d{16}$/.test(v);
      },
      message: 'Invalid IBAN format for Pakistan'
    }
  },
  branchCode: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, { _id: false });

const ShippingZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  cities: [{
    type: String,
    trim: true
  }],
  baseCharge: {
    type: Number,
    required: true,
    min: 0
  },
  perKgCharge: {
    type: Number,
    default: 0,
    min: 0
  },
  freeShippingThreshold: {
    type: Number,
    default: 0,
    min: 0
  },
  estimatedDays: {
    min: {
      type: Number,
      required: true,
      min: 1
    },
    max: {
      type: Number,
      required: true,
      min: 1
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const EmailTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true
  },
  variables: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const WhatsAppTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  variables: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: false });

// Main Settings Schema
const SettingsSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['general', 'payment', 'shipping', 'email', 'sms', 'whatsapp', 'seo', 'social', 'security', 'notifications'],
    index: true
  },

  version: {
    type: Number,
    default: 1
  },

  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  general: {
    siteName: {
      type: String,
      trim: true,
      maxlength: 100
    },
    tagline: {
      type: String,
      trim: true,
      maxlength: 200
    },
    logo: {
      url: String,
      altText: String
    },
    favicon: {
      type: String,
      trim: true
    },

    contact: {
      email: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
          validator: function(v) {
            return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
          },
          message: 'Invalid email format'
        }
      },
      phone: {
        type: String,
        trim: true,
        validate: {
          validator: function(v) {
            if (!v) return true;
            const cleaned = v.replace(/[\s-]/g, '');
            return /^(\+92[0-9]{10}|0[0-9]{10}|[0-9]{10})$/.test(cleaned);
          },
          message: 'Invalid Pakistani phone number'
        }
      },
      whatsapp: {
        type: String,
        trim: true,
        validate: {
          validator: function(v) {
            if (!v) return true;
            const cleaned = v.replace(/[\s-]/g, '');
            return /^(\+92[0-9]{10}|0[0-9]{10}|[0-9]{10})$/.test(cleaned);
          },
          message: 'Invalid WhatsApp number'
        }
      },
      address: {
        street: String,
        city: String,
        province: String,
        postalCode: String,
        country: {
          type: String,
          default: 'Pakistan'
        }
      }
    },

    businessHours: {
      monday: { open: String, close: String, isClosed: Boolean },
      tuesday: { open: String, close: String, isClosed: Boolean },
      wednesday: { open: String, close: String, isClosed: Boolean },
      thursday: { open: String, close: String, isClosed: Boolean },
      friday: { open: String, close: String, isClosed: Boolean },
      saturday: { open: String, close: String, isClosed: Boolean },
      sunday: { open: String, close: String, isClosed: Boolean }
    },

    currency: {
      code: {
        type: String,
        default: 'PKR',
        uppercase: true
      },
      symbol: {
        type: String,
        default: 'Rs.'
      },
      position: {
        type: String,
        enum: ['before', 'after'],
        default: 'before'
      }
    },

    maintenanceMode: {
      enabled: {
        type: Boolean,
        default: false
      },
      message: {
        type: String,
        trim: true
      },
      allowedIPs: [{
        type: String,
        trim: true
      }]
    }
  },

  payment: {
    bankTransfer: {
      enabled: {
        type: Boolean,
        default: true
      },
      accounts: [PaymentAccountSchema],
      instructions: {
        type: String,
        trim: true
      },
      receiptRequired: {
        type: Boolean,
        default: true
      },
      verificationMessage: {
        type: String,
        trim: true
      }
    },

    jazzCash: {
      enabled: {
        type: Boolean,
        default: true
      },
      accountNumber: {
        type: String,
        trim: true
      },
      accountTitle: {
        type: String,
        trim: true
      },
      instructions: {
        type: String,
        trim: true
      }
    },

    easyPaisa: {
      enabled: {
        type: Boolean,
        default: true
      },
      accountNumber: {
        type: String,
        trim: true
      },
      accountTitle: {
        type: String,
        trim: true
      },
      instructions: {
        type: String,
        trim: true
      }
    },

    cashOnDelivery: {
      enabled: {
        type: Boolean,
        default: false
      },
      extraCharge: {
        type: Number,
        default: 0,
        min: 0
      },
      minimumOrderValue: {
        type: Number,
        default: 0,
        min: 0
      },
      maximumOrderValue: {
        type: Number,
        default: 10000,
        min: 0
      },
      availableCities: [{
        type: String,
        trim: true
      }]
    },

    stripe: {
      enabled: {
        type: Boolean,
        default: false
      },
      publicKey: String,
      secretKey: String,
      webhookSecret: String
    },

    paypal: {
      enabled: {
        type: Boolean,
        default: false
      },
      clientId: String,
      clientSecret: String
    }
  },

  shipping: {
    zones: [ShippingZoneSchema],

    defaultEstimatedDays: {
      min: {
        type: Number,
        default: 7
      },
      max: {
        type: Number,
        default: 14
      }
    },

    freeShipping: {
      enabled: {
        type: Boolean,
        default: false
      },
      minimumOrderValue: {
        type: Number,
        default: 5000,
        min: 0
      }
    },

    rushOrder: {
      enabled: {
        type: Boolean,
        default: true
      },
      extraCharge: {
        type: Number,
        default: 500,
        min: 0
      },
      daysReduction: {
        type: Number,
        default: 5,
        min: 1
      }
    },

    trackingEnabled: {
      type: Boolean,
      default: true
    }
  },

  email: {
    smtp: {
      host: {
        type: String,
        trim: true
      },
      port: {
        type: Number,
        min: 1,
        max: 65535
      },
      secure: {
        type: Boolean,
        default: true
      },
      username: {
        type: String,
        trim: true
      },
      password: String,
      fromName: {
        type: String,
        trim: true
      },
      fromEmail: {
        type: String,
        trim: true,
        lowercase: true
      }
    },

    templates: {
      orderConfirmation: EmailTemplateSchema,
      paymentVerified: EmailTemplateSchema,
      orderStatusUpdate: EmailTemplateSchema,
      orderShipped: EmailTemplateSchema,
      orderDelivered: EmailTemplateSchema,
      orderCancelled: EmailTemplateSchema,
      welcomeEmail: EmailTemplateSchema,
      passwordReset: EmailTemplateSchema,
      newsletter: EmailTemplateSchema
    },

    notifications: {
      orderPlaced: {
        toCustomer: { type: Boolean, default: true },
        toAdmin: { type: Boolean, default: true }
      },
      paymentReceived: {
        toCustomer: { type: Boolean, default: true },
        toAdmin: { type: Boolean, default: true }
      },
      statusUpdate: {
        toCustomer: { type: Boolean, default: true }
      }
    }
  },

  sms: {
    enabled: {
      type: Boolean,
      default: false
    },
    provider: {
      type: String,
      enum: ['twilio', 'nexmo', 'local'],
      default: 'local'
    },
    apiKey: String,
    apiSecret: String,
    senderId: {
      type: String,
      trim: true,
      maxlength: 11
    },
    notifications: {
      orderPlaced: { type: Boolean, default: true },
      paymentVerified: { type: Boolean, default: true },
      orderShipped: { type: Boolean, default: true }
    }
  },

  whatsapp: {
    enabled: {
      type: Boolean,
      default: true
    },
    
    api: {
      provider: {
        type: String,
        enum: ['twilio', 'whatsapp-business', 'manual'],
        default: 'manual'
      },
      apiKey: String,
      phoneNumberId: String,
      accessToken: String
    },

    businessNumber: {
      type: String,
      trim: true
    },

    templates: {
      orderConfirmation: WhatsAppTemplateSchema,
      paymentVerified: WhatsAppTemplateSchema,
      orderStatusUpdate: WhatsAppTemplateSchema,
      orderShipped: WhatsAppTemplateSchema,
      orderDelivered: WhatsAppTemplateSchema
    },

    notifications: {
      orderPlaced: { type: Boolean, default: true },
      paymentVerified: { type: Boolean, default: true },
      statusUpdate: { type: Boolean, default: true },
      orderShipped: { type: Boolean, default: true },
      orderDelivered: { type: Boolean, default: true }
    },

    autoReply: {
      enabled: { type: Boolean, default: false },
      message: { type: String, trim: true },
      businessHoursOnly: { type: Boolean, default: true }
    }
  },

  seo: {
    homepage: {
      metaTitle: {
        type: String,
        trim: true,
        maxlength: 60
      },
      metaDescription: {
        type: String,
        trim: true,
        maxlength: 160
      },
      keywords: [{
        type: String,
        trim: true
      }],
      ogImage: String
    },

    siteName: String,
    separator: {
      type: String,
      default: '|'
    },
    defaultImage: String,

    googleAnalyticsId: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^(UA-|G-)[A-Z0-9-]+$/.test(v);
        },
        message: 'Invalid Google Analytics ID'
      }
    },
    googleTagManagerId: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^GTM-[A-Z0-9]+$/.test(v);
        },
        message: 'Invalid Google Tag Manager ID'
      }
    },
    googleSearchConsoleVerification: String,

    facebookPixelId: {
      type: String,
      trim: true
    },

    structuredData: {
      organization: {
        enabled: { type: Boolean, default: true },
        name: String,
        logo: String,
        sameAs: [String]
      },
      localBusiness: {
        enabled: { type: Boolean, default: true },
        priceRange: String
      }
    },

    robotsTxt: {
      type: String,
      trim: true
    },
    sitemapEnabled: {
      type: Boolean,
      default: true
    }
  },

  social: {
    facebook: {
      enabled: { type: Boolean, default: false },
      url: { type: String, trim: true }
    },
    instagram: {
      enabled: { type: Boolean, default: true },
      url: { type: String, trim: true },
      accessToken: String,
      autoFetch: { type: Boolean, default: false }
    },
    twitter: {
      enabled: { type: Boolean, default: false },
      url: { type: String, trim: true }
    },
    pinterest: {
      enabled: { type: Boolean, default: false },
      url: { type: String, trim: true }
    },
    tiktok: {
      enabled: { type: Boolean, default: false },
      url: { type: String, trim: true }
    },
    youtube: {
      enabled: { type: Boolean, default: false },
      url: { type: String, trim: true }
    }
  },

  security: {
    rateLimit: {
      enabled: { type: Boolean, default: true },
      maxRequests: { type: Number, default: 100 },
      windowMinutes: { type: Number, default: 15 }
    },

    passwordPolicy: {
      minLength: { type: Number, default: 8 },
      requireUppercase: { type: Boolean, default: true },
      requireLowercase: { type: Boolean, default: true },
      requireNumbers: { type: Boolean, default: true },
      requireSpecialChars: { type: Boolean, default: true },
      expiryDays: { type: Number, default: 0 }
    },

    sessionTimeout: {
      type: Number,
      default: 30
    },

    jwtExpiry: {
      accessToken: { type: Number, default: 3600 },
      refreshToken: { type: Number, default: 604800 }
    },

    twoFactorAuth: {
      enabled: { type: Boolean, default: false },
      required: { type: Boolean, default: false }
    },

    ipWhitelist: {
      enabled: { type: Boolean, default: false },
      ips: [String]
    }
  },

  notifications: {
    admin: {
      newOrder: {
        email: { type: Boolean, default: true },
        whatsapp: { type: Boolean, default: true }
      },
      paymentReceived: {
        email: { type: Boolean, default: true },
        whatsapp: { type: Boolean, default: false }
      },
      lowStock: {
        email: { type: Boolean, default: true },
        threshold: { type: Number, default: 5 }
      },
      newInquiry: {
        email: { type: Boolean, default: true },
        whatsapp: { type: Boolean, default: false }
      }
    },

    customer: {
      orderUpdates: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        whatsapp: { type: Boolean, default: true }
      },
      promotional: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
      }
    }
  },

  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  changeLog: [{
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    },
    ipAddress: String
  }],

  notes: {
    type: String,
    trim: true
  }

}, {
  timestamps: true,
  collection: 'settings'
});

// ==================== INDEXES ====================
SettingsSchema.index({ type: 1, isActive: 1 });
SettingsSchema.index({ 'general.siteName': 'text' });
SettingsSchema.index({ lastModifiedBy: 1, updatedAt: -1 });

// ==================== PRE-SAVE MIDDLEWARE ====================
SettingsSchema.pre('save', function(next) {
  const sensitiveFields = [
    'payment.stripe.secretKey',
    'payment.stripe.webhookSecret',
    'payment.paypal.clientSecret',
    'email.smtp.password',
    'sms.apiKey',
    'sms.apiSecret',
    'whatsapp.api.apiKey',
    'whatsapp.api.accessToken',
    'social.instagram.accessToken'
  ];

  sensitiveFields.forEach(fieldPath => {
    const value = fieldPath.split('.').reduce((obj, key) => obj?.[key], this);
    if (value && !value.includes(':')) {
      const keys = fieldPath.split('.');
      let obj = this;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = encrypt(value);
    }
  });

  if (!this.isNew) {
    this.version += 1;
  }

  next();
});

// ==================== METHODS ====================

SettingsSchema.methods.decryptField = function(fieldPath) {
  const value = fieldPath.split('.').reduce((obj, key) => obj?.[key], this);
  if (value && value.includes(':')) {
    return decrypt(value);
  }
  return value;
};

SettingsSchema.methods.getSMTPConfig = function() {
  if (!this.email?.smtp) return null;
  
  return {
    host: this.email.smtp.host,
    port: this.email.smtp.port,
    secure: this.email.smtp.secure,
    auth: {
      user: this.email.smtp.username,
      pass: this.decryptField('email.smtp.password')
    }
  };
};

SettingsSchema.methods.getActivePaymentMethods = function() {
  const methods = [];
  
  if (this.payment?.bankTransfer?.enabled) {
    methods.push({
      type: 'bank-transfer',
      name: 'Bank Transfer',
      accounts: this.payment.bankTransfer.accounts.filter(acc => acc.isActive),
      instructions: this.payment.bankTransfer.instructions
    });
  }
  
  if (this.payment?.jazzCash?.enabled) {
    methods.push({
      type: 'jazzcash',
      name: 'JazzCash',
      accountNumber: this.payment.jazzCash.accountNumber,
      accountTitle: this.payment.jazzCash.accountTitle,
      instructions: this.payment.jazzCash.instructions
    });
  }
  
  if (this.payment?.easyPaisa?.enabled) {
    methods.push({
      type: 'easypaisa',
      name: 'EasyPaisa',
      accountNumber: this.payment.easyPaisa.accountNumber,
      accountTitle: this.payment.easyPaisa.accountTitle,
      instructions: this.payment.easyPaisa.instructions
    });
  }
  
  if (this.payment?.cashOnDelivery?.enabled) {
    methods.push({
      type: 'cod',
      name: 'Cash on Delivery',
      extraCharge: this.payment.cashOnDelivery.extraCharge,
      minimumOrderValue: this.payment.cashOnDelivery.minimumOrderValue,
      maximumOrderValue: this.payment.cashOnDelivery.maximumOrderValue
    });
  }
  
  return methods;
};

SettingsSchema.methods.calculateShipping = function(city, orderValue = 0) {
  if (!this.shipping?.zones) return { charge: 0, estimatedDays: { min: 7, max: 14 } };
  
  const zone = this.shipping.zones.find(z => 
    z.isActive && z.cities.some(c => c.toLowerCase() === city.toLowerCase())
  );
  
  if (!zone) {
    return {
      charge: 0,
      estimatedDays: this.shipping.defaultEstimatedDays,
      message: 'Shipping not available to this location'
    };
  }
  
  if (this.shipping.freeShipping?.enabled && 
      orderValue >= this.shipping.freeShipping.minimumOrderValue) {
    return {
      charge: 0,
      estimatedDays: zone.estimatedDays,
      message: 'Free Shipping'
    };
  }
  
  if (zone.freeShippingThreshold > 0 && orderValue >= zone.freeShippingThreshold) {
    return {
      charge: 0,
      estimatedDays: zone.estimatedDays,
      message: 'Free Shipping (Zone Offer)'
    };
  }
  
  return {
    charge: zone.baseCharge,
    estimatedDays: zone.estimatedDays
  };
};

SettingsSchema.methods.getEmailTemplate = function(templateName, variables = {}) {
  const template = this.email?.templates?.[templateName];
  if (!template || !template.isActive) return null;
  
  let subject = template.subject;
  let body = template.body;
  
  Object.keys(variables).forEach(key => {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(placeholder, variables[key]);
    body = body.replace(placeholder, variables[key]);
  });
  
  return { subject, body };
};

SettingsSchema.methods.getWhatsAppTemplate = function(templateName, variables = {}) {
  const template = this.whatsapp?.templates?.[templateName];
  if (!template || !template.isActive) return null;
  
  let message = template.message;
  
  Object.keys(variables).forEach(key => {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    message = message.replace(placeholder, variables[key]);
  });
  
  return message;
};

SettingsSchema.methods.isInMaintenanceMode = function(ipAddress = null) {
  if (!this.general?.maintenanceMode?.enabled) return false;
  
  if (ipAddress && this.general.maintenanceMode.allowedIPs?.includes(ipAddress)) {
    return false;
  }
  
  return true;
};

SettingsSchema.methods.logChange = function(field, oldValue, newValue, userId, ipAddress) {
  this.changeLog.push({
    field,
    oldValue,
    newValue,
    modifiedBy: userId,
    modifiedAt: new Date(),
    ipAddress
  });
};

// ==================== STATICS ====================

SettingsSchema.statics.getByType = async function(type) {
  return await this.findOne({ type, isActive: true });
};

SettingsSchema.statics.getOrCreate = async function(type) {
  let settings = await this.findOne({ type });
  
  if (!settings) {
    settings = new this({ type });
    await settings.save();
  }
  
  return settings;
};

SettingsSchema.statics.updateField = async function(type, fieldPath, value, userId, ipAddress) {
  const settings = await this.getOrCreate(type);
  
  const oldValue = fieldPath.split('.').reduce((obj, key) => obj?.[key], settings);
  
  const keys = fieldPath.split('.');
  let obj = settings;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!obj[keys[i]]) obj[keys[i]] = {};
    obj = obj[keys[i]];
  }
  obj[keys[keys.length - 1]] = value;
  
  settings.logChange(fieldPath, oldValue, value, userId, ipAddress);
  settings.lastModifiedBy = userId;
  
  await settings.save();
  return settings;
};

// ==================== VIRTUALS ====================

SettingsSchema.virtual('formattedBusinessHours').get(function() {
  if (!this.general?.businessHours) return null;
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  return days.map(day => {
    const hours = this.general.businessHours[day];
    if (!hours || hours.isClosed) {
      return { day, status: 'Closed' };
    }
    return {
      day,
      status: 'Open',
      hours: `${hours.open} - ${hours.close}`
    };
  });
});

SettingsSchema.virtual('contactInfo').get(function() {
  if (!this.general?.contact) return null;
  
  return {
    email: this.general.contact.email,
    phone: this.general.contact.phone,
    whatsapp: this.general.contact.whatsapp,
    address: this.general.contact.address ? 
      `${this.general.contact.address.street}, ${this.general.contact.address.city}, ${this.general.contact.address.province}, ${this.general.contact.address.country}` 
      : null
  };
});

SettingsSchema.virtual('isOperational').get(function() {
  return this.isActive && !this.general?.maintenanceMode?.enabled;
});

SettingsSchema.set('toJSON', { virtuals: true });
SettingsSchema.set('toObject', { virtuals: true });

// ==================== VALIDATION METHODS ====================

SettingsSchema.methods.validateEmailConfig = function() {
  const errors = [];
  
  if (this.email?.smtp) {
    if (!this.email.smtp.host) errors.push('SMTP host is required');
    if (!this.email.smtp.port) errors.push('SMTP port is required');
    if (!this.email.smtp.username) errors.push('SMTP username is required');
    if (!this.email.smtp.password) errors.push('SMTP password is required');
    if (!this.email.smtp.fromEmail) errors.push('From email is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

SettingsSchema.methods.validatePaymentConfig = function() {
  const errors = [];
  
  if (this.payment?.bankTransfer?.enabled) {
    if (!this.payment.bankTransfer.accounts || this.payment.bankTransfer.accounts.length === 0) {
      errors.push('At least one bank account is required for bank transfer');
    }
  }
  
  if (this.payment?.cashOnDelivery?.enabled) {
    if (!this.payment.cashOnDelivery.availableCities || 
        this.payment.cashOnDelivery.availableCities.length === 0) {
      errors.push('COD cities must be specified');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

SettingsSchema.methods.validateShippingConfig = function() {
  const errors = [];
  
  if (!this.shipping?.zones || this.shipping.zones.length === 0) {
    errors.push('At least one shipping zone is required');
  }
  
  this.shipping?.zones?.forEach((zone, index) => {
    if (!zone.name) errors.push(`Zone ${index + 1}: Name is required`);
    if (zone.cities.length === 0) errors.push(`Zone ${index + 1}: At least one city is required`);
    if (zone.baseCharge < 0) errors.push(`Zone ${index + 1}: Base charge cannot be negative`);
    if (zone.estimatedDays.min > zone.estimatedDays.max) {
      errors.push(`Zone ${index + 1}: Min days cannot exceed max days`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ==================== UTILITY METHODS ====================

SettingsSchema.methods.exportSettings = function(includeSensitive = false) {
  const obj = this.toObject();
  
  delete obj._id;
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;
  delete obj.changeLog;
  
  if (!includeSensitive) {
    sanitizeSensitiveData(obj);
  }
  
  return obj;
};

SettingsSchema.statics.importSettings = async function(data, userId, ipAddress) {
  const { type } = data;
  if (!type) throw new Error('Settings type is required');
  
  let settings = await this.findOne({ type });
  
  if (settings) {
    Object.assign(settings, data);
    settings.lastModifiedBy = userId;
    settings.logChange('import', 'full_import', 'imported', userId, ipAddress);
  } else {
    settings = new this(data);
    settings.lastModifiedBy = userId;
  }
  
  await settings.save();
  return settings;
};

SettingsSchema.statics.resetToDefaults = async function(type) {
  const settings = await this.findOne({ type });
  if (settings) {
    await settings.deleteOne();
  }
  
  return await this.getOrCreate(type);
};

SettingsSchema.methods.cloneToType = async function(newType) {
  const cloned = this.toObject();
  delete cloned._id;
  delete cloned.createdAt;
  delete cloned.updatedAt;
  delete cloned.changeLog;
  
  cloned.type = newType;
  cloned.version = 1;
  
  const newSettings = new this.constructor(cloned);
  await newSettings.save();
  return newSettings;
};

// ==================== QUERY HELPERS ====================

SettingsSchema.query.active = function() {
  return this.where({ isActive: true });
};

SettingsSchema.query.byType = function(type) {
  return this.where({ type });
};

SettingsSchema.query.withSensitive = function() {
  return this.transform((doc) => {
    if (doc) doc._showSensitive = true;
    return doc;
  });
};

// ==================== POST-FIND MIDDLEWARE ====================

SettingsSchema.post('find', function(docs) {
  if (Array.isArray(docs)) {
    docs.forEach(doc => {
      if (doc && !doc._showSensitive) {
        sanitizeSensitiveData(doc);
      }
    });
  }
});

SettingsSchema.post('findOne', function(doc) {
  if (doc && !doc._showSensitive) {
    sanitizeSensitiveData(doc);
  }
});

function sanitizeSensitiveData(doc) {
  if (doc.payment?.stripe?.secretKey) {
    doc.payment.stripe.secretKey = '[ENCRYPTED]';
  }
  if (doc.payment?.stripe?.webhookSecret) {
    doc.payment.stripe.webhookSecret = '[ENCRYPTED]';
  }
  if (doc.payment?.paypal?.clientSecret) {
    doc.payment.paypal.clientSecret = '[ENCRYPTED]';
  }
  if (doc.email?.smtp?.password) {
    doc.email.smtp.password = '[ENCRYPTED]';
  }
  if (doc.sms?.apiKey) {
    doc.sms.apiKey = '[ENCRYPTED]';
  }
  if (doc.sms?.apiSecret) {
    doc.sms.apiSecret = '[ENCRYPTED]';
  }
  if (doc.whatsapp?.api?.apiKey) {
    doc.whatsapp.api.apiKey = '[ENCRYPTED]';
  }
  if (doc.whatsapp?.api?.accessToken) {
    doc.whatsapp.api.accessToken = '[ENCRYPTED]';
  }
  if (doc.social?.instagram?.accessToken) {
    doc.social.instagram.accessToken = '[ENCRYPTED]';
  }
}

// ==================== CACHE INVALIDATION HOOKS ====================

SettingsSchema.post('save', async function(doc) {
  this.constructor.emit('settingsUpdated', { type: doc.type, id: doc._id });
});

SettingsSchema.post('deleteOne', { document: true, query: false }, async function(doc) {
  this.constructor.emit('settingsDeleted', { type: doc.type, id: doc._id });
});

// ==================== DEFAULT SETTINGS SEEDS ====================

SettingsSchema.statics.seedDefaults = async function() {
  const defaultSettings = [
    {
      type: 'general',
      general: {
        siteName: 'LaraibCreative',
        tagline: 'We turn your thoughts & emotions into reality and happiness',
        currency: {
          code: 'PKR',
          symbol: 'Rs.',
          position: 'before'
        },
        businessHours: {
          monday: { open: '10:00 AM', close: '08:00 PM', isClosed: false },
          tuesday: { open: '10:00 AM', close: '08:00 PM', isClosed: false },
          wednesday: { open: '10:00 AM', close: '08:00 PM', isClosed: false },
          thursday: { open: '10:00 AM', close: '08:00 PM', isClosed: false },
          friday: { open: '10:00 AM', close: '08:00 PM', isClosed: false },
          saturday: { open: '10:00 AM', close: '08:00 PM', isClosed: false },
          sunday: { open: '10:00 AM', close: '06:00 PM', isClosed: false }
        }
      }
    },
    {
      type: 'payment',
      payment: {
        bankTransfer: {
          enabled: true,
          accounts: [],
          instructions: 'Please transfer the amount to any of the accounts below and upload the payment receipt.',
          receiptRequired: true
        },
        jazzCash: {
          enabled: true,
          instructions: 'Send payment to the JazzCash number and upload screenshot'
        },
        easyPaisa: {
          enabled: true,
          instructions: 'Send payment to the EasyPaisa number and upload screenshot'
        },
        cashOnDelivery: {
          enabled: false,
          extraCharge: 150,
          minimumOrderValue: 500,
          maximumOrderValue: 10000
        }
      }
    },
    {
      type: 'shipping',
      shipping: {
        zones: [
          {
            name: 'Lahore City',
            cities: ['Lahore'],
            baseCharge: 200,
            freeShippingThreshold: 5000,
            estimatedDays: { min: 3, max: 5 },
            isActive: true
          },
          {
            name: 'Major Cities',
            cities: ['Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan'],
            baseCharge: 300,
            freeShippingThreshold: 7000,
            estimatedDays: { min: 5, max: 7 },
            isActive: true
          },
          {
            name: 'Other Cities',
            cities: ['Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Bahawalpur'],
            baseCharge: 350,
            freeShippingThreshold: 8000,
            estimatedDays: { min: 7, max: 10 },
            isActive: true
          }
        ],
        defaultEstimatedDays: { min: 7, max: 14 },
        freeShipping: {
          enabled: true,
          minimumOrderValue: 5000
        },
        rushOrder: {
          enabled: true,
          extraCharge: 500,
          daysReduction: 5
        }
      }
    },
    {
      type: 'whatsapp',
      whatsapp: {
        enabled: true,
        api: {
          provider: 'manual'
        },
        notifications: {
          orderPlaced: true,
          paymentVerified: true,
          statusUpdate: true,
          orderShipped: true,
          orderDelivered: true
        }
      }
    },
    {
      type: 'seo',
      seo: {
        homepage: {
          metaTitle: 'Custom Ladies Suits Stitching Online | LaraibCreative',
          metaDescription: 'Get custom stitched ladies suits online. Designer replicas, bridal wear, party suits with perfect measurements. Fast delivery across Pakistan.',
          keywords: ['custom stitching pakistan', 'ladies suit stitching', 'designer suits online', 'bridal wear stitching']
        },
        separator: '|',
        sitemapEnabled: true
      }
    }
  ];

  const results = [];
  for (const setting of defaultSettings) {
    const exists = await this.findOne({ type: setting.type });
    if (!exists) {
      const created = await this.create(setting);
      results.push(created);
    }
  }
  
  return results;
};

// ==================== ERROR HANDLING ====================

SettingsSchema.post('save', function(error, doc, next) {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    next(new Error(`Validation failed: ${errors.join(', ')}`));
  } else {
    next(error);
  }
});

// ==================== MODEL EXPORT ====================

const Settings = mongoose.model('Settings', SettingsSchema);

module.exports = Settings;