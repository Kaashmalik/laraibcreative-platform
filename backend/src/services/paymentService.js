// backend/src/services/paymentService.js

const Order = require('../models/Order');
const logger = require('../utils/logger');

/**
 * Payment Service
 * Handles payment verification, processing, and validation
 */

/**
 * Validate payment receipt image
 * @param {String} receiptUrl - URL of the uploaded receipt
 * @returns {Object} Validation result
 */
exports.validatePaymentReceipt = (receiptUrl) => {
  try {
    if (!receiptUrl) {
      return {
        valid: false,
        message: 'Receipt image is required'
      };
    }

    // Check if URL is valid
    const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i;
    if (!urlPattern.test(receiptUrl)) {
      return {
        valid: false,
        message: 'Invalid receipt image format. Accepted formats: JPG, PNG, WEBP'
      };
    }

    return {
      valid: true,
      message: 'Receipt image is valid'
    };

  } catch (error) {
    logger.error('Error validating payment receipt:', error);
    return {
      valid: false,
      message: 'Failed to validate receipt'
    };
  }
};

/**
 * Validate payment method and details
 * @param {Object} payment - Payment object
 * @param {Number} orderTotal - Total order amount
 * @returns {Object} Validation result
 */
exports.validatePaymentDetails = (payment, orderTotal) => {
  try {
    const { method, receiptImage, transactionId, advanceAmount } = payment;

    // Validate payment method
    const validMethods = ['bank-transfer', 'jazzcash', 'easypaisa', 'cod'];
    if (!method || !validMethods.includes(method)) {
      return {
        valid: false,
        message: 'Invalid payment method. Accepted: bank-transfer, jazzcash, easypaisa, cod'
      };
    }

    // For COD, validate advance payment (50% required)
    if (method === 'cod') {
      const requiredAdvance = orderTotal * 0.5;

      if (!advanceAmount || advanceAmount < requiredAdvance) {
        return {
          valid: false,
          message: `COD requires 50% advance payment (PKR ${requiredAdvance.toFixed(2)}). Provided: PKR ${advanceAmount || 0}`
        };
      }

      if (!receiptImage) {
        return {
          valid: false,
          message: 'COD orders require advance payment receipt upload'
        };
      }
    }

    // For online payment methods, receipt is required
    if (['bank-transfer', 'jazzcash', 'easypaisa'].includes(method)) {
      if (!receiptImage) {
        return {
          valid: false,
          message: 'Payment receipt is required for verification'
        };
      }
    }

    return {
      valid: true,
      message: 'Payment details are valid'
    };

  } catch (error) {
    logger.error('Error validating payment details:', error);
    return {
      valid: false,
      message: 'Failed to validate payment details'
    };
  }
};

/**
 * Calculate advance payment for COD
 * @param {Number} totalAmount - Total order amount
 * @returns {Object} Advance and remaining amounts
 */
exports.calculateCODPayment = (totalAmount) => {
  try {
    const advancePercentage = 0.5; // 50%
    const advanceAmount = totalAmount * advancePercentage;
    const remainingAmount = totalAmount - advanceAmount;

    return {
      advanceAmount: parseFloat(advanceAmount.toFixed(2)),
      remainingAmount: parseFloat(remainingAmount.toFixed(2)),
      advancePercentage: advancePercentage * 100
    };

  } catch (error) {
    logger.error('Error calculating COD payment:', error);
    throw new Error('Failed to calculate COD payment');
  }
};

/**
 * Process payment verification by admin
 * @param {Object} order - Order object
 * @param {Boolean} approved - Whether payment is approved
 * @param {String} adminId - Admin user ID
 * @param {String} rejectionReason - Reason for rejection (if rejected)
 * @returns {Object} Updated order
 */
