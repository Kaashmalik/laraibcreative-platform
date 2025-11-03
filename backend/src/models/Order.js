const mongoose = require('mongoose');

// ============================================
// SUB-SCHEMAS
// ============================================

const measurementSchema = new mongoose.Schema({
  shirtLength: { type: Number, min: 0, max: 100 },
  shoulderWidth: { type: Number, min: 0, max: 50 },
  sleeveLength: { type: Number, min: 0, max: 60 },
  armHole: { type: Number, min: 0, max: 40 },
  bust: { type: Number, min: 0, max: 100 },
  waist: { type: Number, min: 0, max: 100 },
  hip: { type: Number, min: 0, max: 120 },
  frontNeckDepth: { type: Number, min: 0, max: 20 },
  backNeckDepth: { type: Number, min: 0, max: 20 },
  wrist: { type: Number, min: 0, max: 30 },
  trouserLength: { type: Number, min: 0, max: 80 },
  trouserWaist: { type: Number, min: 0, max: 100 },
  trouserHip: { type: Number, min: 0, max: 120 },
  thigh: { type: Number, min: 0, max: 60 },
  bottom: { type: Number, min: 0, max: 40 },
  kneeLength: { type: Number, min: 0, max: 40 },
  dupattaLength: { type: Number, min: 0, max: 150 },
  dupattaWidth: { type: Number, min: 0, max: 60 },
  unit: { type: String, enum: ['inches', 'cm'], default: 'inches' },
  sizeLabel: { type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'] }
}, { _id: false });

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  
  productSnapshot: {
    title: String,
    sku: String,
    primaryImage: String,
    description: String,
    category: String,
    fabricType: String
  },
  
  isCustom: {
    type: Boolean,
    default: false,
    required: true
  },
  
  customDetails: {
    serviceType: {
      type: String,
      enum: ['fully-custom', 'brand-article-copy'],
      required: function() { return this.isCustom; }
    },
    
    measurements: {
      type: measurementSchema,
      required: function() { return this.isCustom; }
    },
    
    referenceImages: [{
      url: String,
      caption: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    
    fabric: {
      providedBy: {
        type: String,
        enum: ['customer', 'laraibcreative'],
        required: function() { return this.isCustom; }
      },
      type: String,
      color: String,
      quality: String,
      metersRequired: Number
    },
    
    specialInstructions: {
      type: String,
      maxlength: [1000, 'Instructions cannot exceed 1000 characters']
    },
    
    addOns: [{
      name: String,
      price: Number
    }],
    
    estimatedDays: {
      type: Number,
      default: 7
    },
    rushOrder: {
      type: Boolean,
      default: false
    }
  },
  
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: [1, 'Quantity must be at least 1']
  },
  
  subtotal: {
    type: Number,
    required: true
  }
}, { _id: true });

orderItemSchema.pre('save', function(next) {
  let itemTotal = this.price * this.quantity;
  
  if (this.isCustom && this.customDetails?.addOns) {
    const addOnsTotal = this.customDetails.addOns.reduce((sum, addon) => sum + addon.price, 0);
    itemTotal += addOnsTotal;
  }
  
  if (this.isCustom && this.customDetails?.rushOrder) {
    itemTotal *= 1.25;
  }
  
  this.subtotal = itemTotal;
  next();
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        const cleaned = v.replace(/[\s-]/g, '');
        return /^(\+92[0-9]{10}|0[0-9]{10}|[0-9]{10})$/.test(cleaned);
      },
      message: 'Invalid Pakistani phone number'
    }
  },
  whatsapp: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        const cleaned = v.replace(/[\s-]/g, '');
        return /^(\+92[0-9]{10}|0[0-9]{10}|[0-9]{10})$/.test(cleaned);
      },
      message: 'Invalid WhatsApp number'
    }
  },
  addressLine1: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  addressLine2: String,
  landmark: String,
  city: {
    type: String,
    required: [true, 'City is required'],
    enum: ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Other']
  },
  province: {
    type: String,
    required: [true, 'Province is required'],
    enum: ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Gilgit-Baltistan', 'AJK']
  },
  postalCode: {
    type: String,
    validate: {
      validator: function(v) {
        return /^[0-9]{5}$/.test(v);
      },
      message: 'Invalid postal code (must be 5 digits)'
    }
  },
  deliveryInstructions: {
    type: String,
    maxlength: [500, 'Delivery instructions cannot exceed 500 characters']
  }
}, { _id: false });

const paymentSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['bank-transfer', 'jazzcash', 'easypaisa', 'cod'],
    required: [true, 'Payment method is required']
  },
  
  status: {
    type: String,
    enum: ['pending', 'verified', 'failed', 'refunded'],
    default: 'pending'
  },
  
  bankDetails: {
    accountTitle: String,
    accountNumber: String,
    bankName: String,
    branch: String
  },
  
  receiptImage: {
    url: String,
    cloudinaryId: String,
    uploadedAt: Date
  },
  
  transactionId: {
    type: String,
    trim: true
  },
  
  transactionDate: Date,
  
  amountPaid: {
    type: Number,
    min: 0
  },
  
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  verificationNotes: String,
  
  codCollected: {
    type: Boolean,
    default: false
  },
  codCollectedAt: Date,
  
  refund: {
    amount: Number,
    reason: String,
    processedAt: Date,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  note: String,
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const trackingSchema = new mongoose.Schema({
  courierService: {
    type: String,
    enum: ['TCS', 'Leopards', 'M&P', 'BlueEx', 'Trax', 'Call Courier', 'Self-Pickup', 'Other']
  },
  trackingNumber: String,
  trackingUrl: String,
  dispatchDate: Date,
  estimatedDeliveryDate: Date,
  actualDeliveryDate: Date,
  deliveryProof: {
    image: String,
    recipientName: String,
    signature: String
  }
}, { _id: false });

const adminNoteSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    maxlength: [1000, 'Note cannot exceed 1000 characters']
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isImportant: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

// ============================================
// MAIN ORDER SCHEMA
// ============================================

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  customerInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid email format'
      }
    },
    phone: {
      type: String,
      required: true
    },
    whatsapp: String
  },
  
  items: {
    type: [orderItemSchema],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Order must contain at least one item'
    }
  },
  
  shippingAddress: {
    type: shippingAddressSchema,
    required: true
  },
  
  tracking: trackingSchema,
  
  payment: {
    type: paymentSchema,
    required: true
  },
  
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    shippingCharges: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    discountCode: String,
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  
  status: {
    type: String,
    enum: [
      'pending-payment',
      'payment-verified',
      'material-arranged',
      'in-progress',
      'quality-check',
      'ready-dispatch',
      'dispatched',
      'delivered',
      'cancelled',
      'refunded'
    ],
    default: 'pending-payment',
    index: true
  },
  
  statusHistory: [statusHistorySchema],
  
  assignedTailor: {
    type: String,
    trim: true
  },
  
  priority: {
    type: String,
    enum: ['normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  estimatedCompletion: Date,
  actualCompletion: Date,
  
  notes: [adminNoteSchema],
  
  tags: [{
    type: String,
    trim: true
  }],
  
  customerRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    reviewedAt: Date
  },
  
  cancellation: {
    cancelledBy: {
      type: String,
      enum: ['customer', 'admin']
    },
    reason: String,
    requestedAt: Date,
    approvedAt: Date
  },
  
  issues: [{
    type: {
      type: String,
      enum: ['measurement-issue', 'fabric-issue', 'quality-issue', 'delay', 'damage', 'other']
    },
    description: String,
    reportedAt: { type: Date, default: Date.now },
    resolvedAt: Date,
    resolution: String
  }],
  
  source: {
    type: String,
    enum: ['website', 'whatsapp', 'instagram', 'phone', 'walk-in'],
    default: 'website'
  },
  
  ipAddress: String,
  userAgent: String,
  
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================
// INDEXES
// ============================================

orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ customer: 1, createdAt: -1 });
// Note: orderNumber index is created automatically by unique: true, so we don't need to declare it again
orderSchema.index({ 'payment.status': 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ isDeleted: 1, createdAt: -1 });

