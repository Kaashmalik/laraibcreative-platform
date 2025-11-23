'use client';


import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Phone, MessageCircle, Mail, MapPin, Package, 
  Clock, DollarSign, User, CheckCircle, XCircle,
  AlertCircle, ChevronRight, Eye, Printer
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

/**
 * Order Card Component
 * Displays order summary in the orders list
 * Shows key information and quick actions
 */
export default function OrderCard({ order, onUpdate }) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  // Status configuration with colors and icons
  const statusConfig = {
    'order-received': {
      label: 'Order Received',
      color: 'bg-blue-100 text-blue-700',
      icon: Package
    },
    'pending-payment': {
      label: 'Pending Payment',
      color: 'bg-orange-100 text-orange-700',
      icon: AlertCircle
    },
    'payment-verified': {
      label: 'Payment Verified',
      color: 'bg-green-100 text-green-700',
      icon: CheckCircle
    },
    'in-progress': {
      label: 'In Progress',
      color: 'bg-blue-100 text-blue-700',
      icon: Clock
    },
    'quality-check': {
      label: 'Quality Check',
      color: 'bg-purple-100 text-purple-700',
      icon: CheckCircle
    },
    'ready-dispatch': {
      label: 'Ready for Dispatch',
      color: 'bg-teal-100 text-teal-700',
      icon: Package
    },
    'out-delivery': {
      label: 'Out for Delivery',
      color: 'bg-indigo-100 text-indigo-700',
      icon: Package
    },
    'delivered': {
      label: 'Delivered',
      color: 'bg-green-100 text-green-700',
      icon: CheckCircle
    },
    'cancelled': {
      label: 'Cancelled',
      color: 'bg-red-100 text-red-700',
      icon: XCircle
    }
  };

  // Payment status configuration
  const paymentStatusConfig = {
    pending: { label: 'Pending', color: 'bg-orange-100 text-orange-700' },
    verified: { label: 'Verified', color: 'bg-green-100 text-green-700' },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-700' }
  };

  const currentStatus = statusConfig[order.status] || statusConfig['order-received'];
  const StatusIcon = currentStatus.icon;
  const paymentStatus = paymentStatusConfig[order.payment.status];

  // Format date helper
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency helper
  const formatCurrency = (amount) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  // Quick status update
  const handleQuickUpdate = async (newStatus) => {
    if (updating) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${order._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      // Show success toast
      onUpdate?.();
    } catch (error) {
      console.error('Error updating status:', error);
      // Show error toast
    } finally {
      setUpdating(false);
    }
  };

  // Navigate to order detail page
  const handleViewDetails = () => {
    router.push(`/admin/orders/${order._id}`);
  };

  // Print order
  const handlePrint = () => {
    window.open(`/admin/orders/${order._id}/print`, '_blank');
  };

  // Contact customer via WhatsApp
  const handleWhatsApp = () => {
    const phone = order.customerInfo.whatsapp || order.customerInfo.phone;
    const message = encodeURIComponent(`Hi ${order.customerInfo.name}, regarding your order ${order.orderNumber}`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  // Call customer
  const handleCall = () => {
    window.location.href = `tel:${order.customerInfo.phone}`;
  };

  // Email customer
  const handleEmail = () => {
    window.location.href = `mailto:${order.customerInfo.email}?subject=Order ${order.orderNumber}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Card Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {/* Order Number */}
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-gray-900">
                {order.orderNumber}
              </h3>
              <Badge className={currentStatus.color}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {currentStatus.label}
              </Badge>
              <Badge className={paymentStatus.color}>
                {paymentStatus.label}
              </Badge>
            </div>

            {/* Order Date */}
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {formatDate(order.createdAt)}
            </p>
          </div>

          {/* Total Amount */}
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(order.pricing.total)}
            </p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-900">{order.customerInfo.name}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{order.customerInfo.phone}</span>
          </div>

          {order.customerInfo.email && (
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <span className="truncate max-w-[200px]">{order.customerInfo.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">
        {/* Order Items Preview */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Order Items ({order.items.length})</p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {order.items.slice(0, 4).map((item, index) => (
              <div key={index} className="flex-shrink-0 relative group">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  {item.productSnapshot?.primaryImage ? (
                    <img
                      src={item.productSnapshot.primaryImage}
                      alt={item.productSnapshot.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                {item.isCustom && (
                  <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded">
                    Custom
                  </div>
                )}
                {item.quantity > 1 && (
                  <div className="absolute -bottom-1 -right-1 bg-gray-900 text-white text-xs px-1.5 py-0.5 rounded">
                    x{item.quantity}
                  </div>
                )}
              </div>
            ))}
            {order.items.length > 4 && (
              <div className="w-20 h-20 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 font-medium text-sm">
                +{order.items.length - 4}
              </div>
            )}
          </div>
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Shipping Address
            </p>
            <p className="text-sm text-gray-600">
              {order.shippingAddress.fullAddress}, {order.shippingAddress.city}
            </p>
          </div>
        )}

        {/* Payment Info */}
        {order.payment.method === 'bank-transfer' && order.payment.status === 'pending' && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm font-medium text-orange-800 mb-1">⚠️ Payment Verification Required</p>
            <p className="text-xs text-orange-700">Customer has uploaded payment receipt</p>
          </div>
        )}

        {/* Assigned Tailor */}
        {order.assignedTailor && (
          <div className="mb-4 text-sm">
            <span className="text-gray-600">Assigned to: </span>
            <span className="font-medium text-gray-900">{order.assignedTailor}</span>
          </div>
        )}

        {/* Estimated Completion */}
        {order.estimatedCompletion && (
          <div className="mb-4 text-sm">
            <span className="text-gray-600">Est. Completion: </span>
            <span className="font-medium text-gray-900">
              {new Date(order.estimatedCompletion).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Card Footer - Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        {/* Contact Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleWhatsApp}
            className="flex items-center gap-2"
            title="WhatsApp Customer"
          >
            <MessageCircle className="w-4 h-4 text-green-600" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCall}
            className="flex items-center gap-2"
            title="Call Customer"
          >
            <Phone className="w-4 h-4 text-blue-600" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleEmail}
            className="flex items-center gap-2"
            title="Email Customer"
          >
            <Mail className="w-4 h-4 text-purple-600" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrint}
            className="flex items-center gap-2"
            title="Print Order"
          >
            <Printer className="w-4 h-4 text-gray-600" />
          </Button>
        </div>

        {/* View Details Button */}
        <Button
          onClick={handleViewDetails}
          className="flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          View Details
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}