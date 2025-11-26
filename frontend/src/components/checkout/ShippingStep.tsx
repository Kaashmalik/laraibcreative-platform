'use client'

import { useForm } from 'react-hook-form'
import { useAuth } from '@/context/AuthContext'
import type { CheckoutData } from '@/app/actions/orders'

interface ShippingStepProps {
  data: Partial<CheckoutData>
  onUpdate: (data: Partial<CheckoutData>) => void
  onNext: () => void
}

interface ShippingForm {
  email: string
  phone: string
  full_name: string
  address_line1: string
  address_line2: string
  city: string
  postal_code: string
  delivery_instructions: string
}

const CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  'Hyderabad', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Other'
]

export function ShippingStep({ data, onUpdate, onNext }: ShippingStepProps) {
  const { user, profile } = useAuth()
  
  const { register, handleSubmit, formState: { errors } } = useForm<ShippingForm>({
    defaultValues: {
      email: user?.email || data.email || '',
      phone: profile?.phone || data.phone || '',
      full_name: profile?.full_name || data.shippingAddress?.full_name || '',
      address_line1: data.shippingAddress?.address_line1 || '',
      address_line2: data.shippingAddress?.address_line2 || '',
      city: data.shippingAddress?.city || '',
      postal_code: data.shippingAddress?.postal_code || '',
      delivery_instructions: data.shippingAddress?.delivery_instructions || '',
    }
  })

  const onSubmit = (formData: ShippingForm) => {
    onUpdate({
      email: formData.email,
      phone: formData.phone,
      shippingAddress: {
        full_name: formData.full_name,
        phone: formData.phone,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        city: formData.city,
        postal_code: formData.postal_code,
        country: 'Pakistan',
        delivery_instructions: formData.delivery_instructions,
      }
    })
    onNext()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-display font-bold text-neutral-800 mb-6">
        Shipping Information
      </h2>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            {...register('email', { required: 'Email is required' })}
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-gold focus:border-transparent"
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            {...register('phone', { 
              required: 'Phone is required',
              pattern: {
                value: /^(\+92|0)?[0-9]{10}$/,
                message: 'Enter valid Pakistani phone number'
              }
            })}
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-gold focus:border-transparent"
            placeholder="03001234567"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Full Name *
        </label>
        <input
          type="text"
          {...register('full_name', { required: 'Name is required' })}
          className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-gold focus:border-transparent"
          placeholder="Enter your full name"
        />
        {errors.full_name && (
          <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Address Line 1 *
        </label>
        <input
          type="text"
          {...register('address_line1', { required: 'Address is required' })}
          className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-gold focus:border-transparent"
          placeholder="House/Flat No., Street, Area"
        />
        {errors.address_line1 && (
          <p className="text-red-500 text-sm mt-1">{errors.address_line1.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Address Line 2 (Optional)
        </label>
        <input
          type="text"
          {...register('address_line2')}
          className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-gold focus:border-transparent"
          placeholder="Landmark, Building name"
        />
      </div>

      {/* City & Postal Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            City *
          </label>
          <select
            {...register('city', { required: 'City is required' })}
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-gold focus:border-transparent"
          >
            <option value="">Select City</option>
            {CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Postal Code (Optional)
          </label>
          <input
            type="text"
            {...register('postal_code')}
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-gold focus:border-transparent"
            placeholder="12345"
          />
        </div>
      </div>

      {/* Delivery Instructions */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Delivery Instructions (Optional)
        </label>
        <textarea
          {...register('delivery_instructions')}
          rows={3}
          className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-gold focus:border-transparent resize-none"
          placeholder="Any special instructions for delivery..."
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-4 bg-primary-gold text-white font-semibold rounded-xl hover:bg-primary-gold-dark transition-colors"
      >
        Continue to {data.items?.some(i => i.isStitched) ? 'Stitching Details' : 'Payment'}
      </button>
    </form>
  )
}

export default ShippingStep
