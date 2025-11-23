/**
 * OrderCard Component
 * Displays order summary card with key information and quick actions
 */

'use client';


// import { useState } from 'react'; // Unused for now
import Link from 'next/link';
import Image from 'next/image';
import { 
  Package, Clock, MapPin, 
  Eye, Phone, MessageCircle,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types/order-management';

interface OrderCardProps {
  order: Order;
  onUpdate?: () => void;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  'pending-payment': { label: 'Pending Payment', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  'payment-verified': { label: 'Payment Verified', color: 'text-green-700', bgColor: 'bg-green-100' },
  'material-arranged': { label: 'Material Arranged', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  'in-progress': { label: 'In Progress', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  'quality-check': { label: 'Quality Check', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  'ready-dispatch': { label: 'Ready for Dispatch', color: 'text-teal-700', bgColor: 'bg-teal-100' },
  'dispatched': { label: 'Dispatched', color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
  'delivered': { label: 'Delivered', color: 'text-green-700', bgColor: 'bg-green-100' },
  'cancelled': { label: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100' },
  'refunded': { label: 'Refunded', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

const paymentStatusConfig = {
  pending: { label: 'Pending', color: 'text-orange-700', bgColor: 'bg-orange-100', icon: Clock },
  verified: { label: 'Verified', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
  failed: { label: 'Failed', color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle },
  refunded: { label: 'Refunded', color: 'text-gray-700', bgColor: 'bg-gray-100', icon: AlertCircle },
};

export default function OrderCard({ order, onUpdate: _onUpdate }: OrderCardProps) {
  const status = statusConfig[order.status] || statusConfig['pending-payment'];
  const paymentStatus = paymentStatusConfig[order.payment.status] || paymentStatusConfig.pending;
  const PaymentIcon = paymentStatus.icon;

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const primaryImage = order.items[0]?.productSnapshot?.primaryImage || '/images/placeholder.png';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Link 
                href={`/admin/orders/${order._id}`}
                className="text-lg font-bold text-gray-900 hover:text-purple-600 transition-colors"
              >
                #{order.orderNumber}
              </Link>
              <Badge className={`${status.bgColor} ${status.color} border-0`}>
                {status.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              {formatDate(order.createdAt, 'medium')}
            </p>
          </div>

          {/* Order Image */}
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 ml-4">
            <Image
              src={primaryImage}
              alt={order.items[0]?.productSnapshot?.title || 'Order item'}
              fill
              sizes="64px"
              className="object-cover"
              quality={75}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPg=="
            />
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <Package className="w-4 h-4" />
            <span className="font-medium">{order.customerInfo.name}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{order.customerInfo.email}</span>
            <span>{order.customerInfo.phone}</span>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Items</p>
            <p className="text-sm font-medium text-gray-900">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Payment</p>
            <div className="flex items-center gap-2">
              <PaymentIcon className={`w-4 h-4 ${paymentStatus.color}`} />
              <span className={`text-sm font-medium ${paymentStatus.color}`}>
                {paymentStatus.label}
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Method</p>
            <p className="text-sm font-medium text-gray-900 capitalize">
              {order.payment.method.replace('-', ' ')}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Total</p>
            <p className="text-sm font-bold text-purple-600">
              {formatCurrency(order.pricing.total)}
            </p>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-start gap-2 text-xs text-gray-600">
              <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">
                {order.shippingAddress.addressLine1 || order.shippingAddress.fullAddress}, {order.shippingAddress.city}
              </span>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Link href={`/admin/orders/${order._id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </Link>
          
          {order.customerInfo.phone && (
            <a href={`tel:${order.customerInfo.phone}`}>
              <Button variant="ghost" size="sm" className="px-3">
                <Phone className="w-4 h-4" />
              </Button>
            </a>
          )}
          
          {order.customerInfo.whatsapp && (
            <a 
              href={`https://wa.me/${order.customerInfo.whatsapp.replace(/[^0-9]/g, '')}?text=Hi, regarding order ${order.orderNumber}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="sm" className="px-3">
                <MessageCircle className="w-4 h-4" />
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

