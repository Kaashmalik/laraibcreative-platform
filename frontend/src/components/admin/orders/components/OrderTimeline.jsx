import React, { useState } from 'react';
import {
  CheckCircle, Clock, Package, Truck, Home, XCircle,
  ChevronDown, ChevronUp, User, FileText, Edit, Trash2,
  Download, Plus
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/formatters';
import { ORDER_STATUS } from '@/lib/constants';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import Textarea from '@/components/ui/Textarea';

/**
 * OrderTimeline Component
 * Visual timeline of order status changes (Enhanced admin version)
 * 
 * @component
 * @param {Array} statusHistory - Array of status change objects
 * @param {boolean} isAdmin - Whether this is admin view (shows extra features)
 * @param {Function} onAddStatus - Callback to add manual status (admin only)
 * @param {Function} onEditNote - Callback to edit status note (admin only)
 * @param {Function} onDeleteStatus - Callback to delete status (admin only)
 * @param {Function} onExportPDF - Callback to export timeline as PDF
 */
const OrderTimeline = ({
  statusHistory = [],
  isAdmin = false,
  onAddStatus,
  onEditNote,
  onDeleteStatus,
  onExportPDF
}) => {
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Toggle expanded state for an item
  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  // Get icon for status
  const getStatusIcon = (status) => {
    const icons = {
      PENDING_PAYMENT: Clock,
      PAYMENT_VERIFIED: CheckCircle,
      IN_PROGRESS: Package,
      READY_FOR_DELIVERY: Package,
      SHIPPED: Truck,
      DELIVERED: Home,
      CANCELLED: XCircle,
      REFUNDED: XCircle
    };
    return icons[status] || Clock;
  };

  // Get color classes for status
  const getStatusColors = (status) => {
    const colors = {
      PENDING_PAYMENT: {
        bg: 'bg-yellow-100',
        border: 'border-yellow-400',
        icon: 'text-yellow-600',
        line: 'bg-yellow-300'
      },
      PAYMENT_VERIFIED: {
        bg: 'bg-blue-100',
        border: 'border-blue-400',
        icon: 'text-blue-600',
        line: 'bg-blue-300'
      },
      IN_PROGRESS: {
        bg: 'bg-indigo-100',
        border: 'border-indigo-400',
        icon: 'text-indigo-600',
        line: 'bg-indigo-300'
      },
      READY_FOR_DELIVERY: {
        bg: 'bg-purple-100',
        border: 'border-purple-400',
        icon: 'text-purple-600',
        line: 'bg-purple-300'
      },
      SHIPPED: {
        bg: 'bg-blue-100',
        border: 'border-blue-400',
        icon: 'text-blue-600',
        line: 'bg-blue-300'
      },
      DELIVERED: {
        bg: 'bg-green-100',
        border: 'border-green-400',
        icon: 'text-green-600',
        line: 'bg-green-300'
      },
      CANCELLED: {
        bg: 'bg-red-100',
        border: 'border-red-400',
        icon: 'text-red-600',
        line: 'bg-red-300'
      },
      REFUNDED: {
        bg: 'bg-gray-100',
        border: 'border-gray-400',
        icon: 'text-gray-600',
        line: 'bg-gray-300'
      }
    };
    return colors[status] || colors.PENDING_PAYMENT;
  };

  return (
    <div className="relative">
      {/* Admin Actions Header */}
      {isAdmin && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">
            Status History ({statusHistory.length} updates)
          </h3>
          <div className="flex gap-2">
            {onExportPDF && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportPDF}
              >
                <Download className="w-4 h-4 mr-1" />
                Export PDF
              </Button>
            )}
            {onAddStatus && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Status
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-0">
        {statusHistory.map((item, index) => {
          const Icon = getStatusIcon(item.status);
          const colors = getStatusColors(item.status);
          const isExpanded = expandedItems.has(index);
          const hasNote = item.note && item.note.trim();
          const isLast = index === statusHistory.length - 1;

          return (
            <div key={index} className="relative">
              {/* Timeline Line */}
              {!isLast && (
                <div
                  className={`absolute left-6 top-12 w-0.5 h-full ${colors.line}`}
                  style={{ transform: 'translateX(-50%)' }}
                />
              )}

              {/* Timeline Item */}
              <div className="relative flex gap-4 pb-8">
                {/* Icon */}
                <div
                  className={`
                    flex-shrink-0 w-12 h-12 rounded-full border-4
                    ${colors.bg} ${colors.border}
                    flex items-center justify-center z-10
                  `}
                >
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Status and Timestamp */}
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {ORDER_STATUS[item.status]}
                        </h4>
                        {index === 0 && (
                          <Badge variant="blue" size="sm">Latest</Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
                        <span>{formatRelativeTime(item.timestamp)}</span>
                        <span className="text-gray-400">•</span>
                        <span>{formatDate(item.timestamp)}</span>
                      </div>

                      {/* Changed By (Admin Only) */}
                      {isAdmin && item.changedBy && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <User className="w-4 h-4" />
                          <span>
                            {item.changedBy.name}
                            {item.changedBy.role && (
                              <Badge variant="gray" size="sm" className="ml-2">
                                {item.changedBy.role}
                              </Badge>
                            )}
                          </span>
                        </div>
                      )}

                      {/* Note */}
                      {hasNote && (
                        <div className="mt-3">
                          {isExpanded || item.note.length <= 100 ? (
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <div className="flex items-start gap-2">
                                <FileText className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-700 whitespace-pre-wrap flex-1">
                                  {item.note}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <div className="flex items-start gap-2">
                                <FileText className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-700">
                                  {item.note.substring(0, 100)}...
                                </p>
                              </div>
                            </div>
                          )}

                          {item.note.length > 100 && (
                            <button
                              onClick={() => toggleExpanded(index)}
                              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-4 h-4" />
                                  Show less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4" />
                                  Show more
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && (
                      <div className="flex gap-1">
                        {onEditNote && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingNote(item)}
                            title="Edit note"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {onDeleteStatus && statusHistory.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(item)}
                            title="Delete status"
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {statusHistory.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No status updates yet</p>
        </div>
      )}

      {/* Add Status Dialog */}
      {showAddDialog && onAddStatus && (
        <AddStatusDialog
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onAdd={onAddStatus}
        />
      )}

      {/* Edit Note Dialog */}
      {editingNote && onEditNote && (
        <EditNoteDialog
          isOpen={!!editingNote}
          item={editingNote}
          onClose={() => setEditingNote(null)}
          onSave={onEditNote}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && onDeleteStatus && (
        <Dialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Delete Status Entry"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete this status entry? This action cannot be undone.
            </p>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-900">
                {ORDER_STATUS[deleteConfirm.status]}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {formatDate(deleteConfirm.timestamp)}
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onDeleteStatus(deleteConfirm);
                  setDeleteConfirm(null);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

// Add Status Dialog Component
const AddStatusDialog = ({ isOpen, onClose, onAdd }) => {
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!status) return;

    setIsSubmitting(true);
    try {
      await onAdd({ status, note: note.trim() });
      onClose();
    } catch (error) {
      console.error('Failed to add status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add Manual Status">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select status...</option>
            {Object.entries(ORDER_STATUS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note (Optional)
          </label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note about this status..."
            rows={3}
            maxLength={500}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
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
            disabled={!status || isSubmitting}
            isLoading={isSubmitting}
          >
            Add Status
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

// Edit Note Dialog Component
const EditNoteDialog = ({ isOpen, item, onClose, onSave }) => {
  const [note, setNote] = useState(item.note || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      await onSave({ ...item, note: note.trim() });
      onClose();
    } catch (error) {
      console.error('Failed to update note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Edit Status Note">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-gray-900">
            {ORDER_STATUS[item.status]}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {formatDate(item.timestamp)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note
          </label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter note..."
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {note.length}/500 characters
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
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
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default OrderTimeline;