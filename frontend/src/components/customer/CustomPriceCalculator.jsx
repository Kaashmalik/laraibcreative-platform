'use client';


import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Plus, Minus } from 'lucide-react';

/**
 * Custom Price Calculator Component
 * Real-time price calculation for custom orders
 */
export default function CustomPriceCalculator({ 
  basePrice = 0,
  product,
  onPriceChange 
}) {
  const [customizations, setCustomizations] = useState({
    fabricUpgrade: false,
    sizeAdjustment: false,
    rushOrder: false,
    additionalAccessories: false,
  });

  const [quantities, setQuantities] = useState({
    accessories: 0,
  });

  // Pricing configuration
  const pricingConfig = {
    fabricUpgrade: {
      label: 'Premium Fabric Upgrade',
      cost: 2000,
      description: 'Upgrade to premium quality fabric',
    },
    sizeAdjustment: {
      label: 'Custom Size Adjustment',
      cost: 1500,
      description: 'Perfect fit guarantee with custom measurements',
    },
    rushOrder: {
      label: 'Rush Order (7 days)',
      cost: 3000,
      description: 'Express delivery in 7 days',
    },
    additionalAccessories: {
      label: 'Additional Accessories',
      cost: 500,
      description: 'Extra dupatta, matching bag, etc.',
    },
  };

  const calculateTotal = () => {
    let total = basePrice;

    // Add customization costs
    Object.keys(customizations).forEach((key) => {
      if (customizations[key]) {
        if (key === 'additionalAccessories') {
          total += pricingConfig[key].cost * quantities.accessories;
        } else {
          total += pricingConfig[key].cost;
        }
      }
    });

    return total;
  };

  const handleCustomizationChange = (key, value) => {
    setCustomizations((prev) => ({ ...prev, [key]: value }));
  };

  const handleQuantityChange = (key, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta),
    }));
  };

  const totalPrice = calculateTotal();
  const additionalCost = totalPrice - basePrice;

  useEffect(() => {
    if (onPriceChange) {
      onPriceChange({
        basePrice,
        additionalCost,
        totalPrice,
        customizations,
        quantities,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePrice, additionalCost, totalPrice, customizations, quantities]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-6 border border-pink-200"
    >
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-pink-600" />
        <h3 className="text-lg font-semibold text-gray-900">Custom Price Calculator</h3>
      </div>

      {/* Base Price */}
      <div className="mb-4 pb-4 border-b border-pink-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Base Price:</span>
          <span className="text-base font-medium">Rs. {basePrice.toLocaleString()}</span>
        </div>
      </div>

      {/* Customization Options */}
      <div className="space-y-3 mb-4">
        {Object.keys(customizations).map((key) => {
          const config = pricingConfig[key];
          const isChecked = customizations[key];
          
          return (
            <label
              key={key}
              className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-pink-300 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => handleCustomizationChange(key, e.target.checked)}
                className="mt-1 w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{config.label}</span>
                  {key !== 'additionalAccessories' && (
                    <span className="text-sm font-medium text-pink-600">
                      +Rs. {config.cost.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{config.description}</p>
                {key === 'additionalAccessories' && isChecked && (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuantityChange('accessories', -1);
                      }}
                      className="p-1 rounded border border-gray-300 hover:bg-gray-50"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-medium w-8 text-center">
                      {quantities.accessories}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuantityChange('accessories', 1);
                      }}
                      className="p-1 rounded border border-gray-300 hover:bg-gray-50"
                    >
                      <Plus size={14} />
                    </button>
                    <span className="text-sm text-gray-600 ml-2">
                      × Rs. {config.cost.toLocaleString()} = Rs.{' '}
                      {(config.cost * quantities.accessories).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* Total Price */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-lg p-4 border-2 border-pink-300"
      >
        <div className="space-y-2">
          {additionalCost > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Additional Costs:</span>
              <span className="font-medium text-pink-600">
                +Rs. {additionalCost.toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-lg font-semibold text-gray-900">Total Price:</span>
            <span className="text-2xl font-bold text-pink-600">
              Rs. {totalPrice.toLocaleString()}
            </span>
          </div>
        </div>
      </motion.div>

      <p className="text-xs text-gray-500 mt-3 text-center">
        * Final price may vary based on specific requirements
      </p>
    </motion.div>
  );
}

