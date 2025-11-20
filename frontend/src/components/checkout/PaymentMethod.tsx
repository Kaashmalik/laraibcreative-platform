/**
 * Payment Method Component
 * Step 3 of checkout - Payment method selection with receipt upload
 * 
 * @module components/checkout/PaymentMethod
 */

'use client';

import { useState, useRef } from 'react';
import { CreditCard, Building2, Smartphone, Truck, Upload, X, AlertCircle, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { PaymentMethod, PaymentMethodOption } from '@/types/checkout';

interface PaymentMethodProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
  errors: Record<string, string>;
  total: number;
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    value: 'bank-transfer',
    label: 'Bank Transfer',
    icon: 'building',
    description: 'Transfer directly to our bank account',
    instructions: [
      'Transfer amount to our bank account',
      'Account: Allied Bank Limited',
      'Account Number: XXXX-XXXX-XXXX-XXXX',
      'Upload transaction receipt',
      'Enter transaction ID',
    ],
    note: 'Verification within 2-4 hours',
  },
  {
    value: 'jazzcash',
    label: 'JazzCash',
    icon: 'smartphone',
    description: 'Pay via JazzCash mobile wallet',
    instructions: [
      'Open JazzCash app',
      'Go to Send Money',
      'Enter Account: 03XX-XXXXXXX',
      'Complete transaction',
      'Upload screenshot',
      'Enter transaction ID',
    ],
    note: 'Verification within 2-4 hours',
  },
  {
    value: 'easypaisa',
    label: 'EasyPaisa',
    icon: 'smartphone',
    description: 'Pay via EasyPaisa mobile wallet',
    instructions: [
      'Open EasyPaisa app or visit retailer',
      'Select Send Money',
      'Mobile Account: 03XX-XXXXXXX',
      'Complete payment',
      'Upload receipt/screenshot',
      'Provide transaction reference',
    ],
    note: 'Verification within 2-4 hours',
  },
  {
    value: 'cod',
    label: 'Cash on Delivery',
    icon: 'truck',
    description: 'Pay 50% advance, rest on delivery',
    instructions: [
      'Pay 50% of total amount in advance',
      'Use Bank Transfer, JazzCash, or EasyPaisa',
      'Upload payment receipt',
      'Remaining 50% payable on delivery',
      'Order will ship after advance verification',
    ],
    note: 'Advance payment is mandatory',
  },
];

export default function PaymentMethod({
  formData,
  updateFormData,
  onNext,
  onBack,
  errors,
  total,
}: PaymentMethodProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    formData.payment?.method || 'bank-transfer'
  );
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [transactionId, setTransactionId] = useState(formData.payment?.transactionId || '');
  const [transactionDate, setTransactionDate] = useState(
    formData.payment?.transactionDate || new Date().toISOString().split('T')[0]
  );
  const [advanceAmount, setAdvanceAmount] = useState<number>(
    formData.payment?.advanceAmount || 0
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedMethodData = PAYMENT_METHODS.find(m => m.value === selectedMethod);

  /**
   * Handle payment method selection
   */
  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    updateFormData('payment.method', method);
    
    // Reset payment-specific fields
    setReceiptFile(null);
    setReceiptPreview('');
    setTransactionId('');
    updateFormData('payment.receiptImage', '');
    updateFormData('payment.transactionId', '');
    
    // For COD, calculate 50% advance
    if (method === 'cod') {
      const requiredAdvance = Math.round(total * 0.5);
      setAdvanceAmount(requiredAdvance);
      updateFormData('payment.advanceAmount', requiredAdvance);
      updateFormData('payment.remainingAmount', total - requiredAdvance);
    } else {
      setAdvanceAmount(0);
      updateFormData('payment.advanceAmount', undefined);
      updateFormData('payment.remainingAmount', undefined);
    }
  };

  /**
   * Handle receipt file selection
   */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload JPG, PNG, or PDF');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size too large. Maximum 5MB allowed');
      return;
    }

    setReceiptFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    // Upload to Cloudinary
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Upload receipt using upload endpoint
      const response = await api.upload.single(formData) as any;
      if (response.success) {
        updateFormData('payment.receiptImage', response.data.url);
        toast.success('Receipt uploaded successfully');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload receipt. Please try again.');
      setReceiptFile(null);
      setReceiptPreview('');
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Remove receipt
   */
  const handleRemoveReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview('');
    updateFormData('payment.receiptImage', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate based on payment method
    if (['bank-transfer', 'jazzcash', 'easypaisa'].includes(selectedMethod)) {
      if (!formData.payment?.receiptImage && !receiptFile) {
        toast.error('Please upload payment receipt');
        return;
      }
      if (!transactionId.trim()) {
        toast.error('Please enter transaction ID');
        return;
      }
    }

    if (selectedMethod === 'cod') {
      if (!formData.payment?.receiptImage && !receiptFile) {
        toast.error('Please upload advance payment receipt');
        return;
      }
      if (advanceAmount < total * 0.5) {
        toast.error('Advance payment must be at least 50% of total');
        return;
      }
    }

    // Update form data
    updateFormData('payment.transactionId', transactionId);
    updateFormData('payment.transactionDate', transactionDate);
    if (selectedMethod === 'cod') {
      updateFormData('payment.advanceAmount', advanceAmount);
      updateFormData('payment.remainingAmount', total - advanceAmount);
    }

    onNext();
  };

  /**
   * Get icon component
   */
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'building':
        return <Building2 className="w-6 h-6" />;
      case 'smartphone':
        return <Smartphone className="w-6 h-6" />;
      case 'truck':
        return <Truck className="w-6 h-6" />;
      default:
        return <CreditCard className="w-6 h-6" />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
        <p className="mt-2 text-gray-600">Choose your preferred payment option</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.value}
              type="button"
              onClick={() => handleMethodSelect(method.value)}
              className={`
                p-4 border-2 rounded-lg text-left transition-all
                ${selectedMethod === method.value
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  p-2 rounded-lg
                  ${selectedMethod === method.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {getIcon(method.icon)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{method.label}</h3>
                  <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                </div>
                {selectedMethod === method.value && (
                  <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Payment Instructions */}
        {selectedMethodData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2">{selectedMethodData.label} Instructions</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  {selectedMethodData.instructions?.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
                {selectedMethodData.note && (
                  <p className="mt-3 text-sm font-medium text-blue-900">
                    Note: {selectedMethodData.note}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Receipt Upload */}
        {selectedMethod !== 'cod' || (selectedMethod === 'cod' && advanceAmount > 0) ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedMethod === 'cod' ? 'Advance Payment Receipt' : 'Payment Receipt'} <span className="text-red-500">*</span>
            </label>
            
            {!receiptPreview && !formData.payment?.receiptImage ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="receipt-upload"
                />
                <label
                  htmlFor="receipt-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    Click to upload receipt
                  </span>
                  <span className="text-xs text-gray-500">
                    JPG, PNG, or PDF (Max 5MB)
                  </span>
                </label>
              </div>
            ) : (
              <div className="relative">
                {receiptPreview || formData.payment?.receiptImage ? (
                  <div className="border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      {receiptPreview ? (
                        <img
                          src={receiptPreview}
                          alt="Receipt preview"
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Receipt uploaded</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {receiptFile?.name || 'Receipt file'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveReceipt}
                        className="text-red-600 hover:text-red-700"
                        aria-label="Remove receipt"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
            {errors['payment.receiptImage'] && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors['payment.receiptImage']}
              </p>
            )}
            {isUploading && (
              <p className="mt-2 text-sm text-gray-600">Uploading...</p>
            )}
          </div>
        ) : null}

        {/* Transaction ID */}
        {selectedMethod !== 'cod' && (
          <div>
            <label htmlFor="transaction-id" className="block text-sm font-medium text-gray-700 mb-2">
              Transaction ID / Reference Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="transaction-id"
              value={transactionId}
              onChange={(e) => {
                setTransactionId(e.target.value);
                updateFormData('payment.transactionId', e.target.value);
              }}
              placeholder="Enter transaction ID"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {errors['payment.transactionId'] && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors['payment.transactionId']}
              </p>
            )}
          </div>
        )}

        {/* Transaction Date */}
        {selectedMethod !== 'cod' && (
          <div>
            <label htmlFor="transaction-date" className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Date
            </label>
            <input
              type="date"
              id="transaction-date"
              value={transactionDate}
              onChange={(e) => {
                setTransactionDate(e.target.value);
                updateFormData('payment.transactionDate', e.target.value);
              }}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        )}

        {/* COD Advance Payment */}
        {selectedMethod === 'cod' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-3">Advance Payment Required</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Total Amount:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Required Advance (50%):</span>
                <span className="font-semibold text-yellow-800">{formatCurrency(Math.round(total * 0.5))}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-yellow-200">
                <span className="text-gray-700">Payable on Delivery:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(Math.round(total * 0.5))}</span>
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="advance-amount" className="block text-sm font-medium text-gray-700 mb-2">
                Advance Amount Paid <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="advance-amount"
                value={advanceAmount}
                onChange={(e) => {
                  const amount = parseFloat(e.target.value) || 0;
                  setAdvanceAmount(amount);
                  updateFormData('payment.advanceAmount', amount);
                  updateFormData('payment.remainingAmount', total - amount);
                }}
                min={Math.round(total * 0.5)}
                max={total}
                step="0.01"
                placeholder="Enter advance amount"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {errors['payment.advanceAmount'] && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors['payment.advanceAmount']}
                </p>
              )}
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

