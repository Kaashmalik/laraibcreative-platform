'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { CartItem } from '@/types/cart'
import type { CheckoutData } from '@/app/actions/orders'
import { cn } from '@/lib/utils'

interface StitchingStepProps {
  items: CartItem[]
  data: Partial<CheckoutData>
  onUpdate: (data: Partial<CheckoutData>) => void
  onNext: () => void
  onBack: () => void
}

const NECK_STYLES = [
  { id: 'round', name: 'Round Neck', image: '/images/stitching/neck-round.svg' },
  { id: 'v-neck', name: 'V-Neck', image: '/images/stitching/neck-v.svg' },
  { id: 'boat', name: 'Boat Neck', image: '/images/stitching/neck-boat.svg' },
  { id: 'collar', name: 'Collar', image: '/images/stitching/neck-collar.svg' },
]

const SLEEVE_STYLES = [
  { id: 'full', name: 'Full Sleeves', image: '/images/stitching/sleeve-full.svg' },
  { id: 'three-quarter', name: '3/4 Sleeves', image: '/images/stitching/sleeve-34.svg' },
  { id: 'half', name: 'Half Sleeves', image: '/images/stitching/sleeve-half.svg' },
  { id: 'sleeveless', name: 'Sleeveless', image: '/images/stitching/sleeve-none.svg' },
]

interface ItemMeasurements {
  bust: string
  waist: string
  hip: string
  shoulder: string
  length: string
  armLength: string
  neckStyle: string
  sleeveStyle: string
}

export function StitchingStep({ items, data, onUpdate, onNext, onBack }: StitchingStepProps) {
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [measurements, setMeasurements] = useState<Record<string, ItemMeasurements>>({})

  const currentItem = items[currentItemIndex]

  const handleMeasurementChange = (field: keyof ItemMeasurements, value: string) => {
    setMeasurements(prev => ({
      ...prev,
      [currentItem.id]: {
        ...prev[currentItem.id],
        [field]: value
      }
    }))
  }

  const handleNext = () => {
    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex(prev => prev + 1)
    } else {
      // Update checkout data with all measurements
      const updatedItems = data.items?.map(item => {
        const itemMeasurements = measurements[item.productId]
        if (itemMeasurements && item.isStitched) {
          return {
            ...item,
            measurements: {
              bust: parseFloat(itemMeasurements.bust) || 0,
              waist: parseFloat(itemMeasurements.waist) || 0,
              hip: parseFloat(itemMeasurements.hip) || 0,
              shoulder: parseFloat(itemMeasurements.shoulder) || 0,
              length: parseFloat(itemMeasurements.length) || 0,
              armLength: parseFloat(itemMeasurements.armLength) || 0,
            },
            customization: {
              ...item.customization,
              neckStyle: itemMeasurements.neckStyle,
              sleeveStyle: itemMeasurements.sleeveStyle,
            }
          }
        }
        return item
      })

      onUpdate({ items: updatedItems })
      onNext()
    }
  }

  const currentMeasurements = measurements[currentItem?.id] || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-neutral-800">
          Stitching Details
        </h2>
        <span className="text-sm text-neutral-500">
          Item {currentItemIndex + 1} of {items.length}
        </span>
      </div>

      {/* Current Item */}
      <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
        <div className="relative w-16 h-20 rounded-lg overflow-hidden">
          {currentItem.product.image && (
            <Image
              src={currentItem.product.image}
              alt={currentItem.product.title}
              fill
              className="object-cover"
            />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-neutral-800">{currentItem.product.title}</h3>
          <p className="text-sm text-neutral-500">Qty: {currentItem.quantity}</p>
        </div>
      </div>

      {/* Neck Style */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Neck Style
        </label>
        <div className="grid grid-cols-4 gap-3">
          {NECK_STYLES.map(style => (
            <button
              key={style.id}
              type="button"
              onClick={() => handleMeasurementChange('neckStyle', style.id)}
              className={cn(
                'p-3 border-2 rounded-xl transition-colors text-center',
                currentMeasurements.neckStyle === style.id
                  ? 'border-primary-gold bg-primary-gold/5'
                  : 'border-neutral-200 hover:border-neutral-300'
              )}
            >
              <div className="w-12 h-12 mx-auto mb-2 bg-neutral-100 rounded-lg" />
              <span className="text-xs font-medium">{style.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sleeve Style */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Sleeve Style
        </label>
        <div className="grid grid-cols-4 gap-3">
          {SLEEVE_STYLES.map(style => (
            <button
              key={style.id}
              type="button"
              onClick={() => handleMeasurementChange('sleeveStyle', style.id)}
              className={cn(
                'p-3 border-2 rounded-xl transition-colors text-center',
                currentMeasurements.sleeveStyle === style.id
                  ? 'border-primary-gold bg-primary-gold/5'
                  : 'border-neutral-200 hover:border-neutral-300'
              )}
            >
              <div className="w-12 h-12 mx-auto mb-2 bg-neutral-100 rounded-lg" />
              <span className="text-xs font-medium">{style.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Measurements */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Measurements (in inches)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { id: 'bust', label: 'Bust' },
            { id: 'waist', label: 'Waist' },
            { id: 'hip', label: 'Hip' },
            { id: 'shoulder', label: 'Shoulder' },
            { id: 'length', label: 'Length' },
            { id: 'armLength', label: 'Arm Length' },
          ].map(field => (
            <div key={field.id}>
              <label className="block text-xs text-neutral-500 mb-1">
                {field.label}
              </label>
              <input
                type="number"
                step="0.5"
                value={currentMeasurements[field.id as keyof ItemMeasurements] || ''}
                onChange={(e) => handleMeasurementChange(field.id as keyof ItemMeasurements, e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={currentItemIndex > 0 ? () => setCurrentItemIndex(prev => prev - 1) : onBack}
          className="flex-1 py-4 border border-neutral-300 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex-1 py-4 bg-primary-gold text-white font-semibold rounded-xl hover:bg-primary-gold-dark transition-colors"
        >
          {currentItemIndex < items.length - 1 ? 'Next Item' : 'Continue to Payment'}
        </button>
      </div>
    </div>
  )
}

export default StitchingStep
