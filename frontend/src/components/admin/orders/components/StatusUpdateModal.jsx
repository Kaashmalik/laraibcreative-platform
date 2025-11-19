import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Send, Mail, MessageCircle } from 'lucide-react';
import { ORDER_STATUS } from '@/lib/constants';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Checkbox from '@/components/ui/Checkbox';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';

/**
 * StatusUpdateModal Component
 * Modal for updating order status with notification options
 * 
 * @component
 * @param {boolean} isOpen - Modal visibility state
 * @param {Function} onClose - Close modal callback
 * @param {string} currentStatus - Current order status
 * @param {Array} availableStatuses - List of valid next statuses
 * @param {Object} order - Order object for context
 * @param {Function} onUpdate - Update callback
 */
const StatusUpdateModal = ({
  isOpen,
  onClose,
  currentStatus,
  availableStatuses = [],
  order,
  onUpdate
}) => {
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setNewStatus('');
      setNote('');
      setNotifyWhatsApp(true);
      setNotifyEmail(true);
      setErrors({});
    }
  }, [isOpen]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!newStatus) {
      newErrors.status = 'Please select a new status';
    }

    if (newStatus === currentStatus) {
      newErrors.status = 'New status must be different from current status';
    }

    if (newStatus === 'CANCELLED' && !note.trim()) {
      newErrors.note = 'Cancellation reason is required';
    }

    if (newStatus === 'REFUNDED' && !note.trim()) {
      newErrors.note = 'Refund reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onUpdate({
        orderId: order.id,
        newStatus,
        note: note.trim(),
        notifyWhatsApp,
        notifyEmail
      });

      onClose();
    } catch (error) {
      setErrors({
        submit: error.message || 'Failed to update order status'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get notification preview message
  const getNotificationPreview = () => {
    if (!newStatus) return null;

    const statusMessages = {
      PAYMENT_VERIFIED: `Great news! Your payment for order ${order?.orderNumber} has been verified. We'll start working on your order shortly.`,
      IN_PROGRESS: `Your order ${order?.orderNumber} is now in progress. Our team is working on it and we'll keep you updated.`,
      READY_FOR_DELIVERY: `Good news! Your order ${order?.orderNumber} is ready for delivery. It will be shipped soon.`,
      SHIPPED: `Your order ${order?.orderNumber} has been shipped! Track your delivery at: [tracking-link]`,
      DELIVERED: `Your order ${order?.orderNumber} has been delivered. Thank you for shopping with LaraibCreative! We hope you love your purchase.`,
      CANCELLED: `Your order ${order?.orderNumber} has been cancelled. ${note || 'Please contact us if you have any questions.'}`,
      REFUNDED: `Your refund for order ${order?.orderNumber} has been processed. ${note || 'The amount will be credited to your account within 5-7 business days.'}`
    };

    return statusMessages[newStatus] || `Your order ${order?.orderNumber} status has been updated to ${ORDER_STATUS[newStatus]}.`;
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      PENDING_PAYMENT: 'warning',
      PAYMENT_VERIFIED: 'info',
      IN_PROGRESS: 'blue',
      READY_FOR_DELIVERY: 'purple',
      SHIPPED: 'indigo',
      DELIVERED: 'success',
      CANCELLED: 'error',
      REFUNDED: 'gray'
    };
    return colors[status] || 'default';
  };

  // Check if status requires note
  const requiresNote = ['CANCELLED', 'REFUNDED'].includes(newStatus);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Order Status"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Status Display */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Status</p>
              <Badge variant={getStatusColor(currentStatus)} size="lg">
                {ORDER_STATUS[currentStatus]}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="font-semibold text-gray-900">{order?.orderNumber}</p>
            </div>
          </div>
        </div>

        {/* Status Selection Error */}
        {errors.submit && (
          <Alert variant="error">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.submit}</span>
          </Alert>
        )}

        {/* New Status Selection */}
        <div>
          <label htmlFor="newStatus" className="block text-sm font-medium text-gray-700 mb-2">
            New Status <span className="text-red-500">*</span>
          </label>
          <Select
            id="newStatus"
            value={newStatus}
            onChange={(e) => {
              setNewStatus(e.target.value);
              setErrors({ ...errors, status: null });
            }}
            options={[
              { value: '', label: 'Select new status...' },
              ...availableStatuses.map(status => ({
                value: status,
                label: ORDER_STATUS[status]
              }))
            ]}
            error={errors.status}
            disabled={isSubmitting}
          />
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status}</p>
          )}
        </div>

        {/* Note/Reason */}
        <div>
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
            Note {requiresNote && <span className="text-red-500">*</span>}
            <span className="text-gray-500 font-normal ml-1">
              ({requiresNote ? 'Required' : 'Optional'})
            </span>
          </label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setErrors({ ...errors, note: null });
            }}
            placeholder={
              newStatus === 'CANCELLED'
                ? 'Enter cancellation reason...'
                : newStatus === 'REFUNDED'
                ? 'Enter refund reason...'
                : 'Add a note about this status change (visible to customer if notifications are sent)...'
            }
            rows={3}
            maxLength={500}
            error={errors.note}
            disabled={isSubmitting}
          />
          <div className="flex items-center justify-between mt-1">
            {errors.note ? (
              <p className="text-sm text-red-600">{errors.note}</p>
            ) : (
              <p className="text-xs text-gray-500">
                {requiresNote ? 'This note will be sent to the customer' : 'Internal note'}
              </p>
            )}
            <span className="text-xs text-gray-500">
              {note.length}/500
            </span>
          </div>
        </div>

        {/* Notification Options */}
        {newStatus && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Notification Options</p>
            
            <div className="space-y-2">
              <Checkbox
                id="notifyWhatsApp"
                checked={notifyWhatsApp}
                onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                label={
                  <span className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    Send WhatsApp notification
                  </span>
                }
                disabled={isSubmitting}
              />

              <Checkbox
                id="notifyEmail"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
                label={
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    Send email notification
                  </span>
                }
                disabled={isSubmitting}
              />
            </div>

            {/* Notification Preview */}
            {(notifyWhatsApp || notifyEmail) && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Send className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 mb-2">
                      Preview Notification Message:
                    </p>
                    <p className="text-sm text-blue-800 whitespace-pre-wrap">
                      {getNotificationPreview()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Warning for critical statuses */}
        {['CANCELLED', 'REFUNDED'].includes(newStatus) && (
          <Alert variant="warning">
            <AlertCircle className="w-4 h-4" />
            <div>
              <p className="font-medium">Warning: This action is important</p>
              <p className="text-sm mt-1">
                {newStatus === 'CANCELLED'
                  ? 'Cancelling this order will stop all processing. Make sure to provide a clear reason for the customer.'
                  : 'Refunding this order will process a payment reversal. Ensure the refund amount and reason are correct.'}
              </p>
            </div>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant={['CANCELLED', 'REFUNDED'].includes(newStatus) ? 'destructive' : 'primary'}
            disabled={isSubmitting || !newStatus}
            isLoading={isSubmitting}
          >
            {isSubmitting
              ? 'Updating...'
              : ['CANCELLED', 'REFUNDED'].includes(newStatus)
              ? `Confirm ${ORDER_STATUS[newStatus]}`
              : 'Update Status'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StatusUpdateModal;