exports.processPaymentVerification = async (order, approved, adminId, rejectionReason = null) => {
  try {
    if (approved) {
      // Approve payment
      order.payment.status = 'verified';
      order.payment.verifiedBy = adminId;
      order.payment.verifiedAt = new Date();

      // Update order status
      order.status = 'payment-verified';
      order.statusHistory.push({
        status: 'payment-verified',
        timestamp: new Date(),
        note: 'Payment verified and approved by admin',
        updatedBy: adminId
      });

      logger.info(`Payment approved for order ${order.orderNumber}`, {
        orderId: order._id,
        approvedBy: adminId,
        amount: order.pricing.total
      });

    } else {
      // Reject payment
      order.payment.status = 'failed';
      order.status = 'payment-failed';
      order.statusHistory.push({
        status: 'payment-failed',
        timestamp: new Date(),
        note: rejectionReason || 'Payment verification failed',
        updatedBy: adminId
      });

      if (rejectionReason) {
        order.notes.push({
          text: `Payment Rejected: ${rejectionReason}`,
          addedBy: adminId,
          timestamp: new Date()
        });
      }

      logger.warn(`Payment rejected for order ${order.orderNumber}`, {
        orderId: order._id,
        rejectedBy: adminId,
        reason: rejectionReason
      });
    }

    await order.save();
    return order;

  } catch (error) {
    logger.error('Error processing payment verification:', error);
    throw new Error('Failed to process payment verification');
  }
};

/**
 * Get payment method display name
 * @param {String} method - Payment method code
 * @returns {String} Display name
 */
exports.getPaymentMethodDisplayName = (method) => {
  const displayNames = {
    'bank-transfer': 'Bank Transfer',
    'jazzcash': 'JazzCash',
    'easypaisa': 'Easypaisa',
    'cod': 'Cash on Delivery (COD)'
  };

  return displayNames[method] || method;
};

/**
 * Get payment instructions for a method
 * @param {String} method - Payment method
 * @returns {Object} Payment instructions
 */
exports.getPaymentInstructions = (method) => {
  const instructions = {
    'bank-transfer': {
      title: 'Bank Transfer',
      steps: [
        'Transfer amount to our bank account',
        'Account Title: LaraibCreative',
        'Account Number: XXXX-XXXX-XXXX-XXXX',
        'Bank: Allied Bank Limited',
        'Branch: Main Branch, Lahore',
        'Upload the transaction receipt',
        'Enter transaction ID/reference number'
      ],
      note: 'Order will be processed after payment verification (within 24 hours)'
    },
    'jazzcash': {
      title: 'JazzCash Payment',
      steps: [
        'Open JazzCash mobile app',
        'Go to "Send Money"',
        'Enter Account: 03XX-XXXXXXX',
        'Enter amount',
        'Complete transaction',
        'Upload transaction screenshot',
        'Enter transaction ID'
      ],
      note: 'Payment verification takes 2-4 hours'
    },
    'easypaisa': {
      title: 'Easypaisa Payment',
      steps: [
        'Open Easypaisa app or visit retailer',
        'Select "Send Money"',
        'Mobile Account: 03XX-XXXXXXX',
        'Enter amount',
        'Complete payment',
        'Upload receipt/screenshot',
        'Provide transaction reference'
      ],
      note: 'Verification within 2-4 hours'
    },
    'cod': {
      title: 'Cash on Delivery (50% Advance Required)',
      steps: [
        'Pay 50% of total amount in advance',
        'Use Bank Transfer, JazzCash, or Easypaisa',
        'Upload payment receipt',
        'Remaining 50% payable on delivery',
        'Order will ship after advance verification'
      ],
      note: 'Advance payment is mandatory for COD orders'
    }
  };

  return instructions[method] || {
    title: 'Payment Instructions',
    steps: ['Contact support for payment details'],
    note: 'Please reach out to our support team'
  };
};

/**
 * Check if payment is pending verification
 * @param {Object} order - Order object
 * @returns {Boolean}
 */
