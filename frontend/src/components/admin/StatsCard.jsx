/**
 * StatsCard Component
 * 
 * Animated statistics card for dashboard featuring:
 * - Icon with custom colors
 * - Animated counter (counts up to value)
 * - Trend indicator (up/down arrow with percentage)
 * - Optional subtitle
 * - Alert styling for critical values
 * - Smooth hover effects
 * - Dark mode support
 * 
 * @param {string} title - Card title
 * @param {string|number} value - Main value to display
 * @param {number} change - Percentage change (optional)
 * @param {Component} icon - Lucide icon component
 * @param {string} iconColor - Icon text color class
 * @param {string} iconBgColor - Icon background color class
 * @param {string} trend - 'up' | 'down' (optional)
 * @param {string} subtitle - Additional info text (optional)
 * @param {boolean} alert - Show alert styling (optional)
 */

'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

export default function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-indigo-600',
  iconBgColor = 'bg-indigo-100',
  trend = 'up',
  subtitle,
  alert = false
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate counter on mount
  useEffect(() => {
    setIsAnimating(true);
    
    // Extract numeric value if it's a formatted string
    let numericValue = value;
    if (typeof value === 'string') {
      // Remove currency symbols and commas
      const cleanValue = value.replace(/[^0-9.-]+/g, '');
      numericValue = parseFloat(cleanValue) || 0;
    }

    // Animation duration in ms
    const duration = 1000;
    const steps = 60;
    const stepDuration = duration / steps;
    const increment = numericValue / steps;

    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;

      if (step >= steps) {
        current = numericValue;
        clearInterval(timer);
        setIsAnimating(false);
      }

      setDisplayValue(current);
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  // Format display value
  const formatDisplayValue = () => {
    if (typeof value === 'string' && value.includes('PKR')) {
      // Format as currency
      return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(displayValue);
    }
    
    // Format as number
    return Math.round(displayValue).toLocaleString();
  };

  return (
    <div 
      className={`
        relative overflow-hidden bg-white border rounded-lg p-6 
        transition-all duration-300 hover:shadow-lg hover:-translate-y-1
        dark:bg-gray-800
        ${alert 
          ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10' 
          : 'border-gray-200 dark:border-gray-700'
        }
      `}
    >
      {/* Background Gradient Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 opacity-10">
        <div className={`w-full h-full rounded-full ${iconBgColor}`}></div>
      </div>

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <h3 className={`
              mt-2 text-3xl font-bold transition-all duration-300
              ${alert 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-gray-900 dark:text-white'
              }
              ${isAnimating ? 'scale-110' : 'scale-100'}
            `}>
              {formatDisplayValue()}
            </h3>
          </div>

          {/* Icon */}
          <div className={`
            flex items-center justify-center w-12 h-12 rounded-lg
            ${iconBgColor} transition-transform duration-300 hover:scale-110
          `}>
            {alert ? (
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 animate-pulse" />
            ) : (
              <Icon className={`w-6 h-6 ${iconColor}`} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Change Indicator */}
          {change !== undefined && !alert && (
            <div className={`
              flex items-center gap-1 text-sm font-medium
              ${trend === 'up' 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
              }
            `}>
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(change)}%</span>
            </div>
          )}

          {/* Subtitle */}
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}

          {/* Alert Message */}
          {alert && (
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              Requires attention
            </p>
          )}
        </div>
      </div>
    </div>
  );
}