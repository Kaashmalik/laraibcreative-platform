import React from 'react';
import { Check } from 'lucide-react';

/**
 * StepIndicator Component
 * Displays progress through multi-step form
 * 
 * @param {number} currentStep - Current active step index (0-based)
 * @param {Array} steps - Array of step objects with { id, title }
 */
const StepIndicator = ({ currentStep, steps }) => {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step Circle */}
            <div className="flex flex-col items-center flex-1">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center 
                  font-semibold transition-all duration-300
                  ${
                    index < currentStep
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                      : index === currentStep
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white ring-4 ring-pink-200'
                      : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {index < currentStep ? (
                  <Check size={20} strokeWidth={3} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              {/* Step Label */}
              <span
                className={`
                  text-xs mt-2 font-medium text-center transition-colors duration-300
                  ${index <= currentStep ? 'text-gray-900' : 'text-gray-400'}
                `}
              >
                {step.title}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  h-0.5 flex-1 mx-2 transition-all duration-300
                  ${
                    index < currentStep
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600'
                      : 'bg-gray-200'
                  }
                `}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;