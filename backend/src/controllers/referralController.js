const Referral = require('../models/Referral');
const User = require('../models/User');
const Order = require('../models/Order');
const LoyaltyAccount = require('../models/LoyaltyPoints');
const { AppError } = require('../utils/AppError');
const logger = require('../utils/logger');

/**
 * Generate referral code for user
 */
exports.generateCode = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user already has a pending referral code
    let referral = await Referral.findOne({
      referrerId: userId,
      status: 'pending'
    });

    if (!referral) {
      // Generate new code
      const code = Referral.generateCode(userId);
      referral = await Referral.create({
        referrerId: userId,
        referralCode: code,
        status: 'pending'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        referralCode: referral.referralCode,
        referral
      }
    });
  } catch (error) {
    logger.error('Error generating referral code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate referral code'
    });
  }
};

/**
 * Get user's referral stats
 */
exports.getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [referrals, totalEarned] = await Promise.all([
      Referral.find({ referrerId: userId })
        .populate('refereeId', 'fullName email')
        .populate('triggerOrderId', 'orderNumber total')
        .sort('-createdAt'),
      Referral.aggregate([
        { $match: { referrerId: userId } },
        {
          $group: {
            _id: null,
            total: { $sum: '$referrerReward.amount' }
          }
        }
      ])
    ]);

    const stats = {
      totalReferrals: referrals.length,
      completedReferrals: referrals.filter(r => r.status === 'completed').length,
      pendingReferrals: referrals.filter(r => r.status === 'pending').length,
      totalEarned: totalEarned[0]?.total || 0,
      referrals
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error fetching referral stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referral stats'
    });
  }
};

/**
 * Apply referral code (during registration or checkout)
 */
exports.applyCode = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user._id;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Referral code is required'
      });
    }

    // Find referral
    const referral = await Referral.findByCode(code);
    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Invalid referral code'
      });
    }

    // Check if user is trying to use their own code
    if (referral.referrerId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot use your own referral code'
      });
    }

    // Check if user already used this code
    const existingReferral = await Referral.findOne({
      refereeId: userId,
      referralCode: code
    });

    if (existingReferral) {
      return res.status(400).json({
        success: false,
        message: 'Referral code already used'
      });
    }

    // Update referral with referee
    referral.refereeId = userId;
    await referral.save();

    res.status(200).json({
      success: true,
      message: 'Referral code applied successfully',
      data: { referral }
    });
  } catch (error) {
    logger.error('Error applying referral code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply referral code'
    });
  }
};

/**
 * Complete referral (when referee places first order)
 */
exports.completeReferral = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Find referral for this order's customer
    const referral = await Referral.findOne({
      refereeId: order.customer || order.customerInfo?.userId,
      status: 'pending'
    });

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'No pending referral found'
      });
    }

    // Update referral
    referral.status = 'completed';
    referral.triggerOrderId = orderId;
    referral.completedAt = new Date();

    // Credit rewards (Rs.500 each)
    const rewardAmount = 500;
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 6); // 6 months expiry

    // Credit referrer
    referral.referrerReward.status = 'credited';
    referral.referrerReward.creditedAt = new Date();
    referral.referrerReward.expiresAt = expiryDate;

    // Credit referee
    referral.refereeReward.status = 'credited';
    referral.refereeReward.creditedAt = new Date();
    referral.refereeReward.expiresAt = expiryDate;

    await referral.save();

    // Add to loyalty accounts
    const [referrerAccount, refereeAccount] = await Promise.all([
      LoyaltyAccount.getOrCreate(referral.referrerId),
      LoyaltyAccount.getOrCreate(referral.refereeId)
    ]);

    await Promise.all([
      referrerAccount.addPoints(rewardAmount, 'referral', orderId),
      refereeAccount.addPoints(rewardAmount, 'referral', orderId)
    ]);

    res.status(200).json({
      success: true,
      message: 'Referral completed and rewards credited',
      data: { referral }
    });
  } catch (error) {
    logger.error('Error completing referral:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete referral'
    });
  }
};

