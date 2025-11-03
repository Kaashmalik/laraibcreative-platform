'use client';

'use client'

import { Check } from 'lucide-react'

const steps = [
  { id: 1, name: 'Customer Info', description: 'Personal details' },
  { id: 2, name: 'Shipping', description: 'Delivery address' },
  { id: 3, name: 'Review', description: 'Order summary' },
  { id: 4, name: 'Payment', description: 'Payment method' },
]

export default function CheckoutStepper({ currentStep }) {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center relative">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                  currentStep > step.id
                    ? 'bg-pink-600 border-pink-600'
                    : currentStep === step.id
                    ? 'bg-white border-pink-600 text-pink-600'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="w-6 h-6 text-white" />
                ) : (
                  <span className="font-semibold">{step.id}</span>
                )}
              </div>
              
              <div className="mt-2 text-center">
                <p className={`font-medium text-sm ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.name}
                </p>
                <p className="text-xs text-gray-500 hidden sm:block">{step.description}</p>
              </div>
            </div>
            
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-4 relative top-[-20px]">
                <div
                  className={`h-full transition-all ${
                    currentStep > step.id ? 'bg-pink-600' : 'bg-gray-300'
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}