orderSchema.index({
  orderNumber: 'text',
  'customerInfo.name': 'text',
  'customerInfo.email': 'text',
  'shippingAddress.city': 'text'
});

// ============================================
// VIRTUAL FIELDS
// ============================================

orderSchema.virtual('hasCustomItems').get(function() {
  return this.items.some(item => item.isCustom);
});

orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

orderSchema.virtual('daysInProgress').get(function() {
  const now = new Date();
  const created = this.createdAt;
  return Math.floor((now - created) / (1000 * 60 * 60 * 24));
});

orderSchema.virtual('isOverdue').get(function() {
  if (!this.estimatedCompletion) return false;
  return new Date() > this.estimatedCompletion && !['delivered', 'cancelled'].includes(this.status);
});

orderSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'pending-payment': { label: 'Pending Payment', color: 'warning' },
    'payment-verified': { label: 'Payment Verified', color: 'info' },
    'material-arranged': { label: 'Material Arranged', color: 'info' },
    'in-progress': { label: 'In Progress', color: 'primary' },
    'quality-check': { label: 'Quality Check', color: 'info' },
    'ready-dispatch': { label: 'Ready for Dispatch', color: 'success' },
    'dispatched': { label: 'Dispatched', color: 'success' },
    'delivered': { label: 'Delivered', color: 'success' },
    'cancelled': { label: 'Cancelled', color: 'danger' },
    'refunded': { label: 'Refunded', color: 'danger' }
  };
  return statusMap[this.status] || { label: this.status, color: 'default' };
});

// ============================================
// PRE-SAVE HOOKS
// ============================================

orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const year = new Date().getFullYear();
    const prefix = `LC-${year}-`;
    
    const lastOrder = await this.constructor
      .findOne({ orderNumber: new RegExp(`^${prefix}`) })
      .sort({ orderNumber: -1 })
      .select('orderNumber')
      .lean();
    
    let nextNumber = 1;
    if (lastOrder) {
      const lastNumber = parseInt(lastOrder.orderNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }
    
    this.orderNumber = `${prefix}${String(nextNumber).padStart(4, '0')}`;
  }
  
  next();
});

orderSchema.pre('save', function(next) {
  this.pricing.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  
  this.pricing.total = 
    this.pricing.subtotal + 
    this.pricing.shippingCharges + 
    this.pricing.tax - 
    this.pricing.discount;
  
  if (this.pricing.total < 0) {
    this.pricing.total = 0;
  }
  
  next();
});

orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const lastHistoryStatus = this.statusHistory[this.statusHistory.length - 1]?.status;
    
    if (lastHistoryStatus !== this.status) {
      this.statusHistory.push({
        status: this.status,
        timestamp: new Date()
      });
    }
  }
  
  next();
});

orderSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'delivered' && !this.actualCompletion) {
    this.actualCompletion = new Date();
  }
  next();
});

// ============================================
// INSTANCE METHODS
// ============================================

orderSchema.methods.updateStatus = function(newStatus, note, updatedBy) {
  this.status = newStatus;
  
  if (note || updatedBy) {
    this.statusHistory.push({
      status: newStatus,
      note: note,
      updatedBy: updatedBy,
      timestamp: new Date()
    });
  }
  
  return this.save();
};

orderSchema.methods.verifyPayment = function(verifiedBy, notes) {
  this.payment.status = 'verified';
  this.payment.verifiedBy = verifiedBy;
  this.payment.verifiedAt = new Date();
  this.payment.verificationNotes = notes;
  
  if (this.status === 'pending-payment') {
    this.status = 'payment-verified';
  }
  
  return this.save();
};

orderSchema.methods.addNote = function(text, addedBy, isImportant = false) {
  this.notes.push({
    text,
    addedBy,
    isImportant,
    timestamp: new Date()
  });
  
  return this.save();
};

