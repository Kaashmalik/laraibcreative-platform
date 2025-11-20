/**
 * DateRangePicker Component
 * Date range selector for dashboard filtering
 */

'use client';

import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { DateRange } from '@/types/dashboard';

interface DateRangePickerProps {
  value: DateRange;
  customStartDate?: string;
  customEndDate?: string;
  onChange: (range: DateRange, startDate?: string, endDate?: string) => void;
}

export default function DateRangePicker({
  value,
  customStartDate,
  customEndDate,
  onChange
}: DateRangePickerProps) {
  const ranges: { label: string; value: DateRange }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' }
  ];

  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-gray-500" />
      <div className="flex p-1 bg-gray-100 rounded-lg dark:bg-gray-800">
        {ranges.map((range) => (
          <button
            key={range.value}
            onClick={() => onChange(range.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              value === range.value
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
}

