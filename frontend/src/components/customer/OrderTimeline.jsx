'use client';

// components/customer/OrderTimeline.jsx
'use client';

import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Package,
  CreditCard,
  Scissors,
  CheckSquare,
  Truck,
  Home,
  Loader2
} from 'lucide-react';

/**
 * Order Timeline Component
 * Displays visual progress of order through different stages
 * with status updates, timestamps, and descriptions
 */
export default function OrderTimeline({ status, statusHistory = [], estimatedCompletion }) {
  
  /**
   * Define all order stages with details
   */
  const stages = [
    {
      id: 'order-received',
      key: 'order-received',
      title: 'Order Received',
      description: 'Your order has been successfully placed and is awaiting payment verification',
      icon: Package,
      color: 'blue'
    },
    {
      id: 'payment-verified',
      key: 'payment-verified',
      title: 'Payment Verified',
      description: 'Payment confirmed. We are now arranging materials for your order',
      icon: CreditCard,
      color: 'green'
    },
    {
      id: 'material-arranged',
      key: 'in-progress',
      title: 'Material Arranged',
      description: 'Fabric and accessories have been arranged and prepared',
      icon: CheckSquare,
      color: 'purple'
    },
    {
      id: 'stitching-in-progress',
      key: 'in-progress',
      title: 'Stitching in Progress',
      description: 'Our skilled tailors are working on your custom stitching',
      icon: Scissors,
      color: 'pink'
    },
    {
      id: 'quality-check',
      key: 'quality-check',
      title: 'Quality Check',
      description: 'Your order is undergoing final quality inspection',
      icon: CheckCircle,
      color: 'indigo'
    },
    {
      id: 'ready-dispatch',
      key: 'ready-dispatch',
      title: 'Ready for Dispatch',
      description: 'Order is packed and ready to be dispatched',
      icon: Package,
      color: 'cyan'
    },
    {
      id: 'out-for-delivery',
      key: 'out-for-delivery',
      title: 'Out for Delivery',
      description: 'Your order is on its way to your doorstep',
      icon: Truck,
      color: 'orange'
    },
    {
      id: 'delivered',
      key: 'delivered',
      title: 'Delivered',
      description: 'Order successfully delivered. Thank you for choosing us!',
      icon: Home,
      color: 'green'
    }
  ];

  /**
   * Determine stage status based on current order status
   */
  const getStageStatus = (stageKey, stageIndex) => {
    // Map current status to stage progression
    const statusMapping = {
      'pending-payment': 0,
      'order-received': 0,
      'payment-verified': 1,
      'in-progress': 3, // Stitching in progress
      'quality-check': 4,
      'ready-dispatch': 5,
      'out-for-delivery': 6,
      'delivered': 7,
      'cancelled': -1
    };

    const currentStageIndex = statusMapping[status] || 0;

    if (status === 'cancelled') {
      return stageIndex === 0 ? 'completed' : 'cancelled';
    }

    if (stageIndex < currentStageIndex) return 'completed';
    if (stageIndex === currentStageIndex) return 'current';
    return 'pending';
  };

  /**
   * Get timestamp for specific stage from status history
   */
  const getStageTimestamp = (stageKey) => {
    if (!statusHistory || statusHistory.length === 0) return null;
    
    const historyItem = statusHistory.find(
      item => item.status === stageKey || 
             (stageKey === 'in-progress' && 
              (item.status === 'material-arranged' || item.status === 'stitching-in-progress'))
    );
    
    return historyItem?.timestamp;
  };

  /**
   * Format timestamp to readable date
   */
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Get color classes for stage
   */
  const getColorClasses = (stageStatus, color) => {
    const colors = {
      blue: { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-600' },
      green: { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-600' },
      purple: { bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-600' },
      pink: { bg: 'bg-pink-500', border: 'border-pink-500', text: 'text-pink-600' },
      indigo: { bg: 'bg-indigo-500', border: 'border-indigo-500', text: 'text-indigo-600' },
      cyan: { bg: 'bg-cyan-500', border: 'border-cyan-500', text: 'text-cyan-600' },
      orange: { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-600' }
    };

    const colorSet = colors[color] || colors.blue;

    if (stageStatus === 'completed') {
      return {
        icon: `${colorSet.bg} text-white`,
        line: colorSet.bg,
        text: colorSet.text,
        card: 'bg-gray-50 border-gray-200'
      };
    }

    if (stageStatus === 'current') {
      return {
        icon: `${colorSet.bg} text-white animate-pulse`,
        line: 'bg-gray-300',
        text: colorSet.text,
        card: `bg-gradient-to-r from-${color}-50 to-white border-${color}-300 shadow-lg`
      };
    }

    return {
      icon: 'bg-gray-200 text-gray-400',
      line: 'bg-gray-200',
      text: 'text-gray-400',
      card: 'bg-white border-gray-200'
    };
  };

  return (
    <div className="relative">
      {/* Timeline Container */}
      <div className="space-y-6">
        {stages.map((stage, index) => {
          const stageStatus = getStageStatus(stage.key, index);
          const timestamp = getStageTimestamp(stage.key);
          const colors = getColorClasses(stageStatus, stage.color);
          const Icon = stage.icon;
          const isLast = index === stages.length - 1;

          return (
            <div key={stage.id} className="relative">
              {/* Connecting Line */}
              {!isLast && (
                <div 
                  className={`absolute left-6 top-14 w-0.5 h-full ${colors.line} transition-all duration-500`}
                  style={{ height: 'calc(100% + 1.5rem)' }}
                />
              )}

              {/* Stage Card */}
              <div className={`relative flex gap-4 p-4 rounded-xl border-2 ${colors.card} transition-all duration-300`}>
                {/* Icon */}
                <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full ${colors.icon} flex items-center justify-center transition-all duration-300`}>
                  {stageStatus === 'completed' ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : stageStatus === 'current' ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h3 className={`text-lg font-bold ${stageStatus === 'pending' ? 'text-gray-400' : 'text-gray-900'}`}>
                      {stage.title}
                    </h3>
                    
                    {/* Status Badge */}
                    <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
                      stageStatus === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : stageStatus === 'current'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {stageStatus === 'completed' ? 'Completed' : stageStatus === 'current' ? 'In Progress' : 'Pending'}
                    </span>
                  </div>

                  <p className={`text-sm mb-2 ${stageStatus === 'pending' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stage.description}
                  </p>

                  {/* Timestamp */}
                  {timestamp && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{formatTimestamp(timestamp)}</span>
                    </div>
                  )}

                  {/* Current Stage - Show Estimated Time */}
                  {stageStatus === 'current' && estimatedCompletion && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-xs font-semibold text-blue-900">Estimated Completion</p>
                          <p className="text-xs text-blue-700">
                            {new Date(estimatedCompletion).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status History Notes */}
                  {statusHistory && statusHistory.find(h => h.status === stage.key && h.note) && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600">
                        <span className="font-semibold">Note: </span>
                        {statusHistory.find(h => h.status === stage.key).note}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancelled Status */}
      {status === 'cancelled' && (
        <div className="mt-6 p-6 bg-red-50 border-2 border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-1">Order Cancelled</h3>
              <p className="text-sm text-red-700">
                This order has been cancelled. If you have any questions, please contact our support team.
              </p>
              {statusHistory.find(h => h.status === 'cancelled')?.note && (
                <p className="mt-2 text-sm text-red-600">
                  <span className="font-semibold">Reason: </span>
                  {statusHistory.find(h => h.status === 'cancelled').note}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Questions about your order?
            </p>
            <p className="text-sm text-gray-600">
              We'll send you email and WhatsApp notifications as your order progresses through each stage. 
              Feel free to contact us anytime if you need updates or have concerns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}