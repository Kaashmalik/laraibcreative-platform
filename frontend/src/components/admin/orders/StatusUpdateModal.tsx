/**
 * StatusUpdateModal Component
 * Modal for updating order status with confirmation
 */

'use client';

import { useState } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import type { OrderStatus, StatusUpdateRequest } from '@/types/order-management';

interface StatusUpdateModalProps {
  isOpen: boolean;
  currentStatus: OrderStatus;
  orderNumber: string;
  onClose: () => void;
  onUpdate: (data: StatusUpdateRequest) => Promise<void>;
}

const statusOptions: Array<{ value: OrderStatus; label: string; description?: string }> = [
  { value: 'pending-payment', label: 'Pending Payment', description: 'Waiting for payment verification' },
  { value: 'payment-verified', label: 'Payment Verified', description: 'Payment confirmed, ready to process' },
  { value: 'material-arranged', label: 'Material Arranged', description: 'Materials collected and ready' },
  { value: 'in-progress', label: 'In Progress', description: 'Order is being processed' },
  { value: 'quality-check', label: 'Quality Check', description: 'Quality inspection in progress' },
  { value: 'ready-dispatch', label: 'Ready for Dispatch', description: 'Order ready to ship' },
  { value: 'dispatched', label: 'Dispatched', description: 'Order shipped to customer' },
  { value: 'delivered', label: 'Delivered', description: 'Order delivered successfully' },
  { value: 'cancelled', label: 'Cancelled', description: 'Order has been cancelled' },
  { value: 'refunded', label: 'Refunded', description: 'Order refund processed' },
];

export default function StatusUpdateModal({
  isOpen,
  currentStatus,
  orderNumber,
  onClose,
  onUpdate,
}: StatusUpdateModalProps) {
  const [newStatus, setNewStatus] = useState<OrderStatus>(currentStatus);
  const [note, setNote] = useState('');
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newStatus === currentStatus) {
      setError('Please select a different status');
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate({
        status: newStatus,
        note: note.trim() || undefined,
        notifyCustomer,
      });
      onClose();
      setNote('');
      setNotifyCustomer(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const selectedStatus = statusOptions.find(s => s.value === newStatus);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Update Order Status
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Order #{orderNumber}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            {/* Current Status */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Status
              </label>
              <div className="px-3 py-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">
                  {statusOptions.find(s => s.value === currentStatus)?.label}
                </span>
              </div>
            </div>

            {/* New Status */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status <span className="text-red-500">*</span>
              </label>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                required
              >
                {statusOptions
                  .filter(option => option.value !== currentStatus)
                  .map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </Select>
              {selectedStatus?.description && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedStatus.description}
                </p>
              )}
            </div>

            {/* Note */}
            <div className="mb-4">
              <Textarea
                label="Internal Note (Optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about this status change..."
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {note.length}/500 characters
              </p>
            </div>

            {/* Notify Customer */}
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={notifyCustomer}
                  onChange={(e) => setNotifyCustomer(e.target.checked)}
                />
                <span className="text-sm text-gray-700">
                  Notify customer via email/WhatsApp
                </span>
              </label>
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
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating || newStatus === currentStatus}
                className="flex items-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Update Status
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

