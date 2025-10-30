const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const crypto = require('crypto');

// ============================================
// SCHEMAS
// ============================================

const addressSchema = new mongoose.Schema({
  label: {
    type: String,
    trim: true,
    maxlength: 50
  },
  fullAddress: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  province: {
    type: String,
    required: true,
    enum: [
      'Punjab', 
      'Sindh', 
      'Khyber Pakhtunkhwa', 
      'Balochistan', 
      'Gilgit-Baltistan', 
      'Azad Kashmir', 
      'Islamabad Capital Territory'
    ]
  },
  postalCode: {
    type: String,
    trim: true
  },
  landmark: {
    type: String,
    trim: true,
    maxlength: 200
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { _id: true });

// ============================================
// USER SCHEMA
// ============================================

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['customer', 'admin', 'super-admin'],
    default: 'customer'
  },
  fullName: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    trim: true,
    validate: {
      validator: function(v) {
        const cleaned = v.replace(/[\s-]/g, '');
        // Match: +923001234567 (13 chars) OR 03001234567 (11 chars) OR 3001234567 (10 chars)
        return /^(\+92[0-9]{10}|0[0-9]{10}|[0-9]{10})$/.test(cleaned);
      },
      message: 'Please provide a valid Pakistani phone number (e.g., +923001234567, 03001234567)'
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
      message: 'Please provide a valid WhatsApp number'
    }
  },
  profileImage: {
    type: String,
    default: ''
  },
  addresses: [addressSchema],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  // Email verification
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Password reset
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date,
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  
  // Security - Account locking
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  // User preferences
  preferences: {
    newsletter: {
      type: Boolean,
      default: true
    },
    orderUpdates: {
      type: Boolean,
      default: true
    },
    promotions: {
      type: Boolean,
      default: true
    }
  },
  
  // Customer-specific fields
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  customerType: {
    type: String,
    enum: ['new', 'returning', 'vip'],
    default: 'new'
  },
  vipSince: Date,
  
  // Metadata
  lastPasswordChange: Date,
  accountCreatedIP: String,
  lastLoginIP: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================
// INDEXES
// ============================================

userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ customerType: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ emailVerified: 1 });

// ============================================
// VIRTUAL PROPERTIES
// ============================================

userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.virtual('normalizedPhone').get(function() {
  if (!this.phone) return '';
  const cleaned = this.phone.replace(/[\s-]/g, '');
  
  if (cleaned.startsWith('+92')) return cleaned;
  if (cleaned.startsWith('0')) return '+92' + cleaned.substring(1);
  return '+92' + cleaned;
});

userSchema.virtual('phoneWithCode').get(function() {
  return this.normalizedPhone;
});

// ============================================
// PRE-SAVE MIDDLEWARE
// ============================================

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    
    if (!this.isNew) {
      this.passwordChangedAt = Date.now() - 1000;
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre('save', function(next) {
  if (!this.whatsapp && this.phone) {
    this.whatsapp = this.phone;
  }
  next();
});

// FIXED: Race condition safe default address handling
userSchema.pre('save', function(next) {
  if (this.isModified('addresses') && this.addresses.length > 0) {
    const defaultAddresses = this.addresses.filter(addr => addr.isDefault);
    
    if (defaultAddresses.length > 1) {
      // Keep only the last one as default
      let foundDefault = false;
      for (let i = this.addresses.length - 1; i >= 0; i--) {
        if (this.addresses[i].isDefault && !foundDefault) {
          foundDefault = true;
        } else if (this.addresses[i].isDefault) {
          this.addresses[i].isDefault = false;
        }
      }
    } else if (defaultAddresses.length === 0) {
      this.addresses[0].isDefault = true;
    }
  }
  next();
});

// ============================================
// INSTANCE METHODS
// ============================================

userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
  const lockTime = parseInt(process.env.LOCK_TIME) || 2 * 60 * 60 * 1000;
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

userSchema.methods.updateLastLogin = function(ipAddress) {
  return this.updateOne({ 
    $set: { 
      lastLogin: new Date(),
      lastLoginIP: ipAddress 
    } 
  });
};

userSchema.methods.updateCustomerStats = async function(orderAmount) {
  this.totalOrders += 1;
  this.totalSpent += orderAmount;
  
  const vipThreshold = parseInt(process.env.VIP_SPENDING_THRESHOLD) || 50000;
  const vipOrdersThreshold = parseInt(process.env.VIP_ORDERS_THRESHOLD) || 10;
  
  if (this.totalSpent >= vipThreshold || this.totalOrders >= vipOrdersThreshold) {
    this.customerType = 'vip';
    if (!this.vipSince) {
      this.vipSince = new Date();
    }
  } else if (this.totalOrders > 1) {
    this.customerType = 'returning';
  }
  
  await this.save();
};

userSchema.methods.generateEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  
  return verificationToken;
};

userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

userSchema.methods.addAddress = async function(addressData) {
  if (addressData.isDefault) {
    this.addresses.forEach(addr => {
      addr.isDefault = false;
    });
  }
  
  this.addresses.push(addressData);
  await this.save();
  return this.addresses[this.addresses.length - 1];
};

// FIXED: Atomic update for default address to prevent race conditions
userSchema.methods.setDefaultAddress = async function(addressId) {
  const result = await this.constructor.findOneAndUpdate(
    { 
      _id: this._id,
      'addresses._id': addressId 
    },
    [
      {
        $set: {
          addresses: {
            $map: {
              input: '$addresses',
              as: 'addr',
              in: {
                $mergeObjects: [
                  '$$addr',
                  {
                    isDefault: {
                      $cond: [
                        { $eq: ['$$addr._id', mongoose.Types.ObjectId(addressId)] },
                        true,
                        false
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      }
    ],
    { new: true }
  );
  
  if (!result) {
    throw new Error('Address not found');
  }
  
  Object.assign(this, result.toObject());
  return this;
};

userSchema.methods.updateAddress = async function(addressId, updateData) {
  const address = this.addresses.id(addressId);
  
  if (!address) {
    throw new Error('Address not found');
  }
  
  if (updateData.isDefault) {
    this.addresses.forEach(addr => {
      if (addr._id.toString() !== addressId.toString()) {
        addr.isDefault = false;
      }
    });
  }
  
  Object.assign(address, updateData);
  await this.save();
  return address;
};

userSchema.methods.deleteAddress = async function(addressId) {
  const address = this.addresses.id(addressId);
  
  if (!address) {
    throw new Error('Address not found');
  }
  
  const wasDefault = address.isDefault;
  address.remove();
  
  if (wasDefault && this.addresses.length > 0) {
    this.addresses[0].isDefault = true;
  }
  
  await this.save();
};

userSchema.methods.getDefaultAddress = function() {
  return this.addresses.find(addr => addr.isDefault) || this.addresses[0] || null;
};

// ============================================
// STATIC METHODS
// ============================================

userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByPhone = function(phone) {
  const cleaned = phone.replace(/[\s-]/g, '');
  return this.findOne({ phone: new RegExp(cleaned, 'i') });
};

userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

userSchema.statics.findVIPCustomers = function() {
  return this.find({ customerType: 'vip', isActive: true });
};

userSchema.statics.getCustomerStats = async function() {
  const stats = await this.aggregate([
    {
      $match: { role: 'customer', isActive: true }
    },
    {
      $group: {
        _id: '$customerType',
        count: { $sum: 1 },
        totalSpent: { $sum: '$totalSpent' },
        avgSpent: { $avg: '$totalSpent' },
        totalOrders: { $sum: '$totalOrders' }
      }
    }
  ]);
  
  return stats;
};

userSchema.statics.searchUsers = function(query, filters = {}) {
  const searchRegex = new RegExp(query, 'i');
  
  return this.find({
    ...filters,
    $or: [
      { fullName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex }
    ]
  }).select('-password');
};

// ============================================
// METHODS FOR JSON RESPONSE
// ============================================

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.loginAttempts;
  delete obj.lockUntil;
  delete obj.passwordChangedAt;
  delete obj.__v;
  
  return obj;
};

userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    fullName: this.fullName,
    profileImage: this.profileImage,
    customerType: this.customerType,
    vipSince: this.vipSince,
    totalOrders: this.totalOrders
  };
};

userSchema.methods.getSafeProfile = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.passwordChangedAt;
  return obj;
};

// ============================================
// EXPORT MODEL
// ============================================

const User = mongoose.model('User', userSchema);

module.exports = User;