/**
 * DateRangePicker Component
 * 
 * Date range selector with preset options:
 * - Start and end date pickers
 * - Preset range buttons (Today, Last 7 Days, etc.)
 * - Apply and Clear buttons
 * - Display selected range text
 * - Validation for date ranges
 * - Responsive design
 * 
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {function} onRangeChange - Callback when range changes
 * @param {Date} maxDate - Maximum selectable date (default: today)
 * @param {Date} minDate - Minimum selectable date (optional)
 */

'use client';

import { useState, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';

export default function DateRangePicker({
  startDate,
  endDate,
  onRangeChange,
  maxDate = new Date(),
  minDate
}) {
  const [localStartDate, setLocalStartDate] = useState(startDate || new Date());
  const [localEndDate, setLocalEndDate] = useState(endDate || new Date());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (startDate) setLocalStartDate(startDate);
    if (endDate) setLocalEndDate(endDate);
  }, [startDate, endDate]);

  // Format date to YYYY-MM-DD for input
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format date for display
  const formatDisplayDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Preset date ranges
  const presets = [
    {
      label: 'Today',
      getValue: () => {
        const today = new Date();
        return { start: today, end: today };
      }
    },
    {
      label: 'Last 7 Days',
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 6);
        return { start, end };
      }
    },
    {
      label: 'Last 30 Days',
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 29);
        return { start, end };
      }
    },
    {
      label: 'This Month',
      getValue: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { start, end };
      }
    },
    {
      label: 'Last Month',
      getValue: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        return { start, end };
      }
    },
    {
      label: 'This Year',
      getValue: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear(), 11, 31);
        return { start, end };
      }
    }
  ];

  const handlePresetClick = (preset) => {
    const { start, end } = preset.getValue();
    setLocalStartDate(start);
    setLocalEndDate(end);
  };

  const handleApply = () => {
    if (localStartDate && localEndDate) {
      if (localStartDate > localEndDate) {
        alert('Start date cannot be after end date');
        return;
      }
      onRangeChange({ startDate: localStartDate, endDate: localEndDate });
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    const today = new Date();
    setLocalStartDate(today);
    setLocalEndDate(today);
    onRangeChange({ startDate: today, endDate: today });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
      >
        <Calendar className="w-4 h-4" />
        <span>
          {formatDisplayDate(localStartDate)} - {formatDisplayDate(localEndDate)}
        </span>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-80 sm:w-96 dark:bg-gray-800 dark:border-gray-700">
            {/* Preset Buttons */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Quick Select
              </p>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetClick(preset)}
                    className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Inputs */}
            <div className="p-4 space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formatDate(localStartDate)}
                  onChange={(e) => setLocalStartDate(new Date(e.target.value))}
                  max={formatDate(maxDate)}
                  min={minDate ? formatDate(minDate) : undefined}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  End Date
                </label>
                <input
                  type="date"
                  value={formatDate(localEndDate)}
                  onChange={(e) => setLocalEndDate(new Date(e.target.value))}
                  max={formatDate(maxDate)}
                  min={formatDate(localStartDate)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleClear}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}