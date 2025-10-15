'use client';

import { useState } from 'react';
import { X, CheckCircle, XCircle, Download, ZoomIn, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * Payment Verification Component
 * Modal for verifying customer payment receipts
 * Allows admin to approve or reject payments with notes
 */
export default function PaymentVerification({ order, onClose, onVerify }) {
  const [action, setAction] = useState(null); // 'approve' or 'reject'
  const [note, setNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [imageZoomed, setImageZoomed] = useState(false);

  // Handle payment verification
  const handleVerify = async () => {
    if (!action) {
      alert('Please select approve or reject');
      return;
    }

    if (action === 'reject' && !note.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/orders/${order._id}/payment/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          action,
          note: note.trim(),
          transactionId: order.payment.transactionId
        })
      });

      if (!response.ok) throw new Error('Failed to verify payment');
      
      const data = await response.json();
      
      // Show success message
      alert(`Payment ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
      
      // Callback to refresh order data
      onVerify?.();
      onClose();
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Failed to verify payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Download receipt
  const handleDownload = () => {
    window.open(order.payment.receiptImage, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Verification</h2>
            <p className="text-sm text-gray-600 mt-1">
              Order: {order.orderNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Payment Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Payment Method:</span>
                <p className="font-medium text-gray-900 capitalize">
                  {order.payment.method.replace('-', ' ')}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Amount:</span>
                <p className="font-bold text-purple-600 text-lg">
                  Rs. {order.pricing.total.toLocaleString()}
                </p>
              </div>
              {order.payment.transactionId && (
                <div>
                  <span className="text-gray-600">Transaction ID:</span>
                  <p className="font-medium text-gray-900">{order.payment.transactionId}</p>
                </div>
              )}
              {order.payment.transactionDate && (
                <div>
                  <span className="text-gray-600">Transaction Date:</span>
                  <p className="font-medium text-gray-900">
                    {new Date(order.payment.transactionDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Customer Details</h3>
            <div className="text-sm text-blue-800">
              <p><span className="font-medium">Name:</span> {order.customerInfo.name}</p>
              <p><span className="font-medium">Phone:</span> {order.customerInfo.phone}</p>
              <p><span className="font-medium">Email:</span> {order.customerInfo.email}</p>
            </div>
          </div>

          {/* Payment Receipt */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Payment Receipt</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setImageZoomed(true)}
                  className="flex items-center gap-2"
                >
                  <ZoomIn className="w-4 h-4" />
                  Zoom
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownload}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </div>

            {order.payment.receiptImage ? (
              <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={order.payment.receiptImage}
                  alt="Payment Receipt"
                  className="w-full h-auto max-h-96 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setImageZoomed(true)}
                />
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No receipt uploaded</p>
              </div>
            )}
          </div>

          {/* Verification Guidelines */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Verification Guidelines
            </h4>
            <ul className="text-sm text-yellow-800 space-y-1 ml-5 list-disc">
              <li>Verify the transaction ID matches</li>
              <li>Check the amount is correct (Rs. {order.pricing.total.toLocaleString()})</li>
              <li>Ensure the date is recent and reasonable</li>
              <li>Look for clear bank/payment app branding</li>
              <li>Verify recipient account matches business account</li>
            </ul>
          </div>

          {/* Decision Buttons */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Verification Decision</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setAction('approve')}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200
                  ${action === 'approve'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-green-300'
                  }
                `}
              >
                <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${
                  action === 'approve' ? 'text-green-600' : 'text-gray-400'
                }`} />
                <p className={`font-semibold ${
                  action === 'approve' ? 'text-green-700' : 'text-gray-600'
                }`}>
                  Approve Payment
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Payment is verified and valid
                </p>
              </button>

              <button
                onClick={() => setAction('reject')}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200
                  ${action === 'reject'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-white hover:border-red-300'
                  }
                `}
              >
                <XCircle className={`w-8 h-8 mx-auto mb-2 ${
                  action === 'reject' ? 'text-red-600' : 'text-gray-400'
                }`} />
                <p className={`font-semibold ${
                  action === 'reject' ? 'text-red-700' : 'text-gray-600'
                }`}>
                  Reject Payment
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Payment is invalid or suspicious
                </p>
              </button>
            </div>
          </div>

          {/* Note/Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {action === 'reject' ? 'Rejection Reason (Required)' : 'Note (Optional)'}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={action === 'reject' 
                ? 'Explain why this payment is being rejected...'
                : 'Add any additional notes about this payment...'
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerify}
              disabled={!action || processing || (action === 'reject' && !note.trim())}
              className={`${
                action === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                action === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                ''
              }`}
            >
              {processing ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Processing...
                </>
              ) : action === 'approve' ? (
                'Approve & Notify Customer'
              ) : action === 'reject' ? (
                'Reject & Notify Customer'
              ) : (
                'Select an Action'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Zoomed Image Modal */}
      {imageZoomed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-[60] flex items-center justify-center p-4"
          onClick={() => setImageZoomed(false)}
        >
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setImageZoomed(false)}
              className="absolute -top-12 right-0 text-white text-3xl hover:text-gray-300 transition-colors"
            >
              ✕
            </button>
            <img
              src={order.payment.receiptImage}
              alt="Payment Receipt - Zoomed"
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}