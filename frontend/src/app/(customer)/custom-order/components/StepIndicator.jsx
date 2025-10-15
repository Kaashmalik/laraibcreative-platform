import { Check } from 'lucide-react';

/**
 * Step Indicator Component
 * 
 * Visual progress indicator for multi-step forms
 * Shows current step, completed steps, and upcoming steps
 * 
 * @param {number} currentStep - Current active step (1-based)
 * @param {number} totalSteps - Total number of steps
 */

const steps = [
  {
    number: 1,
    title: 'Service Type',
    description: 'Choose your service',
  },
  {
    number: 2,
    title: 'References',
    description: 'Upload images',
  },
  {
    number: 3,
    title: 'Fabric',
    description: 'Select fabric',
  },
  {
    number: 4,
    title: 'Measurements',
    description: 'Enter measurements',
  },
  {
    number: 5,
    title: 'Review',
    description: 'Review & submit',
  },
];

export default function StepIndicator({ currentStep, totalSteps }) {
  /**
   * Determine step status
   */
  const getStepStatus = (stepNumber) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'active';
    return 'upcoming';
  };

  /**
   * Get step classes based on status
   */
  const getStepClasses = (status) => {
    const baseClasses = 'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300';
    
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg scale-110`;
      case 'active':
        return `${baseClasses} bg-gradient-to-br from-pink-600 to-purple-600 text-white shadow-lg ring-4 ring-purple-200 scale-110`;
      case 'upcoming':
        return `${baseClasses} bg-gray-200 text-gray-600`;
      default:
        return baseClasses;
    }
  };

  /**
   * Get connector line classes
   */
  const getConnectorClasses = (stepNumber) => {
    const isCompleted = stepNumber < currentStep;
    const baseClasses = 'flex-1 h-1 transition-all duration-500';
    
    return isCompleted
      ? `${baseClasses} bg-gradient-to-r from-green-500 to-emerald-600`
      : `${baseClasses} bg-gray-200`;
  };

  /**
   * Get text classes based on status
   */
  const getTextClasses = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 font-semibold';
      case 'active':
        return 'text-purple-700 font-bold';
      case 'upcoming':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="mb-8">
      {/* Desktop View - Horizontal */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(step.number);
            const isLast = index === steps.length - 1;

            return (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-2 relative">
                  {/* Step Circle */}
                  <div className={getStepClasses(status)}>
                    {status === 'completed' ? (
                      <Check className="w-6 h-6" strokeWidth={3} />
                    ) : (
                      <span>{step.number}</span>
                    )}
                  </div>

                  {/* Step Info */}
                  <div className="text-center absolute top-12 w-32">
                    <p className={`text-sm font-medium ${getTextClasses(status)}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div className={getConnectorClasses(step.number)} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile View - Compact */}
      <div className="md:hidden">
        <div className="flex items-center justify-center gap-2 mb-4">
          {steps.map((step, index) => {
            const status = getStepStatus(step.number);
            const isLast = index === steps.length - 1;

            return (
              <div key={step.number} className="flex items-center">
                {/* Step Circle - Smaller */}
                <div
                  className={`${getStepClasses(status)} w-8 h-8 ${
                    status === 'active' ? 'scale-125' : 'scale-100'
                  }`}
                >
                  {status === 'completed' ? (
                    <Check className="w-4 h-4" strokeWidth={3} />
                  ) : (
                    <span className="text-sm">{step.number}</span>
                  )}
                </div>

                {/* Connector Line - Shorter */}
                {!isLast && (
                  <div className={`${getConnectorClasses(step.number)} w-6`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Current Step Info */}
        <div className="text-center">
          <p className="text-lg font-bold text-purple-700">
            {steps[currentStep - 1].title}
          </p>
          <p className="text-sm text-gray-600">
            {steps[currentStep - 1].description}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 md:mt-20">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span>Progress</span>
          <span className="font-semibold">{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-600 to-purple-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}