/**
 * Shipping Address Form Component
 * Step 2 of checkout - Collect shipping address with saved addresses support
 * 
 * @module components/checkout/ShippingAddressForm
 */

'use client';

import { useState, useEffect } from 'react';
import { MapPin, Plus, Check } from 'lucide-react';
import api from '@/lib/api';
import type { SavedAddress } from '@/types/checkout';

interface ShippingAddressFormProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
  errors?: Record<string, string>;
}

export default function ShippingAddressForm({
  formData,
  updateFormData,
  onNext,
  onBack,
  errors: propErrors = {},
}: ShippingAddressFormProps) {
  const [errors, setErrors] = useState(propErrors);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    formData.shippingAddress?.addressId || null
  );

  const data = formData?.shippingAddress || {
    fullAddress: '',
    city: '',
    province: '',
    postalCode: '',
    deliveryInstructions: '',
    saveAddress: false,
  };

  const [localData, setLocalData] = useState(data);

  // Major Pakistani cities
  const cities = [
    { value: '', label: 'Select City' },
    { value: 'Lahore', label: 'Lahore' },
    { value: 'Karachi', label: 'Karachi' },
    { value: 'Islamabad', label: 'Islamabad' },
    { value: 'Rawalpindi', label: 'Rawalpindi' },
    { value: 'Faisalabad', label: 'Faisalabad' },
    { value: 'Multan', label: 'Multan' },
    { value: 'Gujranwala', label: 'Gujranwala' },
    { value: 'Sialkot', label: 'Sialkot' },
    { value: 'Peshawar', label: 'Peshawar' },
    { value: 'Quetta', label: 'Quetta' },
    { value: 'Hyderabad', label: 'Hyderabad' },
    { value: 'Other', label: 'Other' },
  ];

  // Provinces
  const provinces = [
    { value: '', label: 'Select Province' },
    { value: 'Punjab', label: 'Punjab' },
    { value: 'Sindh', label: 'Sindh' },
    { value: 'Khyber Pakhtunkhwa', label: 'Khyber Pakhtunkhwa' },
    { value: 'Balochistan', label: 'Balochistan' },
    { value: 'Gilgit-Baltistan', label: 'Gilgit-Baltistan' },
    { value: 'Azad Kashmir', label: 'Azad Kashmir' },
    { value: 'Islamabad Capital Territory', label: 'Islamabad Capital Territory' },
  ];

  // Fetch saved addresses for logged-in users
  useEffect(() => {
    const fetchSavedAddresses = async () => {
      try {
        setIsLoadingAddresses(true);
        const response = await api.customers?.getAddresses?.() as any;
        if (response?.success) {
          setSavedAddresses(response.data || []);
          
          // Auto-select default address if available
          const defaultAddress = response.data?.find((addr: SavedAddress) => addr.isDefault);
          if (defaultAddress && !formData.shippingAddress?.fullAddress) {
            handleSelectSavedAddress(defaultAddress);
          }
        }
      } catch (error) {
        // User might not be logged in, which is fine for guest checkout
        // No saved addresses available (guest checkout)
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchSavedAddresses();
  }, []);

  /**
   * Handle saved address selection
   */
  const handleSelectSavedAddress = (address: SavedAddress) => {
    setSelectedAddressId(address._id);
    setShowNewAddressForm(false);
    
    const addressData = {
      fullAddress: address.fullAddress,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode || '',
      deliveryInstructions: '',
      saveAddress: false,
      addressId: address._id,
    };
    
    setLocalData(addressData);
    updateFormData('shippingAddress', addressData);
    setErrors({});
  };

  /**
   * Handle new address form toggle
   */
  const handleNewAddress = () => {
    setShowNewAddressForm(true);
    setSelectedAddressId(null);
    setLocalData({
      fullAddress: '',
      city: '',
      province: '',
      postalCode: '',
      deliveryInstructions: '',
      saveAddress: false,
    });
  };

  /**
   * Validation rules
   */
  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'fullAddress':
        if (!value.trim()) return 'Complete address is required';
        if (value.trim().length < 10) return 'Please provide complete address with house/street details';
        return '';

      case 'city':
        if (!value) return 'Please select a city';
        return '';

      case 'province':
        if (!value) return 'Please select a province';
        return '';

      case 'postalCode':
        if (value && !/^\d{5}$/.test(value.trim())) return 'Postal code must be 5 digits';
        return '';

      default:
        return '';
    }
  };

  /**
   * Handle input change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const newValue = type === 'checkbox' ? checked : value;
    
    const newData = { ...localData, [name]: newValue };
    setLocalData(newData);

    // Clear error when user starts typing
    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  /**
   * Handle input blur
   */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    const newErrors: Record<string, string> = {};
    const requiredFields = ['fullAddress', 'city', 'province'];
    
    requiredFields.forEach(field => {
      const error = validateField(field, localData[field]);
      if (error) newErrors[field] = error;
    });

    // Validate postal code if provided
    if (localData.postalCode && !/^\d{5}$/.test(localData.postalCode.trim())) {
      newErrors.postalCode = 'Postal code must be 5 digits';
    }

    setErrors(newErrors);
    setTouched({
      fullAddress: true,
      city: true,
      province: true,
      postalCode: true,
    });

    // If no errors, proceed to next step
    if (Object.keys(newErrors).length === 0) {
      updateFormData('shippingAddress', localData);
      onNext();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Shipping Address</h2>
        <p className="mt-2 text-gray-600">
          Where should we deliver your order?
        </p>
      </div>

      {/* Saved Addresses (for logged-in users) */}
      {savedAddresses.length > 0 && !showNewAddressForm && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Saved Addresses</h3>
          <div className="space-y-3">
            {savedAddresses.map((address) => (
              <button
                key={address._id}
                type="button"
                onClick={() => handleSelectSavedAddress(address)}
                className={`
                  w-full p-4 border-2 rounded-lg text-left transition-all
                  ${selectedAddressId === address._id
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">
                        {address.label || 'Address'}
                      </span>
                      {address.isDefault && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{address.fullAddress}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {address.city}, {address.province} {address.postalCode && `- ${address.postalCode}`}
                    </p>
                  </div>
                  {selectedAddressId === address._id && (
                    <Check className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
          
          <button
            type="button"
            onClick={handleNewAddress}
            className="mt-4 w-full p-3 border-2 border-dashed border-gray-300 rounded-lg
              hover:border-purple-500 hover:bg-purple-50 transition-all
              flex items-center justify-center gap-2 text-gray-700 font-medium"
          >
            <Plus className="w-5 h-5" />
            Add New Address
          </button>
        </div>
      )}

      {/* Address Form */}
      {(showNewAddressForm || savedAddresses.length === 0) && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Address */}
          <div>
            <label htmlFor="fullAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Complete Address <span className="text-red-500">*</span>
            </label>
            <textarea
              id="fullAddress"
              name="fullAddress"
              value={localData.fullAddress}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={3}
              placeholder="House/Flat No., Street, Area, Landmarks..."
              className={`
                w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 
                focus:border-transparent transition-all outline-none resize-none
                ${(errors.fullAddress || propErrors['shippingAddress.fullAddress']) && touched.fullAddress ? 'border-red-500' : 'border-gray-300'}
              `}
            />
            {(errors.fullAddress || propErrors['shippingAddress.fullAddress']) && touched.fullAddress && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.fullAddress || propErrors['shippingAddress.fullAddress']}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Please include landmarks for easy delivery
            </p>
          </div>

          {/* City and Province Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <select
                id="city"
                name="city"
                value={localData.city}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`
                  w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 
                  focus:border-transparent transition-all outline-none appearance-none
                  bg-white cursor-pointer
                  ${(errors.city || propErrors['shippingAddress.city']) && touched.city ? 'border-red-500' : 'border-gray-300'}
                `}
              >
                {cities.map(city => (
                  <option key={city.value} value={city.value}>
                    {city.label}
                  </option>
                ))}
              </select>
              {(errors.city || propErrors['shippingAddress.city']) && touched.city && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.city || propErrors['shippingAddress.city']}
                </p>
              )}
            </div>

            {/* Province */}
            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-2">
                Province <span className="text-red-500">*</span>
              </label>
              <select
                id="province"
                name="province"
                value={localData.province}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`
                  w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 
                  focus:border-transparent transition-all outline-none appearance-none
                  bg-white cursor-pointer
                  ${(errors.province || propErrors['shippingAddress.province']) && touched.province ? 'border-red-500' : 'border-gray-300'}
                `}
              >
                {provinces.map(province => (
                  <option key={province.value} value={province.value}>
                    {province.label}
                  </option>
                ))}
              </select>
              {(errors.province || propErrors['shippingAddress.province']) && touched.province && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.province || propErrors['shippingAddress.province']}
                </p>
              )}
            </div>
          </div>

          {/* Postal Code */}
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
              Postal Code <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={localData.postalCode}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength={5}
              placeholder="54000"
              className={`
                w-full md:w-1/2 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 
                focus:border-transparent transition-all outline-none
                ${(errors.postalCode || propErrors['shippingAddress.postalCode']) && touched.postalCode ? 'border-red-500' : 'border-gray-300'}
              `}
            />
            {(errors.postalCode || propErrors['shippingAddress.postalCode']) && touched.postalCode && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.postalCode || propErrors['shippingAddress.postalCode']}
              </p>
            )}
          </div>

          {/* Delivery Instructions */}
          <div>
            <label htmlFor="deliveryInstructions" className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Instructions <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              id="deliveryInstructions"
              name="deliveryInstructions"
              value={localData.deliveryInstructions}
              onChange={handleChange}
              rows={2}
              placeholder="Any special delivery instructions (e.g., gate code, best time to deliver)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                focus:ring-purple-500 focus:border-transparent transition-all outline-none resize-none"
            />
          </div>

          {/* Save Address Checkbox (for logged-in users) */}
          {savedAddresses.length > 0 && (
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="saveAddress"
                name="saveAddress"
                checked={localData.saveAddress}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded 
                  focus:ring-purple-500 cursor-pointer"
              />
              <label htmlFor="saveAddress" className="text-sm text-gray-700 cursor-pointer">
                <span className="font-medium">Save this address to my account</span>
                <p className="text-gray-500 mt-0.5">
                  Quick checkout for future orders
                </p>
              </label>
            </div>
          )}

          {/* Shipping Info Box */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-900">Shipping Information</p>
                <ul className="text-sm text-green-700 mt-1 space-y-1">
                  <li>• Estimated delivery: 5-7 business days</li>
                  <li>• Free shipping on orders above PKR 5,000</li>
                  <li>• Track your order with real-time updates</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg
                hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 transition-all
                flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Back
            </button>

            <button
              type="submit"
              className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg
                hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 transition-all
                flex items-center gap-2"
            >
              Continue to Payment
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </form>
      )}

      {/* If saved address is selected, show continue button */}
      {selectedAddressId && !showNewAddressForm && (
        <div className="flex justify-between pt-4 border-t">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg
              hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 transition-all
              flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Back
          </button>

          <button
            type="button"
            onClick={onNext}
            className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg
              hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 transition-all
              flex items-center gap-2"
          >
            Continue to Payment
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

