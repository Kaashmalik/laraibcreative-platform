import React from 'react';
import { Package, Ruler, Check } from 'lucide-react';
import { SERVICE_TYPES } from './measurementData';

/**
 * ServiceTypeSelection Component
 * Allows users to choose between Ready-to-Wear and Custom Stitched services
 * 
 * @param {string} selected - Currently selected service type ID
 * @param {Function} onSelect - Callback function when service is selected
 */
const ServiceTypeSelection = ({ selected, onSelect }) => {
  const iconMap = {
    Package: Package,
    Ruler: Ruler
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Service Type
        </h2>
        <p className="text-gray-600">
          Select the option that best suits your needs
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {SERVICE_TYPES.map((service) => {
          const Icon = iconMap[service.icon];
          const isSelected = selected === service.id;

          return (
            <button
              key={service.id}
              onClick={() => onSelect(service.id)}
              className={`
                relative p-6 rounded-xl border-2 text-left 
                transition-all duration-300 transform hover:scale-105
                ${
                  isSelected
                    ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50 shadow-lg'
                    : 'border-gray-200 hover:border-pink-300 bg-white hover:shadow-md'
                }
              `}
            >
              {/* Header Section */}
              <div className="flex items-start justify-between mb-4">
                <Icon
                  className={`
                    w-10 h-10 transition-colors duration-300
                    ${isSelected ? 'text-pink-600' : 'text-gray-400'}
                  `}
                />
                <span
                  className={`
                    px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-300
                    ${
                      isSelected
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }
                  `}
                >
                  {service.badge}
                </span>
              </div>

              {/* Content Section */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {service.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {service.description}
              </p>

              {/* Features List */}
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4 bg-white rounded-full p-1 shadow-md">
                  <Check className="w-5 h-5 text-pink-600" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceTypeSelection;