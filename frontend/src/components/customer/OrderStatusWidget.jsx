'use client';

// components/customer/OrderStatusWidget.jsx

import { Package, CheckCircle, Clock, Truck } from 'lucide-react';

/**
 * Compact Order Status Widget
 * Perfect for order cards, dashboards, and mobile views
 * Shows simplified status with progress bar
 * 
 * Features:
 * - Progress bar visualization
 * - Color-coded status
 * - Mobile-optimized
 * - Tooltip on hover
 * - Compact design
 */

const STATUS_CONFIG = {
  'pending-payment': {
    label: 'Awaiting Payment',
    progress: 10,
    color: 'yellow',
    icon: Clock,
  },
  'payment-verified': {
    label: 'Payment Verified',
    progress: 20,
    color: 'green',
    icon: CheckCircle,
  },
  'material-arranged': {
    label: 'Material Ready',
    progress: 35,
    color: 'blue',
    icon: Package,
  },
  'in-progress': {
    label: 'Being Stitched',
    progress: 60,
    color: 'purple',
    icon: Package,
  },
  'quality-check': {
    label: 'Quality Check',
    progress: 75,
    color: 'indigo',
    icon: CheckCircle,
  },
  'ready-to-ship': {
    label: 'Ready to Ship',
    progress: 85,
    color: 'teal',
    icon: Package,
  },
  'shipped': {
    label: 'Out for Delivery',
    progress: 95,
    color: 'cyan',
    icon: Truck,
  },
  'delivered': {
    label: 'Delivered',
    progress: 100,
    color: 'green',
    icon: CheckCircle,
  },
  'completed': {
    label: 'Completed',
    progress: 100,
    color: 'green',
    icon: CheckCircle,
  },
  'cancelled': {
    label: 'Cancelled',
    progress: 0,
    color: 'red',
    icon: Clock,
  },
};

/**
 * Get background color classes based on status
 */
const getColorClasses = (color) => {
  const colorMap = {
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    green: 'bg-green-100 text-green-800 border-green-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    purple: 'bg-purple-100 text-purple-800 border-purple-300',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    teal: 'bg-teal-100 text-teal-800 border-teal-300',
    cyan: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    red: 'bg-red-100 text-red-800 border-red-300',
  };
  return colorMap[color] || colorMap.blue;
};

/**
 * Get progress bar color
 */
const getProgressColor = (color) => {
  const colorMap = {
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
    teal: 'bg-teal-500',
    cyan: 'bg-cyan-500',
    red: 'bg-red-500',
  };
  return colorMap[color] || colorMap.blue;
};

export default function OrderStatusWidget({ 
  status, 
  showProgress = true,
  size = 'md', // 'sm', 'md', 'lg'
  className = '' 
}) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['pending-payment'];
  const Icon = config.icon;

  // Size configurations
  const sizeClasses = {
    sm: {
      badge: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3',
      progress: 'h-1',
      text: 'text-xs',
    },
    md: {
      badge: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
      progress: 'h-2',
      text: 'text-sm',
    },
    lg: {
      badge: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
      progress: 'h-3',
      text: 'text-base',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`inline-block ${className}`}>
      {/* Status Badge */}
      <div 
        className={`inline-flex items-center gap-2 rounded-full border font-medium ${getColorClasses(config.color)} ${sizes.badge}`}
        title={`Order is ${config.label.toLowerCase()}`}
      >
        <Icon className={sizes.icon} />
        <span>{config.label}</span>
      </div>

      {/* Progress Bar */}
      {showProgress && status !== 'cancelled' && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className={`${sizes.text} text-gray-600 font-medium`}>
              Progress
            </span>
            <span className={`${sizes.text} font-bold ${config.color === 'green' ? 'text-green-600' : 'text-gray-700'}`}>
              {config.progress}%
            </span>
          </div>
          <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizes.progress}`}>
            <div
              className={`${getProgressColor(config.color)} ${sizes.progress} rounded-full transition-all duration-500 ease-out`}
              style={{ width: `${config.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact horizontal version for mobile
 */
export function OrderStatusBadge({ status, className = '' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['pending-payment'];
  const Icon = config.icon;

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${getColorClasses(config.color)} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

/**
 * Status Timeline Mini (Horizontal dots)
 * Shows 4 key stages as dots
 */
export function OrderStatusDots({ status, className = '' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['pending-payment'];
  const progress = config.progress;

  const stages = [
    { threshold: 20, label: 'Ordered' },
    { threshold: 50, label: 'Processing' },
    { threshold: 85, label: 'Ready' },
    { threshold: 100, label: 'Delivered' },
  ];

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {stages.map((stage, index) => {
        const isComplete = progress >= stage.threshold;
        const isActive = progress >= (stages[index - 1]?.threshold || 0) && progress < stage.threshold;
        
        return (
          <div key={index} className="flex flex-col items-center flex-1">
            {/* Connecting line */}
            {index > 0 && (
              <div className="w-full h-0.5 bg-gray-200 absolute" style={{ 
                left: '-50%', 
                width: '100%',
                top: '6px' 
              }}>
                <div 
                  className={`h-full transition-all duration-500 ${
                    isComplete ? getProgressColor(config.color) : 'bg-gray-200'
                  }`}
                  style={{ 
                    width: isComplete ? '100%' : '0%' 
                  }}
                />
              </div>
            )}
            
            {/* Dot */}
            <div className="relative z-10 mb-2">
              <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                isComplete 
                  ? `${getProgressColor(config.color)} border-transparent` 
                  : isActive
                  ? 'bg-white border-purple-500 ring-2 ring-purple-200'
                  : 'bg-white border-gray-300'
              }`}>
                {isComplete && (
                  <CheckCircle className="w-3 h-3 text-white -m-0.5" fill="currentColor" />
                )}
              </div>
            </div>
            
            {/* Label */}
            <span className={`text-xs text-center ${
              isComplete || isActive ? 'text-gray-700 font-medium' : 'text-gray-400'
            }`}>
              {stage.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Animated status indicator (for real-time updates)
 */
export function OrderStatusPulse({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['pending-payment'];
  const Icon = config.icon;
  
  const isInProgress = ['material-arranged', 'in-progress', 'quality-check', 'shipped'].includes(status);

  return (
    <div className="relative inline-flex items-center">
      {/* Pulsing ring for in-progress statuses */}
      {isInProgress && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75 animate-ping" />
      )}
      
      {/* Icon */}
      <span className={`relative inline-flex items-center justify-center w-10 h-10 rounded-full ${getColorClasses(config.color)}`}>
        <Icon className="w-5 h-5" />
      </span>
    </div>
  );
}

/**
 * Example Usage:
 * 
 * // Default widget with progress
 * <OrderStatusWidget status="in-progress" />
 * 
 * // Small badge only
 * <OrderStatusBadge status="shipped" />
 * 
 * // Horizontal dots timeline
 * <OrderStatusDots status="ready-to-ship" className="max-w-xs" />
 * 
 * // Animated pulse indicator
 * <OrderStatusPulse status="in-progress" />
 * 
 * // Large widget without progress
 * <OrderStatusWidget status="delivered" size="lg" showProgress={false} />
 */