exports.isPaymentPending = (order) => {
  return order.payment.status === 'pending' && order.status === 'pending-payment';
};

/**
 * Check if payment is verified
 * @param {Object} order - Order object
 * @returns {Boolean}
 */
exports.isPaymentVerified = (order) => {
  return order.payment.status === 'verified';
};

/**
 * Check if payment has failed
 * @param {Object} order - Order object
 * @returns {Boolean}
 */
exports.isPaymentFailed = (order) => {
  return order.payment.status === 'failed';
};

/**
 * Get payment summary for order
 * @param {Object} order - Order object
 * @returns {Object} Payment summary
 */
exports.getPaymentSummary = (order) => {
  try {
    const summary = {
      method: order.payment.method,
      methodDisplayName: exports.getPaymentMethodDisplayName(order.payment.method),
      status: order.payment.status,
      statusDisplayName: getPaymentStatusDisplayName(order.payment.status),
      totalAmount: order.pricing.total,
      transactionId: order.payment.transactionId || null,
      transactionDate: order.payment.transactionDate || null,
      receiptUrl: order.payment.receiptImage || null,
      verifiedAt: order.payment.verifiedAt || null,
      verifiedBy: order.payment.verifiedBy || null
    };

    // Add COD-specific details
    if (order.payment.method === 'cod') {
      summary.advanceAmount = order.payment.advanceAmount;
      summary.remainingAmount = order.payment.remainingAmount;
      summary.advancePaid = true;
    }

    return summary;

  } catch (error) {
    logger.error('Error getting payment summary:', error);
    throw new Error('Failed to get payment summary');
  }
};

/**
 * Get payment status display name
 * @param {String} status - Payment status code
 * @returns {String} Display name
 */
function getPaymentStatusDisplayName(status) {
  const displayNames = {
    'pending': 'Pending Verification',
    'verified': 'Verified',
    'failed': 'Failed/Rejected',
    'refunded': 'Refunded'
  };

  return displayNames[status] || status;
}

/**
 * Generate payment verification checklist for admin
 * @param {Object} order - Order object
 * @returns {Array} Checklist items
 */
exports.getVerificationChecklist = (order) => {
  const checklist = [
    {
      item: 'Receipt image is clear and readable',
      checked: false
    },
    {
      item: 'Transaction ID/Reference matches receipt',
      checked: false
    },
    {
      item: 'Amount matches order total',
      checked: false
    },
    {
      item: 'Payment date is recent (within 7 days)',
      checked: false
    },
    {
      item: 'Account details match our records',
      checked: false
    }
  ];

  // Add COD-specific checklist items
  if (order.payment.method === 'cod') {
    checklist.push({
      item: 'Advance amount is exactly 50% of order total',
      checked: false
    });
    checklist.push({
      item: 'Customer acknowledges remaining balance on delivery',
      checked: false
    });
  }

  return checklist;
};

/**
 * Calculate refund amount
 * @param {Object} order - Order object
 * @param {String} refundType - Type of refund (full, partial)
 * @returns {Object} Refund details
 */
exports.calculateRefund = (order, refundType = 'full') => {
  try {
    let refundAmount = 0;
    const orderTotal = order.pricing.total;

    if (refundType === 'full') {
      // Full refund
      refundAmount = orderTotal;
    } else if (refundType === 'partial') {
      // Partial refund (deduct processing/shipping charges)
      const deductions = order.pricing.shippingCharges || 0;
      refundAmount = orderTotal - deductions;
    }

    return {
      refundType,
      orderTotal,
      refundAmount: parseFloat(refundAmount.toFixed(2)),
      processingFee: parseFloat((orderTotal - refundAmount).toFixed(2))
    };

  } catch (error) {
    logger.error('Error calculating refund:', error);
    throw new Error('Failed to calculate refund');
  }
};

/**
 * Get payment statistics for dashboard
 * @param {Date} startDate - Start date for stats
 * @param {Date} endDate - End date for stats
 * @returns {Object} Payment statistics
 */
