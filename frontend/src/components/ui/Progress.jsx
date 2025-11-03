'use client';

import React, { useState } from 'react';
import { 
  ChevronUp, ChevronDown, Search, Filter, Download, 
  Eye, Edit, Trash2, Package, CheckCircle, Clock, XCircle 
} from 'lucide-react';

/**
 * Progress Component
 * 
 * Progress bar for showing completion status
 * 
 * @param {Object} props
 * @param {number} props.value - Progress value (0-100)
 * @param {string} props.label - Progress label
 * @param {boolean} props.showValue - Show percentage value
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg'
 * @param {string} props.variant - Color variant: 'primary', 'success', 'warning', 'error'
 * @param {boolean} props.striped - Striped animation
 * @param {boolean} props.animated - Animated stripes
 * @param {string} props.className - Additional CSS classes
 * 
 * @example
 * <Progress
 *   value={75}
 *   label="Order Completion"
 *   showValue
 *   variant="success"
 * />
 */
const Progress = ({
  value = 0,
  label,
  showValue = true,
  size = 'md',
  variant = 'primary',
  striped = false,
  animated = false,
  className = ''
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const variants = {
    primary: 'bg-gradient-to-r from-[#D946A6] to-[#7C3AED]',
    success: 'bg-green-500',
    warning: 'bg-orange-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {showValue && (
            <span className="text-sm font-semibold text-gray-900">
              {clampedValue}%
            </span>
          )}
        </div>
      )}
      
      <div className={`w-full ${sizes[size]} bg-gray-200 rounded-full overflow-hidden`}>
        <div
          className={`
            h-full ${variants[variant]} rounded-full transition-all duration-500
            ${striped ? 'progress-striped' : ''}
            ${animated ? 'progress-animated' : ''}
          `}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};

/**
 * CircularProgress Component
 * 
 * Circular progress indicator
 * 
 * @param {Object} props
 * @param {number} props.value - Progress value (0-100)
 * @param {number} props.size - Circle size in pixels
 * @param {number} props.strokeWidth - Stroke width
 * @param {string} props.variant - Color variant
 * @param {boolean} props.showValue - Show percentage in center
 * @param {string} props.label - Label below circle
 */
const CircularProgress = ({
  value = 0,
  size = 120,
  strokeWidth = 8,
  variant = 'primary',
  showValue = true,
  label,
  className = ''
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (clampedValue / 100) * circumference;

  const variants = {
    primary: '#D946A6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  };

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={variants[variant]}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500"
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{clampedValue}%</span>
          </div>
        )}
      </div>
      {label && (
        <span className="mt-2 text-sm font-medium text-gray-700">{label}</span>
      )}
    </div>
  );
};


  