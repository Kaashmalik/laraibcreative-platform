'use client';

import { useState, useRef } from 'react';

/**
 * PaymentMethod Component
 * Step 3 of checkout - Select payment method and upload receipt
 * 
 * Features:
 * - Payment method selection (Bank Transfer / COD)
 * - Bank account details display
 * - Receipt image upload with drag-drop
 * - Image preview
 * - Transaction details input
 * - File validation
 * - Real-time validation
 */

export default function PaymentMethod({ formData, updateFormData, onNext, onBack }) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Bank account details
  const bankDetails = [
    {
      method: 'JazzCash',
      accountTitle: 'Muhammad Kashif',
      accountNumber: '0302-0718182',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
      )
    },
    {
      method: 'Raast ID',
      accountTitle: 'Muhammad Kashif',
      accountNumber: '0302-0718182',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
      )
    }
  ];

  /**
   * Validation rules
   */
  const validateField = (name, value) => {
    if (formData.payment.method === 'cod') {
      return ''; // No validation needed for COD
    }

    switch (name) {
      case 'receiptImage':
        if (!formData.payment.receiptImage && !formData.payment.receiptPreview) {
          return 'Please upload payment receipt';
        }
        return '';

      case 'transactionId':
        if (!value || !value.trim()) return 'Transaction ID is required';
        if (value.trim().length < 4) return 'Please enter valid transaction ID';
        return '';

      case 'transactionDate':
        if (!value) return 'Transaction date is required';
        const selectedDate = new Date(value);
        const today = new Date();
        if (selectedDate > today) return 'Transaction date cannot be in future';
        return '';

      default:
        return '';
    }
  };

  /**
   * Handle payment method change
   */
  const handleMethodChange = (method) => {
    updateFormData('payment', { method });
    
    // Clear errors when switching methods
    if (method === 'cod') {
      setErrors({});
      setTouched({});
    }
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  /**
   * Process and validate uploaded file
   */
  const processFile = (file) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, receiptImage: 'Only JPG, JPEG, and PNG images are allowed' }));
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, receiptImage: 'File size must be less than 5MB' }));
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      updateFormData('payment', {
        receiptImage: file,
        receiptPreview: reader.result
      });
      setErrors(prev => ({ ...prev, receiptImage: '' }));
    };
    reader.readAsDataURL(file);
  };

  /**
   * Handle drag and drop events
   */
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  /**
   * Remove uploaded receipt
   */
  const handleRemoveReceipt = () => {
    updateFormData('payment', {
      receiptImage: null,
      receiptPreview: null
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData('payment', { [name]: value });

    if (touched[name]) {
      const error = validateField(name, value);
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

    // For COD, no validation needed
    if (formData.payment.method === 'cod') {
      onNext();
      return;
    }

    // Validate bank transfer fields
    const newErrors = {};
    
    if (!formData.payment.receiptImage && !formData.payment.receiptPreview) {
      newErrors.receiptImage = 'Please upload payment receipt';
    }
    
    const transactionIdError = validateField('transactionId', formData.payment.transactionId);
    if (transactionIdError) newErrors.transactionId = transactionIdError;
    
    const transactionDateError = validateField('transactionDate', formData.payment.transactionDate);
    if (transactionDateError) newErrors.transactionDate = transactionDateError;

    setErrors(newErrors);
    setTouched({
      receiptImage: true,
      transactionId: true,
      transactionDate: true
    });

    // If no errors, proceed
    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
        <p className="mt-2 text-gray-600">
          Choose your preferred payment method
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method Selection */}
        <div className="space-y-4">
          {/* Bank Transfer Option */}
          <div
            onClick={() => handleMethodChange('bank-transfer')}
            className={`
              border-2 rounded-lg p-5 cursor-pointer transition-all
              ${formData.payment.method === 'bank-transfer'
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-start gap-4">
              <input
                type="radio"
                name="paymentMethod"
                value="bank-transfer"
                checked={formData.payment.method === 'bank-transfer'}
                onChange={() => handleMethodChange('bank-transfer')}
                className="mt-1 w-5 h-5 text-purple-600 focus:ring-purple-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <h3 className="font-semibold text-gray-900">Bank Transfer / Mobile Payment</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Transfer to our JazzCash or Raast ID and upload receipt
                </p>
              </div>
            </div>
          </div>

          {/* COD Option */}
          <div
            onClick={() => handleMethodChange('cod')}
            className={`
              border-2 rounded-lg p-5 cursor-pointer transition-all
              ${formData.payment.method === 'cod'
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-start gap-4">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={formData.payment.method === 'cod'}
                onChange={() => handleMethodChange('cod')}
                className="mt-1 w-5 h-5 text-purple-600 focus:ring-purple-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="font-semibold text-gray-900">Cash on Delivery</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Pay with cash when your order is delivered
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Transfer Details (shown when bank-transfer is selected) */}
        {formData.payment.method === 'bank-transfer' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Bank Account Details */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Transfer to Any of These Accounts
              </h3>
              
              <div className="space-y-4">
                {bankDetails.map((bank, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 flex-shrink-0">
                        {bank.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-500">{bank.method}</p>
                        <p className="text-lg font-bold text-gray-900 mt-0.5">{bank.accountTitle}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-purple-600 font-mono font-semibold">{bank.accountNumber}</p>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(bank.accountNumber);
                              alert('Account number copied!');
                            }}
                            className="p-1 hover:bg-purple-100 rounded transition-colors"
                            title="Copy account number"
                          >
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>
                    <strong>Important:</strong> After making the transfer, please upload the payment receipt screenshot below. Your order will be processed after payment verification.
                  </span>
                </p>
              </div>
            </div>

            {/* Receipt Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Payment Receipt <span className="text-red-500">*</span>
              </label>
              
              {!formData.payment.receiptPreview ? (
                <div
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                    transition-all
                    ${isDragging 
                      ? 'border-purple-500 bg-purple-50' 
                      : errors.receiptImage && touched.receiptImage
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                    }
                  `}
                >
                  <svg className="mx-auto w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-semibold text-purple-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG or JPEG (MAX. 5MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={formData.payment.receiptPreview}
                    alt="Payment receipt"
                    className="w-full max-w-md mx-auto rounded-lg shadow-md"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveReceipt}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full
                      hover:bg-red-600 transition-colors shadow-lg"
                    title="Remove receipt"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              {errors.receiptImage && touched.receiptImage && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.receiptImage}
                </p>
              )}
            </div>

            {/* Transaction Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Transaction ID */}
              <div>
                <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="transactionId"
                  name="transactionId"
                  value={formData.payment.transactionId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter transaction ID"
                  className={`
                    w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 
                    focus:border-transparent transition-all outline-none
                    ${errors.transactionId && touched.transactionId ? 'border-red-500' : 'border-gray-300'}
                  `}
                />
                {errors.transactionId && touched.transactionId && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.transactionId}
                  </p>
                )}
              </div>

              {/* Transaction Date */}
              <div>
                <label htmlFor="transactionDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="transactionDate"
                  name="transactionDate"
                  value={formData.payment.transactionDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  max={new Date().toISOString().split('T')[0]}
                  className={`
                    w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 
                    focus:border-transparent transition-all outline-none
                    ${errors.transactionDate && touched.transactionDate ? 'border-red-500' : 'border-gray-300'}
                  `}
                />
                {errors.transactionDate && touched.transactionDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.transactionDate}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* COD Information */}
        {formData.payment.method === 'cod' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-fadeIn">
            <div className="flex gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900">Cash on Delivery</p>
                <p className="text-sm text-blue-700 mt-1">
                  Please keep the exact amount ready. Our delivery partner will collect payment when your order arrives.
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  <strong>Note:</strong> COD orders may take 1-2 days longer to process.
                </p>
              </div>
            </div>
          </div>
        )}

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
            Review Order
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}