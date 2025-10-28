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
    select: false // Don't return password by default
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^(\+92|0)?[0-9]{10}$/.test(v.replace(/[\s-]/g, ''));
      },
      message: 'Please provide a valid Pakistani phone number'
    }
  },
  whatsapp: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^(\+92|0)?[0-9]{10}$/.test(v.replace(/[\s-]/g, ''));
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

// Virtual for account locked status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Virtual for full phone with country code
userSchema.virtual('phoneWithCode').get(function() {
  if (!this.phone) return '';
  const cleaned = this.phone.replace(/[\s-]/g, '');
  if (cleaned.startsWith('+92')) return cleaned;
  if (cleaned.startsWith('0')) return '+92' + cleaned.substring(1);
  return '+92' + cleaned;
});

// ============================================
// PRE-SAVE MIDDLEWARE
// ============================================

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Set password changed timestamp
    if (!this.isNew) {
      this.passwordChangedAt = Date.now() - 1000; // Subtract 1 sec to ensure token is created after password change
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Sync WhatsApp with phone if not provided
userSchema.pre('save', function(next) {
  if (!this.whatsapp && this.phone) {
    this.whatsapp = this.phone;
  }
  next();
});

// Ensure only one default address
userSchema.pre('save', function(next) {
  if (this.isModified('addresses')) {
    const defaultAddresses = this.addresses.filter(addr => addr.isDefault);
    
    if (defaultAddresses.length > 1) {
      // Keep only the last one as default
      this.addresses.forEach((addr, index) => {
        if (index < this.addresses.length - 1) {
          addr.isDefault = false;
        }
      });
    } else if (defaultAddresses.length === 0 && this.addresses.length > 0) {
      // If no default, make first one default
      this.addresses[0].isDefault = true;
    }
  }
  next();
});

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Compare entered password with hashed password
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

/**
 * Check if password was changed after JWT was issued
 * @param {number} JWTTimestamp - JWT issued timestamp
 * @returns {boolean}
 */
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

/**
 * Increment login attempts and lock account if necessary
 * @returns {Promise}
 */
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
  const lockTime = parseInt(process.env.LOCK_TIME) || 2 * 60 * 60 * 1000; // 2 hours
  
  // Lock account after max attempts
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

/**
 * Reset login attempts after successful login
 * @returns {Promise}
 */
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

/**
 * Update last login timestamp and IP
 * @param {string} ipAddress - User's IP address
 * @returns {Promise}
 */
userSchema.methods.updateLastLogin = function(ipAddress) {
  return this.updateOne({ 
    $set: { 
      lastLogin: new Date(),
      lastLoginIP: ipAddress 
    } 
  });
};

/**
 * Update customer statistics after order
 * @param {number} orderAmount - Order total amount
 * @returns {Promise}
 */
userSchema.methods.updateCustomerStats = async function(orderAmount) {
  this.totalOrders += 1;
  this.totalSpent += orderAmount;
  
  // Update customer type based on spending and order count
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

/**
 * Generate email verification token
 * @returns {string} - Plain text token (to send in email)
 */
userSchema.methods.generateEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  // Token expires in 24 hours
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  
  return verificationToken;
};

/**
 * Generate password reset token
 * @returns {string} - Plain text token (to send in email)
 */
userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Token expires in 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

/**
 * Add address to user
 * @param {object} addressData - Address data
 * @returns {Promise}
 */
userSchema.methods.addAddress = async function(addressData) {
  // If this is set as default, unset all other defaults
  if (addressData.isDefault) {
    this.addresses.forEach(addr => {
      addr.isDefault = false;
    });
  }
  
  this.addresses.push(addressData);
  await this.save();
  return this.addresses[this.addresses.length - 1];
};

/**
 * Update existing address
 * @param {string} addressId - Address ID to update
 * @param {object} updateData - New address data
 * @returns {Promise}
 */
userSchema.methods.updateAddress = async function(addressId, updateData) {
  const address = this.addresses.id(addressId);
  
  if (!address) {
    throw new Error('Address not found');
  }
  
  // If setting as default, unset all others
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

/**
 * Delete address
 * @param {string} addressId - Address ID to delete
 * @returns {Promise}
 */
userSchema.methods.deleteAddress = async function(addressId) {
  const address = this.addresses.id(addressId);
  
  if (!address) {
    throw new Error('Address not found');
  }
  
  const wasDefault = address.isDefault;
  address.remove();
  
  // If deleted address was default and there are other addresses, make first one default
  if (wasDefault && this.addresses.length > 0) {
    this.addresses[0].isDefault = true;
  }
  
  await this.save();
};

/**
 * Get default address
 * @returns {object|null}
 */
userSchema.methods.getDefaultAddress = function() {
  return this.addresses.find(addr => addr.isDefault) || this.addresses[0] || null;
};

// ============================================
// STATIC METHODS
// ============================================

/**
 * Find user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Find user by phone
 * @param {string} phone
 * @returns {Promise<User>}
 */
userSchema.statics.findByPhone = function(phone) {
  const cleaned = phone.replace(/[\s-]/g, '');
  return this.findOne({ phone: new RegExp(cleaned, 'i') });
};

/**
 * Find all active users
 * @returns {Promise<User[]>}
 */
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

/**
 * Find VIP customers
 * @returns {Promise<User[]>}
 */
userSchema.statics.findVIPCustomers = function() {
  return this.find({ customerType: 'vip', isActive: true });
};

/**
 * Get customer statistics
 * @returns {Promise<object>}
 */
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

/**
 * Search users (admin function)
 * @param {string} query - Search query
 * @param {object} filters - Additional filters
 * @returns {Promise<User[]>}
 */
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
// QUERY MIDDLEWARE
// ============================================

// Exclude deleted/inactive users by default in find queries
// userSchema.pre(/^find/, function(next) {
//   // Uncomment if you want soft deletes
//   // this.find({ isActive: { $ne: false } });
//   next();
// });

// ============================================
// METHODS FOR JSON RESPONSE
// ============================================

/**
 * Remove sensitive data from JSON response
 * @returns {object}
 */
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  
  // Remove sensitive fields
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

/**
 * Get public profile (for other users to see)
 * @returns {object}
 */
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

/**
 * Get safe profile (for user's own data)
 * @returns {object}
 */
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