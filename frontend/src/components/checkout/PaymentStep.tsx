'use client'

import { useState } from 'react'
import { CreditCard, Smartphone, Building2, Truck } from 'lucide-react'
import { validateDiscountCode } from '@/app/actions/orders'
import type { CheckoutData } from '@/app/actions/orders'
import { cn } from '@/lib/utils'

interface PaymentStepProps {
  data: Partial<CheckoutData>
  onUpdate: (data: Partial<CheckoutData>) => void
  onNext: () => void
  onBack: () => void
}

type PaymentMethod = 'cod' | 'jazzcash' | 'easypaisa' | 'bank_transfer' | 'card'

const PAYMENT_METHODS = [
  {
    id: 'cod' as PaymentMethod,
    name: 'Cash on Delivery',
    description: 'Pay when you receive',
    icon: Truck,
    fee: 100,
    freeAbove: 5000,
  },
  {
    id: 'jazzcash' as PaymentMethod,
    name: 'JazzCash',
    description: 'Pay via JazzCash wallet',
    icon: Smartphone,
  },
  {
    id: 'easypaisa' as PaymentMethod,
    name: 'EasyPaisa',
    description: 'Pay via EasyPaisa wallet',
    icon: Smartphone,
  },
  {
    id: 'bank_transfer' as PaymentMethod,
    name: 'Bank Transfer',
    description: 'Direct bank transfer',
    icon: Building2,
  },
]

export function PaymentStep({ data, onUpdate, onNext, onBack }: PaymentStepProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(data.paymentMethod || 'cod')
  const [discountCode, setDiscountCode] = useState(data.discountCode || '')
  const [discountError, setDiscountError] = useState('')
  const [discountApplied, setDiscountApplied] = useState(data.discountAmount ? true : false)
  const [isValidating, setIsValidating] = useState(false)

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return
    
    setIsValidating(true)
    setDiscountError('')
    
    const result = await validateDiscountCode(discountCode, data.subtotal || 0)
    
    if (result.valid) {
      onUpdate({
        discountCode,
        discountAmount: result.discountAmount,
      })
      setDiscountApplied(true)
    } else {
      setDiscountError(result.error || 'Invalid code')
    }
    
    setIsValidating(false)
  }

  const handleRemoveDiscount = () => {
    onUpdate({
      discountCode: undefined,
      discountAmount: 0,
    })
    setDiscountCode('')
    setDiscountApplied(false)
  }

  const handleContinue = () => {
    onUpdate({ paymentMethod: selectedMethod })
    onNext()
  }

  const getCODFee = () => {
    const subtotal = data.subtotal || 0
    const cod = PAYMENT_METHODS.find(m => m.id === 'cod')
    if (cod?.freeAbove && subtotal >= cod.freeAbove) return 0
    return cod?.fee || 0
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold text-neutral-800 mb-6">
        Payment Method
      </h2>

      {/* Payment Methods */}
      <div className="space-y-3">
        {PAYMENT_METHODS.map(method => {
          const Icon = method.icon
          const isSelected = selectedMethod === method.id
          const showFee = method.id === 'cod' && getCODFee() > 0

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => setSelectedMethod(method.id)}
              className={cn(
                'w-full flex items-center gap-4 p-4 border-2 rounded-xl transition-colors text-left',
                isSelected
                  ? 'border-primary-gold bg-primary-gold/5'
                  : 'border-neutral-200 hover:border-neutral-300'
              )}
            >
              <div className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                isSelected ? 'bg-primary-gold text-white' : 'bg-neutral-100 text-neutral-600'
              )}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-800">{method.name}</span>
                  {showFee && (
                    <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                      +PKR {method.fee}
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-500">{method.description}</p>
              </div>
              <div className={cn(
                'w-5 h-5 rounded-full border-2',
                isSelected
                  ? 'border-primary-gold bg-primary-gold'
                  : 'border-neutral-300'
              )}>
                {isSelected && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Discount Code */}
      <div className="pt-4 border-t border-neutral-200">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Discount Code
        </label>
        {discountApplied ? (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
            <div>
              <span className="font-semibold text-green-700">{discountCode}</span>
              <span className="text-green-600 ml-2">
                - PKR {data.discountAmount?.toLocaleString()}
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemoveDiscount}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-gold focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleApplyDiscount}
              disabled={isValidating || !discountCode.trim()}
              className="px-6 py-3 bg-neutral-800 text-white font-semibold rounded-xl hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isValidating ? 'Checking...' : 'Apply'}
            </button>
          </div>
        )}
        {discountError && (
          <p className="text-red-500 text-sm mt-2">{discountError}</p>
        )}
      </div>

      {/* Bank Transfer Instructions */}
      {selectedMethod === 'bank_transfer' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h4 className="font-semibold text-blue-800 mb-2">Bank Transfer Details</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Bank:</strong> HBL Bank</p>
            <p><strong>Account Title:</strong> LaraibCreative</p>
            <p><strong>Account No:</strong> 1234567890</p>
            <p><strong>IBAN:</strong> PK00HABB0001234567890</p>
          </div>
          <p className="text-xs text-blue-600 mt-3">
            After transfer, upload receipt in the next step
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-4 border border-neutral-300 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex-1 py-4 bg-primary-gold text-white font-semibold rounded-xl hover:bg-primary-gold-dark transition-colors"
        >
          Review Order
        </button>
      </div>
    </div>
  )
}

export default PaymentStep
