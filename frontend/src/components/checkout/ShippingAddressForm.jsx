'use client';

import { useState } from 'react';

/**
 * ShippingAddressForm Component
 * Step 2 of checkout - Collect shipping address
 */

export default function ShippingAddressForm({ formData, updateFormData, onNext, onBack }) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const data = formData?.shippingAddress || {
    fullAddress: '',
    city: '',
    province: '',
    postalCode: '',
    deliveryInstructions: '',
    saveAddress: false
  };

  const [localData, setLocalData] = useState(data);

  // Major Pakistani cities
  const cities = [
    { value: '', label: 'Select City' },
    { value: 'lahore', label: 'Lahore' },
    { value: 'karachi', label: 'Karachi' },
    { value: 'islamabad', label: 'Islamabad' },
    { value: 'rawalpindi', label: 'Rawalpindi' },
    { value: 'faisalabad', label: 'Faisalabad' },
    { value: 'multan', label: 'Multan' },
    { value: 'gujranwala', label: 'Gujranwala' },
    { value: 'sialkot', label: 'Sialkot' },
    { value: 'peshawar', label: 'Peshawar' },
    { value: 'quetta', label: 'Quetta' },
    { value: 'hyderabad', label: 'Hyderabad' },
    { value: 'other', label: 'Other' }
  ];

  // Provinces
  const provinces = [
    { value: '', label: 'Select Province' },
    { value: 'punjab', label: 'Punjab' },
    { value: 'sindh', label: 'Sindh' },
    { value: 'kpk', label: 'Khyber Pakhtunkhwa' },
    { value: 'balochistan', label: 'Balochistan' },
    { value: 'gilgit', label: 'Gilgit-Baltistan' },
    { value: 'azad-kashmir', label: 'Azad Kashmir' }
  ];

  /**
   * Validation rules
   */
  const validateField = (name, value) => {
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
        if (!value.trim()) return 'Postal code is required';
        if (!/^\d{5}$/.test(value.trim())) return 'Postal code must be 5 digits';
        return '';

      default:
        return '';
    }
  };

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
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
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all required fields
    const newErrors = {};
    const requiredFields = ['fullAddress', 'city', 'province', 'postalCode'];
    
    requiredFields.forEach(field => {
      const error = validateField(field, localData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    setTouched({
      fullAddress: true,
      city: true,
      province: true,
      postalCode: true
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

      {/* Form */}
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
              ${errors.fullAddress && touched.fullAddress ? 'border-red-500' : 'border-gray-300'}
            `}
          />
          {errors.fullAddress && touched.fullAddress && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.fullAddress}
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
                ${errors.city && touched.city ? 'border-red-500' : 'border-gray-300'}
              `}
            >
              {cities.map(city => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
            {errors.city && touched.city && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.city}
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
                ${errors.province && touched.province ? 'border-red-500' : 'border-gray-300'}
              `}
            >
              {provinces.map(province => (
                <option key={province.value} value={province.value}>
                  {province.label}
                </option>
              ))}
            </select>
            {errors.province && touched.province && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.province}
              </p>
            )}
          </div>
        </div>

        {/* Postal Code */}
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
            Postal Code <span className="text-red-500">*</span>
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
              ${errors.postalCode && touched.postalCode ? 'border-red-500' : 'border-gray-300'}
            `}
          />
          {errors.postalCode && touched.postalCode && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.postalCode}
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

        {/* Save Address Checkbox */}
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
    </div>
  );
}