exports.getPaymentStats = async (startDate, endDate) => {
  try {
    const stats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ['$payment.status', 'pending'] }, 1, 0] }
          },
          verifiedPayments: {
            $sum: { $cond: [{ $eq: ['$payment.status', 'verified'] }, 1, 0] }
          },
          failedPayments: {
            $sum: { $cond: [{ $eq: ['$payment.status', 'failed'] }, 1, 0] }
          },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$payment.status', 'verified'] }, '$pricing.total', 0] }
          },
          // Payment method breakdown
          bankTransferCount: {
            $sum: { $cond: [{ $eq: ['$payment.method', 'bank-transfer'] }, 1, 0] }
          },
          jazzcashCount: {
            $sum: { $cond: [{ $eq: ['$payment.method', 'jazzcash'] }, 1, 0] }
          },
          easypaisaCount: {
            $sum: { $cond: [{ $eq: ['$payment.method', 'easypaisa'] }, 1, 0] }
          },
          codCount: {
            $sum: { $cond: [{ $eq: ['$payment.method', 'cod'] }, 1, 0] }
          }
        }
      }
    ]);

    return stats[0] || {
      totalOrders: 0,
      pendingPayments: 0,
      verifiedPayments: 0,
      failedPayments: 0,
      totalRevenue: 0,
      bankTransferCount: 0,
      jazzcashCount: 0,
      easypaisaCount: 0,
      codCount: 0
    };

  } catch (error) {
    logger.error('Error getting payment stats:', error);
    throw new Error('Failed to fetch payment statistics');
  }
};

/**
 * Validate transaction ID format
 * @param {String} transactionId - Transaction ID
 * @param {String} method - Payment method
 * @returns {Object} Validation result
 */
exports.validateTransactionId = (transactionId, method) => {
  try {
    if (!transactionId || transactionId.trim().length === 0) {
      return {
        valid: false,
        message: 'Transaction ID is required'
      };
    }

    // Basic validation - can be extended with specific format checks per method
    if (transactionId.length < 5) {
      return {
        valid: false,
        message: 'Transaction ID seems too short'
      };
    }

    // Method-specific validation can be added here
    // For example: JazzCash has specific format, bank transfers have specific length, etc.

    return {
      valid: true,
      message: 'Transaction ID format is valid'
    };

  } catch (error) {
    logger.error('Error validating transaction ID:', error);
    return {
      valid: false,
      message: 'Failed to validate transaction ID'
    };
  }
};

/**
 * Check if order can be refunded
 * @param {Object} order - Order object
 * @returns {Object} Refund eligibility
 */
exports.canRefund = (order) => {
  try {
    // Cannot refund if payment not verified
    if (order.payment.status !== 'verified') {
      return {
        eligible: false,
        reason: 'Payment not verified yet'
      };
    }

    // Cannot refund if already refunded
    if (order.payment.status === 'refunded') {
      return {
        eligible: false,
        reason: 'Payment already refunded'
      };
    }

    // Cannot refund if order is delivered
    if (order.status === 'delivered') {
      return {
        eligible: false,
        reason: 'Order already delivered. Contact support for returns.'
      };
    }

    // Cannot refund if stitching started (for custom orders)
    const nonRefundableStatuses = ['stitching-in-progress', 'quality-check', 'ready-for-dispatch'];
    const hasCustomItems = order.items.some(item => item.isCustom);

    if (hasCustomItems && nonRefundableStatuses.includes(order.status)) {
      return {
        eligible: false,
        reason: 'Custom order stitching has started. Refund not possible.'
      };
    }

    return {
      eligible: true,
      reason: 'Order is eligible for refund'
    };

  } catch (error) {
    logger.error('Error checking refund eligibility:', error);
    return {
      eligible: false,
      reason: 'Failed to check refund eligibility'
    };
  }
};

module.exports = exports;