orderSchema.methods.cancelOrder = function(reason, cancelledBy) {
  if (['delivered', 'cancelled'].includes(this.status)) {
    throw new Error('Cannot cancel order in current status');
  }
  
  this.status = 'cancelled';
  this.cancellation = {
    cancelledBy,
    reason,
    requestedAt: new Date(),
    approvedAt: new Date()
  };
  
  return this.save();
};

orderSchema.methods.canCancelByCustomer = function() {
  return ['pending-payment', 'payment-verified'].includes(this.status);
};

orderSchema.methods.getEstimatedDelivery = function() {
  if (this.tracking?.estimatedDeliveryDate) {
    return this.tracking.estimatedDeliveryDate;
  }
  
  if (this.estimatedCompletion) {
    const delivery = new Date(this.estimatedCompletion);
    delivery.setDate(delivery.getDate() + 4);
    return delivery;
  }
  
  return null;
};

// ============================================
// STATIC METHODS
// ============================================

orderSchema.statics.findByStatus = function(status, page = 1, limit = 20) {
  return this.find({ status, isDeleted: false })
    .populate('customer', 'fullName email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

orderSchema.statics.findByCustomer = function(customerId, page = 1, limit = 20) {
  return this.find({ customer: customerId, isDeleted: false })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

orderSchema.statics.getPendingPayments = function() {
  return this.find({
    'payment.status': 'pending',
    'payment.receiptImage.url': { $exists: true },
    isDeleted: false
  })
  .populate('customer', 'fullName email phone')
  .sort({ 'payment.receiptImage.uploadedAt': 1 });
};

orderSchema.statics.getOverdueOrders = function() {
  return this.find({
    estimatedCompletion: { $lt: new Date() },
    status: { $nin: ['delivered', 'cancelled', 'refunded'] },
    isDeleted: false
  })
  .populate('customer', 'fullName phone whatsapp')
  .sort({ estimatedCompletion: 1 });
};

orderSchema.statics.getSalesStats = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $nin: ['cancelled', 'refunded'] },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.total' },
        averageOrderValue: { $avg: '$pricing.total' },
        customOrders: {
          $sum: {
            $cond: [{ $gt: [{ $size: { $filter: { input: '$items', cond: '$$this.isCustom' } } }, 0] }, 1, 0]
          }
        }
      }
    }
  ]);
};

orderSchema.statics.searchOrders = function(query) {
  return this.find({
    $text: { $search: query },
    isDeleted: false
  })
  .populate('customer', 'fullName email')
  .sort({ score: { $meta: 'textScore' } })
  .limit(50);
};

// FIXED: Added transaction support for order creation
orderSchema.statics.createOrderWithTransaction = async function(orderData, providedSession) {
  const Order = this;
  const Product = mongoose.model('Product');
  const User = mongoose.model('User');
  
  const session = providedSession || await mongoose.startSession();
  const isNewSession = !providedSession;
  
  try {
    if (isNewSession) {
      await session.startTransaction();
    }
    
    const order = new Order(orderData);
    await order.save({ session });
    
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { 
          $inc: { 
            purchased: item.quantity,
            'inventory.stockQuantity': item.isCustom ? 0 : -item.quantity
          } 
        },
        { session }
      );
    }
    
    await User.findByIdAndUpdate(
      order.customer,
      { 
        $inc: { 
          totalOrders: 1,
          totalSpent: order.pricing.total 
        } 
      },
      { session }
    );
    
    if (isNewSession) {
      await session.commitTransaction();
    }
    
    return order;
    
  } catch (error) {
    if (isNewSession) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    if (isNewSession) {
      session.endSession();
    }
  }
};

// ============================================
// POST HOOKS
// ============================================

orderSchema.post('save', function(doc, next) {
  if (doc.isNew) {
    console.log(`New order created: ${doc.orderNumber}`);
  }
  next();
});

orderSchema.pre('remove', function(next) {
  this.isDeleted = true;
  this.save();
  next(new Error('Orders cannot be permanently deleted. Use soft delete.'));
});

// ============================================
// EXPORT MODEL
// ============================================

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;