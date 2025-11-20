/**
 * OrderTimeline Component
 * Visual timeline of order status changes
 */

'use client';

import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Order, StatusHistoryItem, OrderStatus } from '@/types/order-management';

interface OrderTimelineProps {
  order: Order;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  'pending-payment': { label: 'Pending Payment', color: 'text-orange-600', icon: Clock },
  'payment-verified': { label: 'Payment Verified', color: 'text-green-600', icon: CheckCircle },
  'material-arranged': { label: 'Material Arranged', color: 'text-blue-600', icon: CheckCircle },
  'in-progress': { label: 'In Progress', color: 'text-purple-600', icon: Clock },
  'quality-check': { label: 'Quality Check', color: 'text-indigo-600', icon: Clock },
  'ready-dispatch': { label: 'Ready for Dispatch', color: 'text-teal-600', icon: CheckCircle },
  'dispatched': { label: 'Dispatched', color: 'text-cyan-600', icon: CheckCircle },
  'delivered': { label: 'Delivered', color: 'text-green-600', icon: CheckCircle },
  'cancelled': { label: 'Cancelled', color: 'text-red-600', icon: XCircle },
  'refunded': { label: 'Refunded', color: 'text-gray-600', icon: XCircle },
};

export default function OrderTimeline({ order }: OrderTimelineProps) {
  const timeline = order.statusHistory || [];
  
  // Add current status if not in history
  const currentStatusInHistory = timeline.some(item => item.status === order.status);
  if (!currentStatusInHistory) {
    timeline.push({
      status: order.status,
      timestamp: order.updatedAt || order.createdAt,
    });
  }

  // Sort by timestamp
  const sortedTimeline = [...timeline].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  if (sortedTimeline.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No status history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedTimeline.map((item, index) => {
        const isLast = index === sortedTimeline.length - 1;
        const isCurrent = item.status === order.status;
        const statusInfo = statusConfig[item.status] || {
          label: item.status,
          color: 'text-gray-600',
          icon: CheckCircle,
        };
        const Icon = statusInfo.icon;

        return (
          <div key={index} className="flex gap-4">
            {/* Icon */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCurrent
                    ? 'bg-purple-600 border-purple-600 text-white shadow-lg'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 h-12 mt-2 ${
                    isCurrent ? 'bg-purple-200' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      isCurrent ? 'text-purple-900' : 'text-gray-900'
                    }`}
                  >
                    {statusInfo.label}
                  </p>
                  {item.note && (
                    <p className="text-xs text-gray-600 mt-1">{item.note}</p>
                  )}
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                  {formatDate(item.timestamp, 'short')}
                </span>
              </div>
              {item.updatedBy && typeof item.updatedBy === 'object' && (
                <p className="text-xs text-gray-500">
                  Updated by {item.updatedBy.fullName || 'Admin'}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

