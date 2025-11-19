import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { FABRIC_OPTIONS } from './measurementData';

/**
 * FabricSelection Component
 * Allows users to select fabric type for their custom order
 * 
 * @param {string} selected - Currently selected fabric ID
 * @param {Function} onSelect - Callback function when fabric is selected
 */
const FabricSelection = ({ selected, onSelect }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Your Fabric
        </h2>
        <p className="text-gray-600">
          Choose the perfect fabric for your outfit
        </p>
      </div>

      {/* Fabric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {FABRIC_OPTIONS.map((fabric) => {
          const isSelected = selected === fabric.id;

          return (
            <button
              key={fabric.id}
              onClick={() => onSelect(fabric.id)}
              className={`
                relative p-5 rounded-xl border-2 text-center 
                transition-all duration-300 transform hover:scale-105
                ${
                  isSelected
                    ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50 shadow-lg'
                    : 'border-gray-200 hover:border-pink-300 bg-white hover:shadow-md'
                }
              `}
            >
              {/* Emoji Icon */}
              <div className="text-5xl mb-3 transform transition-transform duration-300 hover:scale-110">
                {fabric.emoji}
              </div>

              {/* Fabric Name */}
              <h3 className="font-bold text-gray-900 text-lg mb-1">
                {fabric.name}
              </h3>

              {/* Description */}
              <p className="text-xs text-gray-600 mb-2">
                {fabric.description}
              </p>

              {/* Season Badge */}
              <div className="flex items-center justify-center gap-1 mb-2">
                <Sparkles size={12} className="text-purple-500" />
                <span className="text-xs font-medium text-purple-600">
                  {fabric.season}
                </span>
              </div>

              {/* Price */}
              <div
                className={`
                  text-sm font-semibold
                  ${isSelected ? 'text-pink-600' : 'text-gray-700'}
                `}
              >
                {fabric.price}
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-1.5 shadow-lg">
                  <Check size={16} strokeWidth={3} />
                </div>
              )}

              {/* Hover Effect Border */}
              <div
                className={`
                  absolute inset-0 rounded-xl 
                  transition-opacity duration-300
                  ${
                    isSelected
                      ? 'opacity-100'
                      : 'opacity-0 hover:opacity-100'
                  }
                `}
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(217, 70, 166, 0.1), rgba(124, 58, 237, 0.1))'
                    : 'linear-gradient(135deg, rgba(217, 70, 166, 0.05), rgba(124, 58, 237, 0.05))',
                  pointerEvents: 'none'
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Information Note */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Fabric Care Tips</p>
          <p>
            Each fabric has unique care requirements. We'll provide detailed care 
            instructions with your order to ensure your outfit stays beautiful.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FabricSelection;