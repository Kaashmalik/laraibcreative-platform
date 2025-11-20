/**
 * OrderFilters Component
 * Advanced filtering for order list
 */

'use client';

import { useState } from 'react';
import { Search, Filter, X, Calendar } from 'lucide-react';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { OrderFilters as OrderFiltersType } from '@/types/order-management';

interface OrderFiltersProps {
  filters: OrderFiltersType;
  onFiltersChange: (filters: OrderFiltersType) => void;
  onClear: () => void;
}

export default function OrderFilters({ filters, onFiltersChange, onClear }: OrderFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof OrderFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = 
    filters.status !== 'all' ||
    filters.paymentStatus !== 'all' ||
    filters.paymentMethod !== 'all' ||
    filters.dateRange !== 'all' ||
    filters.search ||
    filters.priority !== 'all';

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      {/* Main Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by order #, customer, phone..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status || 'all'}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending-payment">Pending Payment</option>
          <option value="payment-verified">Payment Verified</option>
          <option value="material-arranged">Material Arranged</option>
          <option value="in-progress">In Progress</option>
          <option value="quality-check">Quality Check</option>
          <option value="ready-dispatch">Ready for Dispatch</option>
          <option value="dispatched">Dispatched</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </Select>

        {/* Payment Status Filter */}
        <Select
          value={filters.paymentStatus || 'all'}
          onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
        >
          <option value="all">All Payments</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </Select>

        {/* Date Range Filter */}
        <Select
          value={filters.dateRange || 'all'}
          onChange={(e) => handleFilterChange('dateRange', e.target.value)}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
          <option value="custom">Custom Range</option>
        </Select>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Payment Method */}
          <Select
            value={filters.paymentMethod || 'all'}
            onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
          >
            <option value="all">All Payment Methods</option>
            <option value="bank-transfer">Bank Transfer</option>
            <option value="jazzcash">JazzCash</option>
            <option value="easypaisa">Easypaisa</option>
            <option value="cod">Cash on Delivery</option>
          </Select>

          {/* Priority */}
          <Select
            value={filters.priority || 'all'}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>

          {/* Amount Range */}
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min Amount"
              value={filters.minAmount || ''}
              onChange={(e) => handleFilterChange('minAmount', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full"
            />
            <Input
              type="number"
              placeholder="Max Amount"
              value={filters.maxAmount || ''}
              onChange={(e) => handleFilterChange('maxAmount', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full"
            />
          </div>

          {/* Sort By */}
          <Select
            value={filters.sortBy || 'newest'}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Value</option>
            <option value="lowest">Lowest Value</option>
          </Select>
        </div>
      )}

      {/* Custom Date Range */}
      {filters.dateRange === 'custom' && (
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <Input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <Input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Filter Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </Button>
          {hasActiveFilters && (
            <span className="text-sm text-gray-600">
              Filters active
            </span>
          )}
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}

