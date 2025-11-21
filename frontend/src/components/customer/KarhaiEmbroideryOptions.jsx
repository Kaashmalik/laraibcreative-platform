'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, DollarSign, Info } from 'lucide-react';

/**
 * Karhai Embroidery Options Component
 * Dropdown with previews for embroidery customization
 */
export default function KarhaiEmbroideryOptions({ 
  embroideryDetails, 
  onEmbroideryChange,
  basePrice = 0 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({
    type: embroideryDetails?.type || 'none',
    complexity: embroideryDetails?.complexity || 'simple',
    coverage: embroideryDetails?.coverage || 'minimal',
  });

  const embroideryTypes = [
    { value: 'none', label: 'No Embroidery', icon: '—', price: 0 },
    { value: 'zardozi', label: 'Zardozi Work', icon: '✨', price: 5000, description: 'Gold thread embroidery' },
    { value: 'aari', label: 'Aari Work', icon: '🧵', price: 3000, description: 'Traditional aari stitching' },
    { value: 'sequins', label: 'Sequins', icon: '💎', price: 2000, description: 'Sequins embellishment' },
    { value: 'beads', label: 'Beads', icon: '🔮', price: 2500, description: 'Bead work' },
    { value: 'thread', label: 'Thread Work', icon: '🪡', price: 1500, description: 'Thread embroidery' },
    { value: 'mixed', label: 'Mixed', icon: '🌟', price: 4000, description: 'Combination of techniques' },
  ];

  const complexityOptions = [
    { value: 'simple', label: 'Simple', hours: 20, multiplier: 1.0 },
    { value: 'moderate', label: 'Moderate', hours: 40, multiplier: 1.5 },
    { value: 'intricate', label: 'Intricate', hours: 80, multiplier: 2.0 },
    { value: 'heavy', label: 'Heavy', hours: 120, multiplier: 3.0 },
  ];

  const coverageOptions = [
    { value: 'minimal', label: 'Minimal (10%)', multiplier: 1.0 },
    { value: 'partial', label: 'Partial (30%)', multiplier: 1.3 },
    { value: 'full', label: 'Full (60%)', multiplier: 1.6 },
    { value: 'heavy', label: 'Heavy (90%)', multiplier: 2.0 },
  ];

  const calculateAdditionalCost = () => {
    const typeOption = embroideryTypes.find(t => t.value === selectedOptions.type);
    const complexityOption = complexityOptions.find(c => c.value === selectedOptions.complexity);
    const coverageOption = coverageOptions.find(c => c.value === selectedOptions.coverage);

    if (!typeOption || typeOption.value === 'none') return 0;

    const baseCost = typeOption.price || 0;
    const complexityMultiplier = complexityOption?.multiplier || 1;
    const coverageMultiplier = coverageOption?.multiplier || 1;

    return Math.round(baseCost * complexityMultiplier * coverageMultiplier);
  };

  const calculateEstimatedHours = () => {
    const complexityOption = complexityOptions.find(c => c.value === selectedOptions.complexity);
    return complexityOption?.hours || 0;
  };

  const handleOptionChange = (field, value) => {
    const newOptions = { ...selectedOptions, [field]: value };
    setSelectedOptions(newOptions);
    if (onEmbroideryChange) {
      onEmbroideryChange({
        ...newOptions,
        additionalCost: calculateAdditionalCost(),
        estimatedHours: calculateEstimatedHours(),
      });
    }
  };

  const additionalCost = calculateAdditionalCost();
  const estimatedHours = calculateEstimatedHours();
  const totalPrice = basePrice + additionalCost;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-600" />
          Karhai Embroidery Options
        </h3>
        <p className="text-sm text-gray-600">
          Customize your hand-made karhai suit with beautiful embroidery work
        </p>
      </div>

      {/* Embroidery Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Embroidery Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {embroideryTypes.map((type) => (
            <motion.button
              key={type.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOptionChange('type', type.value)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedOptions.type === type.value
                  ? 'border-pink-600 bg-pink-50'
                  : 'border-gray-200 hover:border-pink-300'
              }`}
            >
              <div className="text-2xl mb-1">{type.icon}</div>
              <div className="text-sm font-medium text-gray-900">{type.label}</div>
              {type.price > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  +Rs. {type.price.toLocaleString()}
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Complexity & Coverage */}
      {selectedOptions.type !== 'none' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Complexity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complexity Level
            </label>
            <select
              value={selectedOptions.complexity}
              onChange={(e) => handleOptionChange('complexity', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              {complexityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.hours} hours)
                </option>
              ))}
            </select>
          </div>

          {/* Coverage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coverage Area
            </label>
            <select
              value={selectedOptions.coverage}
              onChange={(e) => handleOptionChange('coverage', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              {coverageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Price Summary */}
      {selectedOptions.type !== 'none' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Base Price:</span>
              <span className="text-sm font-medium">Rs. {basePrice.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Embroidery Cost:</span>
              <span className="text-sm font-medium text-pink-600">
                +Rs. {additionalCost.toLocaleString()}
              </span>
            </div>
            <div className="border-t border-pink-200 pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-gray-900">Total Price:</span>
                <span className="text-xl font-bold text-pink-600">
                  Rs. {totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>~{estimatedHours} hours</span>
              </div>
              <div className="flex items-center gap-1">
                <Info className="w-4 h-4" />
                <span>Custom order</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

