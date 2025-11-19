import React, { useState } from 'react';
import { Eye, Phone, MessageCircle, MoreVertical, ChevronDown } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/formatters';
import { ORDER_STATUS } from '@/lib/constants';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import DropdownMenu from '@/components/ui/DropdownMenu';

/**
 * OrderCard Component
 * Displays compact order information in list view with quick actions
 * 
 * @component
 * @param {Object} order - Order data object
 * @param {Function} onViewDetails - Callback when view details is clicked
 * @param {Function} onUpdateStatus - Callback when status is updated
 */
const OrderCard = ({ order, onViewDetails, onUpdateStatus }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  // Handle phone call
  const handlePhoneCall = (e) => {
    e.stopPropagation();
    window.location.href = `tel:${order.customer.phone}`;
  };

  // Handle WhatsApp chat
  const handleWhatsAppChat = (e) => {
    e.stopPropagation();
    const message = encodeURIComponent(
      `Hello ${order.customer.name}, regarding your order ${order.orderNumber}`
    );
    const whatsappUrl = `https://wa.me/${order.customer.whatsapp || order.customer.phone}?text=${message}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(order.id, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
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

  // Get available status transitions
  const getAvailableStatuses = (currentStatus) => {
    const transitions = {
      PENDING_PAYMENT: ['PAYMENT_VERIFIED', 'CANCELLED'],
      PAYMENT_VERIFIED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['READY_FOR_DELIVERY', 'CANCELLED'],
      READY_FOR_DELIVERY: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: ['REFUNDED'],
      CANCELLED: [],
      REFUNDED: []
    };
    return transitions[currentStatus] || [];
  };

  const availableStatuses = getAvailableStatuses(order.status);

  return (
    <div
      onClick={() => onViewDetails(order.id)}
      className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onViewDetails(order.id)}
      aria-label={`View details for order ${order.orderNumber}`}
    >
      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-12 gap-4 items-center p-4">
        {/* Order Number - Col 2 */}
        <div className="col-span-2">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {order.orderNumber}
          </h3>
          {order.isCustomOrder && (
            <span className="inline-block mt-1 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
              Custom
            </span>
          )}
        </div>

        {/* Customer Info - Col 3 */}
        <div className="col-span-3">
          <p className="font-medium text-gray-900 mb-1">{order.customer.name}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePhoneCall}
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              aria-label={`Call ${order.customer.name}`}
            >
              <Phone className="w-3 h-3" />
              {order.customer.phone}
            </button>
            <button
              onClick={handleWhatsAppChat}
              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
              aria-label={`WhatsApp ${order.customer.name}`}
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Order Date - Col 2 */}
        <div className="col-span-2">
          <p className="text-sm text-gray-600">{formatRelativeTime(order.orderDate)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(order.orderDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>

        {/* Status - Col 2 */}
        <div className="col-span-2">
          <Badge variant={getStatusColor(order.status)}>
            {ORDER_STATUS[order.status] || order.status}
          </Badge>
        </div>

        {/* Total Amount - Col 2 */}
        <div className="col-span-2 text-right">
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(order.total)}
          </p>
          {order.paymentStatus && (
            <p className="text-xs text-gray-600 mt-1">
              {order.paymentStatus === 'PAID' ? '✓ Paid' : 'Pending'}
            </p>
          )}
        </div>

        {/* Actions - Col 1 */}
        <div className="col-span-1 flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(order.id);
            }}
            aria-label="View order details"
          >
            <Eye className="w-4 h-4" />
          </Button>

          {availableStatuses.length > 0 && (
            <DropdownMenu
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isUpdating}
                  aria-label="Update order status"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              }
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-1">
                {availableStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(status);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    {ORDER_STATUS[status]}
                  </button>
                ))}
              </div>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden p-4 space-y-3">
        {/* Header Row */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {order.orderNumber}
            </h3>
            {order.isCustomOrder && (
              <span className="inline-block mt-1 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                Custom Order
              </span>
            )}
          </div>
          <Badge variant={getStatusColor(order.status)} className="text-xs">
            {ORDER_STATUS[order.status]}
          </Badge>
        </div>

        {/* Customer Info */}
        <div className="space-y-1">
          <p className="font-medium text-gray-900">{order.customer.name}</p>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePhoneCall}
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <Phone className="w-3 h-3" />
              {order.customer.phone}
            </button>
            <button
              onClick={handleWhatsAppChat}
              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Date and Amount Row */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            {formatRelativeTime(order.orderDate)}
          </p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(order.total)}
          </p>
        </div>

        {/* Actions Row */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(order.id);
            }}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Button>
          {availableStatuses.length > 0 && (
            <DropdownMenu
              trigger={
                <Button variant="outline" size="sm" disabled={isUpdating}>
                  <MoreVertical className="w-4 h-4" />
                </Button>
              }
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-1">
                {availableStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(status);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Update to: {ORDER_STATUS[status]}
                  </button>
                ))}
              </div>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;