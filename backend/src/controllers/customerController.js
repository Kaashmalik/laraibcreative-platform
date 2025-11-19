const User = require('../models/User');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Measurement = require('../models/Measurement');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');

/**
 * Customer Controller for LaraibCreative E-Commerce Platform
 * 
 * Handles customer-specific operations including:
 * - Profile management
 * - Order history
 * - Measurements
 * - Wishlist
 * - Reviews
 * - Addresses
 * 
 * @module customerController
 */

// ============================================================
// PROFILE MANAGEMENT
// ============================================================

/**
 * @desc    Get customer profile
 * @route   GET /api/customers/profile
 * @access  Private (Customer)
 */
exports.getProfile = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.user._id)
    .select('-password -__v')
    .lean();

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  // Get additional stats
  const [orderCount, reviewCount, measurementCount] = await Promise.all([
    Order.countDocuments({ customer: customer._id }),
    Review.countDocuments({ customer: customer._id, status: 'approved' }),
    Measurement.countDocuments({ customer: customer._id })
  ]);

  res.status(200).json({
    success: true,
    data: {
      ...customer,
      stats: {
        totalOrders: orderCount,
        totalReviews: reviewCount,
        savedMeasurements: measurementCount
      }
    }
  });
});

/**
 * @desc    Update customer profile
 * @route   PUT /api/customers/profile
 * @access  Private (Customer)
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const {
    fullName,
    email,
    phone,
    dateOfBirth,
    gender,
    preferredLanguage,
    communicationPreferences
  } = req.body;

  const customer = await User.findById(req.user._id);

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  // Check if email is being changed and if it's already in use
  if (email && email !== customer.email) {
    const emailExists = await User.findOne({ email, _id: { $ne: customer._id } });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already in use');
    }
    customer.email = email;
  }

  // Update fields
  if (fullName) customer.fullName = fullName;
  if (phone) customer.phone = phone;
  if (dateOfBirth) customer.dateOfBirth = dateOfBirth;
  if (gender) customer.gender = gender;
  if (preferredLanguage) customer.preferredLanguage = preferredLanguage;
  if (communicationPreferences) {
    customer.communicationPreferences = {
      ...customer.communicationPreferences,
      ...communicationPreferences
    };
  }

  await customer.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      _id: customer._id,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      dateOfBirth: customer.dateOfBirth,
      gender: customer.gender,
      preferredLanguage: customer.preferredLanguage,
      communicationPreferences: customer.communicationPreferences
    }
  });
});

/**
 * @desc    Update customer profile image
 * @route   PUT /api/customers/profile/image
 * @access  Private (Customer)
 */
exports.updateProfileImage = asyncHandler(async (req, res) => {
  const { profileImage } = req.body;

  if (!profileImage) {
    res.status(400);
    throw new Error('Profile image URL is required');
  }

  const customer = await User.findByIdAndUpdate(
    req.user._id,
    { profileImage },
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({
    success: true,
    message: 'Profile image updated successfully',
    data: {
      profileImage: customer.profileImage
    }
  });
});

// ============================================================
// ADDRESS MANAGEMENT
// ============================================================

/**
 * @desc    Get all customer addresses
 * @route   GET /api/customers/addresses
 * @access  Private (Customer)
 */
exports.getAddresses = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.user._id).select('addresses');

  res.status(200).json({
    success: true,
    count: customer.addresses.length,
    data: customer.addresses
  });
});

/**
 * @desc    Add new address
 * @route   POST /api/customers/addresses
 * @access  Private (Customer)
 */
exports.addAddress = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const customer = await User.findById(req.user._id);

  // If this is the first address or marked as default, set as default
  if (customer.addresses.length === 0 || req.body.isDefault) {
    customer.addresses.forEach(addr => addr.isDefault = false);
    req.body.isDefault = true;
  }

  customer.addresses.push(req.body);
  await customer.save();

  res.status(201).json({
    success: true,
    message: 'Address added successfully',
    data: customer.addresses[customer.addresses.length - 1]
  });
});

/**
 * @desc    Update address
 * @route   PUT /api/customers/addresses/:addressId
 * @access  Private (Customer)
 */
