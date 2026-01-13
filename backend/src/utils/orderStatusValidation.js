/**
 * Order Status Validation Utility
 * Validates order status transitions and business rules
 */

/**
 * Valid order status transitions
 * Maps current status to allowed next statuses
 */
const validTransitions = {
  'pending-payment': ['payment-verified', 'cancelled'],
  'payment-verified': ['material-arranged', 'cancelled', 'refunded'],
  'material-arranged': ['stitching-in-progress', 'cancelled', 'refunded'],
  'stitching-in-progress': ['quality-check', 'cancelled', 'refunded'],
  'quality-check': ['ready-for-dispatch', 'stitching-in-progress', 'cancelled', 'refunded'],
  'ready-for-dispatch': ['out-for-delivery', 'quality-check', 'cancelled', 'refunded'],
  'out-for-delivery': ['delivered', 'ready-for-dispatch'],
  'delivered': ['refunded'],
  'cancelled': [],
  'refunded': []
};

/**
 * Check if a status transition is valid
 * @param {String} currentStatus - Current order status
 * @param {String} newStatus - Desired new status
 * @returns {Object} Validation result
 */
const isValidTransition = (currentStatus, newStatus) => {
  const allowed = validTransitions[currentStatus] || [];
  return {
    valid: allowed.includes(newStatus),
    allowedTransitions: allowed
  };
};

/**
 * Validate order status update based on business rules
 * @param {Object} order - Order document
 * @param {String} newStatus - Desired new status
 * @returns {Object} Validation result with error if invalid
 */
const validateStatusUpdate = (order, newStatus) => {
  // Check if status is valid
  const validStatuses = Object.keys(validTransitions);
  if (!validStatuses.includes(newStatus)) {
    return {
      valid: false,
      error: `Invalid status: ${newStatus}`,
      validStatuses
    };
  }

  // Check if transition is allowed
  const transitionCheck = isValidTransition(order.status, newStatus);
  if (!transitionCheck.valid) {
    return {
      valid: false,
      error: `Cannot change status from '${order.status}' to '${newStatus}'`,
      allowedTransitions: transitionCheck.allowedTransitions
    };
  }

  // Check payment verification for non-terminal statuses
  const terminalStatuses = ['cancelled', 'refunded'];
  if (order.payment.status !== 'verified' && !terminalStatuses.includes(newStatus)) {
    return {
      valid: false,
      error: 'Cannot update status until payment is verified'
    };
  }

  // Additional business rules
  if (newStatus === 'delivered' && order.payment.status !== 'verified') {
    return {
      valid: false,
      error: 'Cannot mark order as delivered without verified payment'
    };
  }

  if (newStatus === 'refunded' && order.status !== 'delivered') {
    // Allow refunds for cancelled orders too
    if (order.status !== 'cancelled') {
      return {
        valid: false,
        error: 'Can only refund delivered or cancelled orders'
      };
    }
  }

  return {
    valid: true
  };
};

/**
 * Get next possible statuses for a given current status
 * @param {String} currentStatus - Current order status
 * @returns {Array} Array of possible next statuses
 */
const getNextStatuses = (currentStatus) => {
  return validTransitions[currentStatus] || [];
};

/**
 * Check if status is a terminal status (no further transitions)
 * @param {String} status - Order status
 * @returns {Boolean} True if terminal
 */
const isTerminalStatus = (status) => {
  const terminalStatuses = ['delivered', 'cancelled', 'refunded'];
  return terminalStatuses.includes(status);
};

module.exports = {
  validTransitions,
  isValidTransition,
  validateStatusUpdate,
  getNextStatuses,
  isTerminalStatus
};
