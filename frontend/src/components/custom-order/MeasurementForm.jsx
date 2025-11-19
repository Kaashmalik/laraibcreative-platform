import React, { useState, useEffect } from 'react';
import { Shirt, Ruler, Info, AlertCircle } from 'lucide-react';
import {
  SIZE_CHART,
  MEASUREMENT_RANGES,
  GARMENT_STYLES,
  BASIC_MEASUREMENTS,
  generateMeasurementOptions,
  getRequiredMeasurements
} from './measurementData';

/**
 * MeasurementForm Component
 * Handles measurement input for both ready-to-wear and custom stitched orders
 * 
 * @param {string} serviceType - Type of service ('ready-to-wear' or 'custom-stitched')
 * @param {Object} measurements - Current measurements object
 * @param {Function} onMeasurementsChange - Callback when measurements change
 */
const MeasurementForm = ({ serviceType, measurements, onMeasurementsChange }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [garmentStyle, setGarmentStyle] = useState('normal-shirt');
  const [errors, setErrors] = useState({});

  // Get required measurements for selected garment style
  const requiredStyleMeasurements = getRequiredMeasurements(garmentStyle);

  // Handle size selection for ready-to-wear
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    const sizeMeasurements = SIZE_CHART[size];
    onMeasurementsChange(sizeMeasurements);
    setErrors({});
  };

  // Handle individual measurement change
  const handleCustomMeasurement = (key, value) => {
    const numValue = parseFloat(value);
    
    // Validate measurement
    const range = MEASUREMENT_RANGES[key];
    if (range && (numValue < range.min || numValue > range.max)) {
      setErrors({
        ...errors,
        [key]: `Must be between ${range.min}" and ${range.max}"`
      });
    } else {
      const newErrors = { ...errors };
      delete newErrors[key];
      setErrors(newErrors);
    }

    onMeasurementsChange({
      ...measurements,
      [key]: numValue
    });
  };

  // Check if all required measurements are filled
  const isFormComplete = () => {
    const allRequired = [...BASIC_MEASUREMENTS, ...requiredStyleMeasurements];
    return allRequired.every(key => measurements[key] && measurements[key] > 0);
  };

  // Garment style change handler
  const handleStyleChange = (styleId) => {
    setGarmentStyle(styleId);
    // Clear style-specific measurements when changing style
    const basicMeasurementsOnly = BASIC_MEASUREMENTS.reduce((acc, key) => {
      if (measurements[key]) {
        acc[key] = measurements[key];
      }
      return acc;
    }, {});
    onMeasurementsChange(basicMeasurementsOnly);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {serviceType === 'ready-to-wear' 
            ? 'Select Your Size' 
            : 'Enter Your Measurements'}
        </h2>
        <p className="text-sm text-gray-600">
          All measurements are in inches. {serviceType === 'custom-stitched' && 
          'Please measure carefully for the perfect fit.'}
        </p>
      </div>

      {/* Garment Style Selection */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
        <label className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Shirt className="w-4 h-4 text-purple-600" />
          Choose Garment Style
        </label>
        <select
          value={garmentStyle}
          onChange={(e) => handleStyleChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-pink-500 focus:outline-none bg-white transition-all"
        >
          {GARMENT_STYLES.map((style) => (
            <option key={style.id} value={style.id}>
              {style.name} - {style.description}
            </option>
          ))}
        </select>
      </div>

      {/* Size Selection for Ready-to-Wear */}
      {serviceType === 'ready-to-wear' && (
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Select Standard Size
          </label>
          <div className="grid grid-cols-5 gap-3">
            {Object.keys(SIZE_CHART).map((size) => (
              <button
                key={size}
                onClick={() => handleSizeSelect(size)}
                className={`
                  py-4 px-4 rounded-lg font-bold transition-all duration-300
                  transform hover:scale-105
                  ${
                    selectedSize === size
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {size}
              </button>
            ))}
          </div>
          
          {!selectedSize && (
            <div className="flex items-start gap-3 mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                Select a size to auto-fill measurements. You can adjust individual 
                measurements afterward if needed.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Basic Body Measurements */}
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shirt className="w-5 h-5 text-pink-600" />
          Body Measurements
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {BASIC_MEASUREMENTS.map((key) => {
            const config = MEASUREMENT_RANGES[key];
            const options = generateMeasurementOptions(key);
            const hasError = errors[key];

            return (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {config.label}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  value={measurements[key] || ''}
                  onChange={(e) => handleCustomMeasurement(key, e.target.value)}
                  disabled={serviceType === 'ready-to-wear' && !selectedSize}
                  className={`
                    w-full px-4 py-3 border-2 rounded-lg 
                    focus:outline-none transition-all
                    ${hasError 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-200 focus:border-pink-500'
                    }
                    ${serviceType === 'ready-to-wear' && !selectedSize 
                      ? 'bg-gray-100 cursor-not-allowed' 
                      : 'bg-white'
                    }
                  `}
                >
                  <option value="">Select {config.label}</option>
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {hasError && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {hasError}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Style-Specific Measurements */}
      {requiredStyleMeasurements.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Ruler className="w-5 h-5 text-purple-600" />
            Garment Length Measurements
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {requiredStyleMeasurements.map((key) => {
              const config = MEASUREMENT_RANGES[key];
              const options = generateMeasurementOptions(key);
              const hasError = errors[key];

              return (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {config.label}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    value={measurements[key] || ''}
                    onChange={(e) => handleCustomMeasurement(key, e.target.value)}
                    disabled={serviceType === 'ready-to-wear' && !selectedSize}
                    className={`
                      w-full px-4 py-3 border-2 rounded-lg 
                      focus:outline-none transition-all
                      ${hasError 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-purple-500'
                      }
                      ${serviceType === 'ready-to-wear' && !selectedSize 
                        ? 'bg-gray-100 cursor-not-allowed' 
                        : 'bg-white'
                      }
                    `}
                  >
                    <option value="">Select {config.label}</option>
                    {options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {hasError && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {hasError}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Form Completion
          </span>
          <span className="text-sm font-semibold text-pink-600">
            {Math.round((Object.keys(measurements).filter(k => measurements[k]).length / 
              (BASIC_MEASUREMENTS.length + requiredStyleMeasurements.length)) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{
              width: `${(Object.keys(measurements).filter(k => measurements[k]).length / 
                (BASIC_MEASUREMENTS.length + requiredStyleMeasurements.length)) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Measurement Guide */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold mb-1">How to Measure</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Use a soft measuring tape</li>
            <li>Measure over light clothing</li>
            <li>Keep the tape parallel to the floor</li>
            <li>Don't pull the tape too tight</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MeasurementForm;