const LoyaltyAccount = require('../models/LoyaltyPoints');
const Order = require('../models/Order');
const { AppError } = require('../utils/AppError');
const logger = require('../utils/logger');

/**
 * Get user's loyalty account
 */
exports.getAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    const account = await LoyaltyAccount.findOne({ userId })
      .populate('transactions.orderId', 'orderNumber total');

    if (!account) {
      // Create account if doesn't exist
      const newAccount = await LoyaltyAccount.create({ userId });
      return res.status(200).json({
        success: true,
        data: { account: newAccount }
      });
    }

    res.status(200).json({
      success: true,
      data: { account }
    });
  } catch (error) {
    logger.error('Error fetching loyalty account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loyalty account'
    });
  }
};

/**
 * Get loyalty transactions
 */
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, type } = req.query;

    const account = await LoyaltyAccount.findOne({ userId });
    if (!account) {
      return res.status(200).json({
        success: true,
        data: { transactions: [], pagination: {} }
      });
    }

    let transactions = account.transactions || [];
    
    // Filter by type if provided
    if (type) {
      transactions = transactions.filter(t => t.type === type);
    }

    // Paginate
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedTransactions = transactions
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: transactions.length,
          pages: Math.ceil(transactions.length / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
};

/**
 * Redeem points
 */
exports.redeemPoints = async (req, res) => {
  try {
    const userId = req.user._id;
    const { points } = req.body;

    if (!points || points < 1) {
      return res.status(400).json({
        success: false,
        message: 'Points amount is required and must be at least 1'
      });
    }

    const account = await LoyaltyAccount.getOrCreate(userId);

    if (account.currentBalance < points) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient points balance'
      });
    }

    await account.redeemPoints(points);

    res.status(200).json({
      success: true,
      message: `${points} points redeemed successfully`,
      data: {
        account,
        redeemedPoints: points,
        redeemedValue: points * account.conversionRate
      }
    });
  } catch (error) {
    logger.error('Error redeeming points:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to redeem points'
    });
  }
};

/**
 * Award points (internal use - called after order completion)
 */
exports.awardPoints = async (req, res) => {
  try {
    const { userId, points, source, orderId } = req.body;

    if (!userId || !points || !source) {
      return res.status(400).json({
        success: false,
        message: 'userId, points, and source are required'
      });
    }

    const account = await LoyaltyAccount.getOrCreate(userId);
    await account.addPoints(points, source, orderId);

    res.status(200).json({
      success: true,
      message: `${points} points awarded`,
      data: { account }
    });
  } catch (error) {
    logger.error('Error awarding points:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to award points'
    });
  }
};

