/**
 * Real-time Price Calculator Service
 * Calculates custom order prices based on selections
 */

const Settings = require('../models/Settings');
const Product = require('../models/Product');

/**
 * Calculate custom order price breakdown
 * @param {Object} orderData - Custom order data
 * @returns {Object} Price breakdown
 */
exports.calculateCustomOrderPrice = async (orderData) => {
  try {
    // Get pricing rules from settings
    const settings = await Settings.findOne();
    const pricingRules = settings?.customOrder?.pricing || getDefaultPricingRules();

    const {
      serviceType,
      fabric,
      embroidery,
      addOns = [],
      rushOrder = false,
      measurements
    } = orderData;

    // Base price based on service type
    let basePrice = 0;
    if (serviceType === 'fully-custom') {
      basePrice = pricingRules.basePrice?.fullyCustom || 2000;
    } else if (serviceType === 'brand-article-copy') {
      basePrice = pricingRules.basePrice?.brandArticle || 2500;
    }

    // Fabric cost
    let fabricCost = 0;
    if (fabric?.providedBy === 'laraibcreative') {
      // Get fabric cost from pricing rules or product
      if (fabric?.fabricId) {
        const fabricProduct = await Product.findById(fabric.fabricId);
        if (fabricProduct) {
          fabricCost = fabricProduct.pricing?.fabricProvidedByLC || 0;
        }
      } else {
        // Use fabric type pricing
        const fabricType = fabric?.type || 'standard';
        fabricCost = pricingRules.fabric?.[fabricType] || pricingRules.fabric?.standard || 1500;
      }
      
      // Add meters multiplier if provided
      if (fabric?.metersRequired) {
        fabricCost = fabricCost * fabric.metersRequired;
      }
    }

    // Embroidery cost
    let embroideryCost = 0;
    if (embroidery?.type && embroidery.type !== 'none') {
      const embroideryType = embroidery.type;
      const complexity = embroidery.complexity || 'simple';
      
      const baseEmbroideryCost = pricingRules.embroidery?.[embroideryType]?.[complexity] || 0;
      const coverageMultiplier = getCoverageMultiplier(embroidery.coverage || 'minimal');
      
      embroideryCost = baseEmbroideryCost * coverageMultiplier;
    }

    // Add-ons cost
    let addOnsCost = 0;
    if (addOns && addOns.length > 0) {
      addOnsCost = addOns.reduce((total, addOn) => {
        return total + (addOn.price || 0);
      }, 0);
    }

    // Rush order fee
    let rushOrderFee = 0;
    if (rushOrder) {
      rushOrderFee = pricingRules.rushOrderFee || 1000;
    }

    // Calculate subtotal
    const subtotal = basePrice + fabricCost + embroideryCost + addOnsCost + rushOrderFee;

    // Tax (if applicable)
    const taxRate = settings?.payment?.tax?.rate || 0;
    const tax = settings?.payment?.tax?.enabled 
      ? (subtotal * taxRate / 100)
      : 0;

    // Total
    const total = subtotal + tax;

    return {
      basePrice: parseFloat(basePrice.toFixed(2)),
      fabricCost: parseFloat(fabricCost.toFixed(2)),
      embroideryCost: parseFloat(embroideryCost.toFixed(2)),
      addOnsCost: parseFloat(addOnsCost.toFixed(2)),
      rushOrderFee: parseFloat(rushOrderFee.toFixed(2)),
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      currency: 'PKR'
    };
  } catch (error) {
    console.error('Error calculating custom order price:', error);
    throw new Error('Failed to calculate order price');
  }
};

/**
 * Get coverage multiplier for embroidery
 */
function getCoverageMultiplier(coverage) {
  const multipliers = {
    minimal: 0.5,
    partial: 1,
    full: 1.5,
    heavy: 2
  };
  return multipliers[coverage] || 1;
}

/**
 * Default pricing rules (fallback)
 */
function getDefaultPricingRules() {
  return {
    basePrice: {
      fullyCustom: 2000,
      brandArticle: 2500
    },
    fabric: {
      standard: 1500,
      premium: 2500,
      luxury: 4000
    },
    embroidery: {
      zardozi: {
        simple: 2000,
        moderate: 3500,
        intricate: 5000,
        heavy: 8000
      },
      aari: {
        simple: 1500,
        moderate: 2500,
        intricate: 4000,
        heavy: 6000
      },
      sequins: {
        simple: 1000,
        moderate: 2000,
        intricate: 3000,
        heavy: 5000
      },
      beads: {
        simple: 1200,
        moderate: 2200,
        intricate: 3500,
        heavy: 5500
      }
    },
    rushOrderFee: 1000
  };
}

