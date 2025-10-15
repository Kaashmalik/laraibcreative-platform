'use client';

import { useState } from 'react';
import { X, CheckCircle, Package, Clock, Truck, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * Status Update Modal Component
 * Allows admin to update order status with workflow
 * Includes status progression and notification options
 */
export default function StatusUpdateModal({ currentStatus, orderId, onClose, onUpdate }) {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [note, setNote] = useState('');
  const [sendNotification, setSendNotification] = useState(true);
  const [assignTailor, setAssignTailor] = useState('');
  const [estimatedDate, setEstimatedDate] = useState('');
  const [updating, setUpdating] = useState(false);

  // Status workflow configuration
  const statusFlow = [
    {
      id: 'order-received',
      label: 'Order Received',
      description: 'Order has been received and is being processed',
      icon: Package,
      color: 'blue',
      disabled: false
    },
    {
      id: 'payment-verified',
      label: 'Payment Verified',
      description: 'Payment has been confirmed',
      icon: CheckCircle,
      color: 'green',
      disabled: false
    },
    {
      id: 'in-progress',
      label: 'In Progress',
      description: 'Stitching work has started',
      icon: Clock,
      color: 'blue',
      disabled: false,
      requiresTailor: true
    },
    {
      id: 'quality-check',
      label: 'Quality Check',
      description: 'Order is being inspected for quality',
      icon: CheckCircle,
      color: 'purple',
      disabled: false
    },
    {
      id: 'ready-dispatch',
      label: 'Ready for Dispatch',
      description: 'Order is packed and ready to ship',
      icon: Package,
      color: 'teal',
      disabled: false
    },
    {
      id: 'out-delivery',
      label: 'Out for Delivery',
      description: 'Order is with courier service',
      icon: Truck,
      color: 'indigo',
      disabled: false
    },
    {
      id: 'delivered',
      label: 'Delivered',
      description: 'Order has been delivered to customer',
      icon: Home,
      color: 'green',
      disabled: false
    }
  ];

  // Get color classes for status
  const getColorClasses = (color, isSelected) => {
    const colorMap = {
      blue: isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300',
      green: isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300',
      purple: isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300',
      teal: isSelected ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-300',
      indigo: isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
    };
    return colorMap[color] || colorMap.blue;
  };

  // Get icon color
  const getIconColor = (color, isSelected) => {
    const colorMap = {
      blue: isSelected ? 'text-blue-600' : 'text-gray-400',
      green: isSelected ? 'text-green-600' : 'text-gray-400',
      purple: isSelected ? 'text-purple-600' : 'text-gray-400',
      teal: isSelected ? 'text-teal-600' : 'text-gray-400',
      indigo: isSelected ? 'text-indigo-600' : 'text-gray-400'
    };
    return colorMap[color] || colorMap.blue;
  };

  // Handle status update
  const handleUpdate = async () => {
    if (!selectedStatus) {
      alert('Please select a status');
      return;
    }

    // Validation for specific statuses
    const selectedStatusObj = statusFlow.find(s => s.id === selectedStatus);
    if (selectedStatusObj?.requiresTailor && !assignTailor.trim()) {
      alert('Please assign a tailor for in-progress orders');
      return;
    }

    setUpdating(true);
    try {
      // Call parent update handler
      await onUpdate(selectedStatus, note, {
        assignedTailor: assignTailor || undefined,
        estimatedCompletion: estimatedDate || undefined,
        sendNotification
      });
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Update Order Status</h2>
            <p className="text-sm text-gray-600 mt-1">
              Current Status: <span className="font-medium text-gray-900 capitalize">
                {currentStatus.replace('-', ' ')}
              </span>
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
          {/* Status Selection */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Select New Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {statusFlow.map((status) => {
                const Icon = status.icon;
                const isSelected = selectedStatus === status.id;
                const isCurrent = currentStatus === status.id;
                
                return (
                  <button
                    key={status.id}
                    onClick={() => setSelectedStatus(status.id)}
                    disabled={isCurrent}
                    className={`
                      p-4 rounded-lg border-2 text-left transition-all duration-200
                      ${isCurrent ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-50' :
                        getColorClasses(status.color, isSelected)}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-6 h-6 flex-shrink-0 ${
                        isCurrent ? 'text-gray-400' : getIconColor(status.color, isSelected)
                      }`} />
                      <div className="flex-1">
                        <p className={`font-semibold mb-1 ${
                          isCurrent ? 'text-gray-600' : isSelected ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {status.label}
                          {isCurrent && <span className="ml-2 text-xs">(Current)</span>}
                        </p>
                        <p className="text-xs text-gray-500">{status.description}</p>
                      </div>
                      {isSelected && (
                        <div className="flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-purple-600" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Fields Based on Status */}
          {selectedStatus === 'in-progress' && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3">Additional Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-1">
                    Assign Tailor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={assignTailor}
                    onChange={(e) => setAssignTailor(e.target.value)}
                    placeholder="Enter tailor name"
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-1">
                    Estimated Completion Date
                  </label>
                  <input
                    type="date"
                    value={estimatedDate}
                    onChange={(e) => setEstimatedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedStatus === 'out-delivery' && (
            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <h4 className="font-semibold text-indigo-900 mb-2">Delivery Information</h4>
              <p className="text-sm text-indigo-800 mb-3">
                Make sure tracking information has been added before updating to this status.
              </p>
            </div>
          )}

          {selectedStatus === 'delivered' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">⭐ Order Completion</h4>
              <p className="text-sm text-green-800">
                This will mark the order as completed. Customer will be notified and asked for feedback.
              </p>
            </div>
          )}

          {/* Status Note */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Update Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any additional information about this status update..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              This note will be visible in the order timeline
            </p>
          </div>

          {/* Notification Settings */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="sendNotification"
                checked={sendNotification}
                onChange={(e) => setSendNotification(e.target.checked)}
                className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <div className="flex-1">
                <label htmlFor="sendNotification" className="font-medium text-gray-900 cursor-pointer">
                  Send Customer Notification
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Customer will receive email and WhatsApp notification about this status update
                </p>
              </div>
            </div>
          </div>

          {/* Preview */}
          {selectedStatus && (
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Preview</h4>
              <div className="text-sm text-purple-800">
                <p className="mb-2">
                  <span className="font-medium">Status will change from:</span>{' '}
                  <span className="capitalize">{currentStatus.replace('-', ' ')}</span>
                </p>
                <p className="mb-2">
                  <span className="font-medium">To:</span>{' '}
                  <span className="capitalize">{selectedStatus.replace('-', ' ')}</span>
                </p>
                {note && (
                  <p className="mb-2">
                    <span className="font-medium">Note:</span> {note}
                  </p>
                )}
                {assignTailor && (
                  <p className="mb-2">
                    <span className="font-medium">Assigned to:</span> {assignTailor}
                  </p>
                )}
                {estimatedDate && (
                  <p className="mb-2">
                    <span className="font-medium">Est. Completion:</span>{' '}
                    {new Date(estimatedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}
                <p>
                  <span className="font-medium">Customer Notification:</span>{' '}
                  {sendNotification ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!selectedStatus || updating || selectedStatus === currentStatus}
              className="min-w-[140px]"
            >
              {updating ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}