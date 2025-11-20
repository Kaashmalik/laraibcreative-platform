/**
 * PaymentVerification Component
 * Modal for verifying payment with receipt review
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import Input from '@/components/ui/Input';
import type { Order, PaymentVerificationRequest } from '@/types/order-management';

interface PaymentVerificationProps {
  isOpen: boolean;
  order: Order;
  onClose: () => void;
  onVerify: (data: PaymentVerificationRequest) => Promise<void>;
}

export default function PaymentVerification({
  isOpen,
  order,
  onClose,
  onVerify,
}: PaymentVerificationProps) {
  const [verified, setVerified] = useState<boolean | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [transactionId, setTransactionId] = useState(order.payment.transactionId || '');
  const [transactionDate, setTransactionDate] = useState(
    order.payment.transactionDate 
      ? new Date(order.payment.transactionDate).toISOString().split('T')[0]
      : ''
  );
  const [amountPaid, setAmountPaid] = useState(
    order.payment.amountPaid?.toString() || order.pricing.total.toString()
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);

  if (!isOpen) return null;

  const receiptImage = order.payment.receiptImage?.url || order.payment.receiptImage;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (verified === null) {
      setError('Please verify or reject the payment');
      return;
    }

    if (verified && !transactionId.trim()) {
      setError('Transaction ID is required for verification');
      return;
    }

    setIsProcessing(true);
    try {
      await onVerify({
        verified: verified === true,
        verificationNotes: verificationNotes.trim() || undefined,
        transactionId: transactionId.trim() || undefined,
        transactionDate: transactionDate ? new Date(transactionDate) : undefined,
        amountPaid: verified ? Number(amountPaid) : undefined,
      });
      onClose();
      // Reset form
      setVerified(null);
      setVerificationNotes('');
    } catch (err: any) {
      setError(err.message || 'Failed to verify payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Payment Verification
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Order #{order.orderNumber} • {order.payment.method.replace('-', ' ').toUpperCase()}
            </p>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            {/* Payment Details */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Payment Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Order Total</p>
                  <p className="text-lg font-bold text-gray-900">
                    Rs. {order.pricing.total.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {order.payment.method.replace('-', ' ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Receipt Image */}
            {receiptImage && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900">Payment Receipt</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReceipt(!showReceipt)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {showReceipt ? 'Hide' : 'View'} Receipt
                  </Button>
                </div>
                {showReceipt && (
                  <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={receiptImage}
                      alt="Payment Receipt"
                      fill
                      sizes="(max-width: 768px) 100vw, 600px"
                      className="object-contain"
                      quality={90}
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPg=="
                    />
                  </div>
                )}
              </div>
            )}

            {/* Verification Options */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Verification Decision</h4>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setVerified(true)}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    verified === true
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <CheckCircle className={`w-6 h-6 mx-auto mb-2 ${
                    verified === true ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <p className="text-sm font-medium text-gray-900">Verify Payment</p>
                  <p className="text-xs text-gray-500 mt-1">Payment is valid</p>
                </button>

                <button
                  type="button"
                  onClick={() => setVerified(false)}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    verified === false
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <XCircle className={`w-6 h-6 mx-auto mb-2 ${
                    verified === false ? 'text-red-600' : 'text-gray-400'
                  }`} />
                  <p className="text-sm font-medium text-gray-900">Reject Payment</p>
                  <p className="text-xs text-gray-500 mt-1">Payment is invalid</p>
                </button>
              </div>
            </div>

            {/* Transaction Details (if verifying) */}
            {verified === true && (
              <div className="mb-6 space-y-4">
                <h4 className="text-sm font-semibold text-gray-900">Transaction Details</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction Date
                    </label>
                    <Input
                      type="date"
                      value={transactionDate}
                      onChange={(e) => setTransactionDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount Paid (PKR)
                    </label>
                    <Input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Verification Notes */}
            <div className="mb-6">
              <Textarea
                label={`Verification Notes ${verified === false ? '*' : ''}`}
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder={
                  verified === true
                    ? "Add any notes about this verification..."
                    : verified === false
                    ? "Please explain why payment is rejected..."
                    : "Add verification notes..."
                }
                rows={3}
                required={verified === false}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {verificationNotes.length}/500 characters
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isProcessing || verified === null}
                className={`flex items-center gap-2 ${
                  verified === false ? 'bg-red-600 hover:bg-red-700' : ''
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : verified === true ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Verify Payment
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Reject Payment
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

