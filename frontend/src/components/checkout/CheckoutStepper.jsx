/**
 * D:\Laraib Creative\laraibcreative\frontend\src\components\checkout\CheckoutStepper.jsx
 * CheckoutStepper Component
 * Visual progress indicator for multi-step checkout
 * 
 * Features:
 * - Shows current step
 * - Completed steps marked with checkmark
 * - Responsive design (horizontal on desktop, compact on mobile)
 * - Smooth animations
 * - Accessible
 * 
 * @param {number} currentStep - Current active step (1-based index)
 * @param {Array} steps - Array of step objects with { number, title }
 */

export default function CheckoutStepper({ currentStep, steps }) {
  return (
    <div className="w-full">
      {/* Desktop View - Horizontal */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex-1 flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center relative">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  font-semibold text-sm transition-all duration-300
                  ${
                    step.number < currentStep
                      ? 'bg-green-500 text-white' // Completed
                      : step.number === currentStep
                      ? 'bg-purple-600 text-white shadow-lg scale-110' // Active
                      : 'bg-gray-200 text-gray-500' // Upcoming
                  }
                `}
              >
                {step.number < currentStep ? (
                  // Checkmark for completed steps
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  // Step number
                  step.number
                )}
              </div>

              {/* Step Title */}
              <span
                className={`
                  mt-2 text-sm font-medium text-center whitespace-nowrap
                  ${
                    step.number === currentStep
                      ? 'text-purple-600'
                      : step.number < currentStep
                      ? 'text-green-600'
                      : 'text-gray-500'
                  }
                `}
              >
                {step.title}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-4 relative top-[-20px]">
                <div
                  className={`
                    h-full transition-all duration-500
                    ${step.number < currentStep ? 'bg-green-500' : 'bg-gray-200'}
                  `}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile View - Compact */}
      <div className="md:hidden">
        <div className="flex items-center justify-between">
          {/* Current Step Info */}
          <div>
            <p className="text-sm text-gray-500">
              Step {currentStep} of {steps.length}
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {steps[currentStep - 1]?.title}
            </p>
          </div>

          {/* Progress Circle */}
          <div className="relative w-16 h-16">
            {/* Background Circle */}
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-gray-200"
              />
              {/* Progress Circle */}
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={176} // 2 * π * 28
                strokeDashoffset={176 - (176 * currentStep) / steps.length}
                className="text-purple-600 transition-all duration-500"
              />
            </svg>
            {/* Step Number */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-purple-600">
                {currentStep}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-purple-600 h-full transition-all duration-500 rounded-full"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>

        {/* All Steps List */}
        <div className="mt-4 space-y-2">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`
                flex items-center gap-3 p-2 rounded-lg
                ${step.number === currentStep ? 'bg-purple-50' : ''}
              `}
            >
              <div
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                  ${
                    step.number < currentStep
                      ? 'bg-green-500'
                      : step.number === currentStep
                      ? 'bg-purple-600'
                      : 'bg-gray-300'
                  }
                `}
              >
                {step.number < currentStep ? (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-xs font-bold text-white">
                    {step.number}
                  </span>
                )}
              </div>
              <span
                className={`
                  text-sm font-medium
                  ${
                    step.number === currentStep
                      ? 'text-purple-600'
                      : step.number < currentStep
                      ? 'text-green-600'
                      : 'text-gray-500'
                  }
                `}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}