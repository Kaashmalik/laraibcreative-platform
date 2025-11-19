import React, { useState } from 'react';
import {
  ZoomIn, ZoomOut, Download, RotateCw, Check, X,
  AlertCircle, Clock, User, Calendar, DollarSign, Building,
  MessageCircle, ChevronRight
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Textarea from '@/components/ui/Textarea';
import Badge from '@/components/ui/Badge';
import Dialog from '@/components/ui/Dialog';
import Alert from '@/components/ui/Alert';

/**
 * PaymentVerification Component
 * Interface for verifying bank transfer payments
 * 
 * @component
 * @param {Object} order - Order object
 * @param {string} receiptImage - Receipt image URL
 * @param {Object} transactionDetails - Transaction information
 * @param {Function} onApprove - Approve payment callback
 * @param {Function} onReject - Reject payment callback
 * @param {Function} onRequestInfo - Request more info callback
 */
const PaymentVerification = ({
  order,
  receiptImage,
  transactionDetails,
  onApprove,
  onReject,
  onRequestInfo
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [notes, setNotes] = useState('');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  // Download receipt
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = receiptImage;
    link.download = `receipt-${order.orderNumber}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Validate notes for rejection
  const validateRejection = () => {
    if (!notes.trim()) {
      setErrors({ notes: 'Rejection reason is required' });
      return false;
    }
    return true;
  };

  // Handle approve payment
  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove({
        orderId: order.id,
        transactionId: transactionDetails.transactionId,
        notes: notes.trim()
      });
      setShowApproveDialog(false);
    } catch (error) {
      console.error('Failed to approve payment:', error);
      alert('Failed to approve payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle reject payment
  const handleReject = async () => {
    if (!validateRejection()) {
      return;
    }

    setIsProcessing(true);
    try {
      await onReject({
        orderId: order.id,
        transactionId: transactionDetails.transactionId,
        reason: notes.trim()
      });
      setShowRejectDialog(false);
    } catch (error) {
      console.error('Failed to reject payment:', error);
      alert('Failed to reject payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle request more info
  const handleRequestInfo = async () => {
    const message = window.prompt(
      'Enter message to send to customer:',
      'We need additional information about your payment. Please provide more details or a clearer receipt image.'
    );

    if (!message) return;

    setIsProcessing(true);
    try {
      await onRequestInfo({
        orderId: order.id,
        message: message.trim()
      });
    } catch (error) {
      console.error('Failed to request info:', error);
      alert('Failed to send request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if amount matches
  const amountMatches = transactionDetails.amount === order.total;
  const amountDifference = Math.abs(transactionDetails.amount - order.total);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Receipt Image Viewer - Left Side (60%) */}
      <div className="lg:col-span-3">
        <Card>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Payment Receipt
              </h2>
              
              {/* Image Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600 min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRotate}
                  aria-label="Rotate image"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  aria-label="Download receipt"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Image Display */}
          <div className="p-4 bg-gray-50">
            <div className="overflow-auto max-h-[600px] bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-center min-h-[400px] p-4">
                <img
                  src={receiptImage}
                  alt="Payment receipt"
                  className="max-w-full h-auto transition-transform"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: 'center'
                  }}
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Details and Actions - Right Side (40%) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Order Information */}
        <Card>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Order Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-medium text-gray-900">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium text-gray-900">{order.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Total:</span>
                <span className="font-bold text-gray-900">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Transaction Details */}
        <Card>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Transaction Details</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                  <Calendar className="w-3 h-3" />
                  Transaction ID
                </div>
                <p className="font-mono text-sm text-gray-900 break-all">
                  {transactionDetails.transactionId}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                  <Clock className="w-3 h-3" />
                  Transaction Date
                </div>
                <p className="text-sm text-gray-900">
                  {formatDate(transactionDetails.date)}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                  <DollarSign className="w-3 h-3" />
                  Amount
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(transactionDetails.amount)}
                  </p>
                  {amountMatches ? (
                    <Badge variant="success" size="sm">
                      <Check className="w-3 h-3 mr-1" />
                      Matches
                    </Badge>
                  ) : (
                    <Badge variant="error" size="sm">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Mismatch: {formatCurrency(amountDifference)}
                    </Badge>
                  )}
                </div>
              </div>

              {transactionDetails.bankAccount && (
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                    <Building className="w-3 h-3" />
                    Bank Account
                  </div>
                  <p className="text-sm text-gray-900">
                    {transactionDetails.bankAccount}
                  </p>
                </div>
              )}
            </div>

            {/* Amount Mismatch Warning */}
            {!amountMatches && (
              <Alert variant="warning" className="mt-4">
                <AlertCircle className="w-4 h-4" />
                <div>
                  <p className="font-medium text-sm">Amount Mismatch Detected</p>
                  <p className="text-xs mt-1">
                    The transaction amount differs from the order total. Please verify before approving.
                  </p>
                </div>
              </Alert>
            )}
          </div>
        </Card>

        {/* Verification Notes */}
        <Card>
          <div className="p-4">
            <label htmlFor="verificationNotes" className="block font-semibold text-gray-900 mb-2">
              Verification Notes
              {showRejectDialog && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Textarea
              id="verificationNotes"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setErrors({});
              }}
              placeholder={
                showRejectDialog
                  ? 'Enter reason for rejection (required)...'
                  : 'Add notes about this verification (optional)...'
              }
              rows={4}
              maxLength={500}
              error={errors.notes}
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {notes.length}/500 characters
            </p>
          </div>
        </Card>

        {/* Verification History */}
        {transactionDetails.verificationHistory?.length > 0 && (
          <Card>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Verification History</h3>
              <div className="space-y-3">
                {transactionDetails.verificationHistory.map((entry, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {entry.verifiedBy}
                        </span>
                      </div>
                      <Badge
                        variant={entry.action === 'APPROVED' ? 'success' : 'error'}
                        size="sm"
                      >
                        {entry.action}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      {formatDate(entry.timestamp)}
                    </p>
                    {entry.notes && (
                      <p className="text-sm text-gray-700 mt-2">{entry.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <Card>
          <div className="p-4 space-y-3">
            <Button
              variant="success"
              className="w-full"
              onClick={() => setShowApproveDialog(true)}
              disabled={isProcessing}
            >
              <Check className="w-4 h-4 mr-2" />
              Approve Payment
            </Button>

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowRejectDialog(true)}
              disabled={isProcessing}
            >
              <X className="w-4 h-4 mr-2" />
              Reject Payment
            </Button>

            <Button
              variant="warning"
              className="w-full"
              onClick={handleRequestInfo}
              disabled={isProcessing}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Request More Info
            </Button>
          </div>
        </Card>
      </div>

      {/* Approve Confirmation Dialog */}
      <Dialog
        isOpen={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        title="Approve Payment"
      >
        <div className="space-y-4">
          <Alert variant="success">
            <Check className="w-5 h-5" />
            <div>
              <p className="font-medium">Confirm Payment Approval</p>
              <p className="text-sm mt-1">
                This will mark the payment as verified and move the order to the next stage.
              </p>
            </div>
          </Alert>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order:</span>
              <span className="font-medium text-gray-900">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(transactionDetails.amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-mono text-xs text-gray-900 break-all">
                {transactionDetails.transactionId}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleApprove}
              disabled={isProcessing}
              isLoading={isProcessing}
            >
              {isProcessing ? 'Approving...' : 'Confirm Approval'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog
        isOpen={showRejectDialog}
        onClose={() => setShowRejectDialog(false)}
        title="Reject Payment"
      >
        <div className="space-y-4">
          <Alert variant="error">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-medium">Confirm Payment Rejection</p>
              <p className="text-sm mt-1">
                This will notify the customer that their payment was rejected. Please provide a clear reason.
              </p>
            </div>
          </Alert>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setErrors({});
              }}
              placeholder="Enter reason for rejection..."
              rows={3}
              error={errors.notes}
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setErrors({});
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing}
              isLoading={isProcessing}
            >
              {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default PaymentVerification;