exports.updateAddress = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.user._id);
  const address = customer.addresses.id(req.params.addressId);

  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }

  // If setting as default, unset others
  if (req.body.isDefault) {
    customer.addresses.forEach(addr => addr.isDefault = false);
  }

  // Update address fields
  Object.keys(req.body).forEach(key => {
    address[key] = req.body[key];
  });

  await customer.save();

  res.status(200).json({
    success: true,
    message: 'Address updated successfully',
    data: address
  });
});

/**
 * @desc    Delete address
 * @route   DELETE /api/customers/addresses/:addressId
 * @access  Private (Customer)
 */
exports.deleteAddress = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.user._id);
  const address = customer.addresses.id(req.params.addressId);

  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }

  const wasDefault = address.isDefault;
  address.remove();

  // If deleted address was default, set first remaining address as default
  if (wasDefault && customer.addresses.length > 0) {
    customer.addresses[0].isDefault = true;
  }

  await customer.save();

  res.status(200).json({
    success: true,
    message: 'Address deleted successfully'
  });
});

/**
 * @desc    Set default address
 * @route   PUT /api/customers/addresses/:addressId/default
 * @access  Private (Customer)
 */
exports.setDefaultAddress = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.user._id);
  const address = customer.addresses.id(req.params.addressId);

  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }

  customer.addresses.forEach(addr => addr.isDefault = false);
  address.isDefault = true;

  await customer.save();

  res.status(200).json({
    success: true,
    message: 'Default address updated successfully',
    data: address
  });
});

// ============================================================
// ORDER MANAGEMENT
// ============================================================

/**
 * @desc    Get customer order history
 * @route   GET /api/customers/orders
 * @access  Private (Customer)
 */
exports.getOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;
  const skip = (page - 1) * limit;

  const query = { customer: req.user._id };
  if (status) query.status = status;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.product', 'title images.thumbnail sku')
      .lean(),
    Order.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: orders.length,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
      total,
      limit
    },
    data: orders
  });
});

/**
 * @desc    Get single order details
 * @route   GET /api/customers/orders/:orderId
 * @access  Private (Customer)
 */
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.orderId,
    customer: req.user._id
  })
    .populate('items.product', 'title images sku')
    .populate('customer', 'fullName email phone')
    .lean();

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

/**
 * @desc    Cancel order
 * @route   PUT /api/customers/orders/:orderId/cancel
 * @access  Private (Customer)
 */
exports.cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const order = await Order.findOne({
    _id: req.params.orderId,
    customer: req.user._id
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Only allow cancellation for certain statuses
  const cancellableStatuses = ['pending', 'payment-pending', 'confirmed'];
  if (!cancellableStatuses.includes(order.status)) {
    res.status(400);
    throw new Error(`Cannot cancel order with status: ${order.status}`);
  }

  order.status = 'cancelled';
  order.cancellationReason = reason || 'Cancelled by customer';
  order.cancelledAt = new Date();
  order.timeline.push({
    status: 'cancelled',
    note: reason || 'Cancelled by customer',
    timestamp: new Date()
  });

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: order
  });
});

// ============================================================
// WISHLIST MANAGEMENT
// ============================================================

/**
 * @desc    Get customer wishlist
 * @route   GET /api/customers/wishlist
 * @access  Private (Customer)
 */
exports.getWishlist = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.user._id)
    .select('wishlist')
    .populate({
      path: 'wishlist',
      select: 'title images pricing stock status',
      match: { status: 'active' }
    })
    .lean();

  res.status(200).json({
    success: true,
    count: customer.wishlist.length,
    data: customer.wishlist
  });
});

/**
 * @desc    Add product to wishlist
 * @route   POST /api/customers/wishlist/:productId
 * @access  Private (Customer)
 */
exports.addToWishlist = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.user._id);
  
  const productExists = customer.wishlist.includes(req.params.productId);
  if (productExists) {
    res.status(400);
    throw new Error('Product already in wishlist');
  }

  customer.wishlist.push(req.params.productId);
  await customer.save();

  res.status(200).json({
    success: true,
    message: 'Product added to wishlist',
    data: { wishlist: customer.wishlist }
  });
});

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/customers/wishlist/:productId
 * @access  Private (Customer)
 */
exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.user._id);
  
  customer.wishlist = customer.wishlist.filter(
    id => id.toString() !== req.params.productId
  );
  
  await customer.save();

  res.status(200).json({
    success: true,
    message: 'Product removed from wishlist',
    data: { wishlist: customer.wishlist }
  });
});

/**
 * @desc    Clear entire wishlist
 * @route   DELETE /api/customers/wishlist
 * @access  Private (Customer)
 */
exports.clearWishlist = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { wishlist: [] });

  res.status(200).json({
    success: true,
    message: 'Wishlist cleared successfully'
  });
});

// ============================================================
// MEASUREMENTS
// ============================================================

/**
 * @desc    Get customer measurements
 * @route   GET /api/customers/measurements
 * @access  Private (Customer)
 */
exports.getMeasurements = asyncHandler(async (req, res) => {
  const measurements = await Measurement.find({ customer: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    count: measurements.length,
    data: measurements
  });
});

/**
 * @desc    Get single measurement
 * @route   GET /api/customers/measurements/:measurementId
 * @access  Private (Customer)
 */
exports.getMeasurement = asyncHandler(async (req, res) => {
  const measurement = await Measurement.findOne({
    _id: req.params.measurementId,
    customer: req.user._id
  }).lean();

  if (!measurement) {
    res.status(404);
    throw new Error('Measurement not found');
  }

  res.status(200).json({
    success: true,
    data: measurement
  });
});

// ============================================================
// REVIEWS
// ============================================================

/**
 * @desc    Get customer reviews
 * @route   GET /api/customers/reviews
 * @access  Private (Customer)
 */
exports.getReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('product', 'title images.thumbnail sku')
      .lean(),
    Review.countDocuments({ customer: req.user._id })
  ]);

  res.status(200).json({
    success: true,
    count: reviews.length,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
      total,
      limit
    },
    data: reviews
  });
});

// ============================================================
// DASHBOARD & STATS
// ============================================================

/**
 * @desc    Get customer dashboard data
 * @route   GET /api/customers/dashboard
 * @access  Private (Customer)
 */
exports.getDashboard = asyncHandler(async (req, res) => {
  const customerId = req.user._id;

  // Get various stats in parallel
  const [
    totalOrders,
    pendingOrders,
    completedOrders,
    totalSpent,
    recentOrders,
    reviewCount,
    wishlistCount
  ] = await Promise.all([
    Order.countDocuments({ customer: customerId }),
    Order.countDocuments({ customer: customerId, status: { $in: ['pending', 'processing'] } }),
    Order.countDocuments({ customer: customerId, status: 'completed' }),
    Order.aggregate([
      { $match: { customer: customerId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Order.find({ customer: customerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('items.product', 'title images.thumbnail')
      .lean(),
    Review.countDocuments({ customer: customerId }),
    User.findById(customerId).select('wishlist').lean()
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalSpent: totalSpent[0]?.total || 0,
        reviewCount,
        wishlistCount: wishlistCount.wishlist.length
      },
      recentOrders
    }
  });
});

/**
 * @desc    Get customer activity log
 * @route   GET /api/customers/activity
 * @access  Private (Customer)
 */
exports.getActivity = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;

  // Get recent activities from different sources
  const [orders, reviews] = await Promise.all([
    Order.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit / 2)
      .select('orderNumber status createdAt totalAmount')
      .lean(),
    Review.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit / 2)
      .select('product rating createdAt')
      .populate('product', 'title')
      .lean()
  ]);

  // Combine and format activities
  const activities = [
    ...orders.map(order => ({
      type: 'order',
      action: `Order ${order.orderNumber} ${order.status}`,
      timestamp: order.createdAt,
      data: order
    })),
    ...reviews.map(review => ({
      type: 'review',
      action: `Reviewed ${review.product.title}`,
      timestamp: review.createdAt,
      data: review
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
   .slice(0, limit);

  res.status(200).json({
    success: true,
    count: activities.length,
    data: activities
  });
});

module.exports = exports;