import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Filter, SlidersHorizontal } from 'lucide-react';
import { CITIES_PAKISTAN, ORDER_STATUS, PAYMENT_STATUS } from '@/lib/constants';
import { useDebounce } from '@/hooks/useDebounce';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import DateRangePicker from '@/components/admin/DateRangePicker';
import Badge from '@/components/ui/Badge';

/**
 * OrderFilters Component
 * Comprehensive filtering and search interface for admin orders
 * 
 * @component
 * @param {Object} filters - Current filter values
 * @param {Function} onFilterChange - Callback when filters change
 * @param {Object} orderCounts - Count of orders by status
 */
const OrderFilters = ({ filters, onFilterChange, orderCounts = {} }) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Status tabs configuration
  const statusTabs = [
    { key: 'ALL', label: 'All Orders', count: orderCounts.all || 0 },
    { key: 'PENDING_PAYMENT', label: 'Pending', count: orderCounts.pending || 0 },
    { key: 'IN_PROGRESS', label: 'In Progress', count: orderCounts.inProgress || 0 },
    { key: 'COMPLETED', label: 'Completed', count: orderCounts.completed || 0 },
    { key: 'CANCELLED', label: 'Cancelled', count: orderCounts.cancelled || 0 }
  ];

  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'highest', label: 'Highest Amount' },
    { value: 'lowest', label: 'Lowest Amount' }
  ];

  // Update search filter when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      handleFilterUpdate('search', debouncedSearch);
    }
  }, [debouncedSearch]);

  // Handle filter updates
  const handleFilterUpdate = useCallback((key, value) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  }, [filters, onFilterChange]);

  // Handle status tab change
  const handleStatusChange = (status) => {
    handleFilterUpdate('status', status === 'ALL' ? null : status);
  };

  // Handle date range change
  const handleDateRangeChange = (range) => {
    onFilterChange({
      ...filters,
      dateFrom: range.from,
      dateTo: range.to
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    onFilterChange({
      status: null,
      search: '',
      dateFrom: null,
      dateTo: null,
      paymentStatus: null,
      city: null,
      sortBy: 'newest'
    });
    setShowAdvancedFilters(false);
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return !!(
      filters.search ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.paymentStatus ||
      filters.city ||
      (filters.status && filters.status !== 'ALL')
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* Status Tabs */}
      <div className="border-b border-gray-200 -mx-4 px-4">
        <nav className="-mb-px flex space-x-2 overflow-x-auto scrollbar-hide" aria-label="Order status tabs">
          {statusTabs.map((tab) => {
            const isActive = (filters.status === tab.key) || (!filters.status && tab.key === 'ALL');
            return (
              <button
                key={tab.key}
                onClick={() => handleStatusChange(tab.key)}
                className={`
                  whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors
                  ${isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.label}
                <Badge 
                  variant={isActive ? 'primary' : 'default'} 
                  className="ml-2"
                >
                  {tab.count}
                </Badge>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search and Quick Filters Row */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by order number or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
              aria-label="Search orders"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="w-full md:w-48">
          <Select
            value={filters.sortBy || 'newest'}
            onChange={(e) => handleFilterUpdate('sortBy', e.target.value)}
            options={sortOptions}
            aria-label="Sort orders"
          />
        </div>

        {/* Advanced Filters Toggle */}
        <Button
          variant="outline"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-2"
          aria-label="Toggle advanced filters"
          aria-expanded={showAdvancedFilters}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters() && (
            <Badge variant="primary" size="sm">
              {Object.values(filters).filter(v => v && v !== 'newest').length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="pt-3 border-t border-gray-200 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Date Range Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <DateRangePicker
                value={{
                  from: filters.dateFrom,
                  to: filters.dateTo
                }}
                onChange={handleDateRangeChange}
                placeholder="Select date range"
              />
            </div>

            {/* Payment Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Status
              </label>
              <Select
                value={filters.paymentStatus || ''}
                onChange={(e) => handleFilterUpdate('paymentStatus', e.target.value || null)}
                options={[
                  { value: '', label: 'All Payment Statuses' },
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'PAID', label: 'Paid' },
                  { value: 'FAILED', label: 'Failed' },
                  { value: 'REFUNDED', label: 'Refunded' }
                ]}
                aria-label="Filter by payment status"
              />
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <Select
                value={filters.city || ''}
                onChange={(e) => handleFilterUpdate('city', e.target.value || null)}
                options={[
                  { value: '', label: 'All Cities' },
                  ...CITIES_PAKISTAN.map(city => ({
                    value: city,
                    label: city
                  }))
                ]}
                aria-label="Filter by city"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters() && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          <span className="text-sm text-gray-600 font-medium">Active filters:</span>
          
          {filters.search && (
            <Badge variant="blue" className="flex items-center gap-1">
              Search: {filters.search}
              <button
                onClick={() => {
                  setSearchTerm('');
                  handleFilterUpdate('search', '');
                }}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {filters.status && filters.status !== 'ALL' && (
            <Badge variant="blue" className="flex items-center gap-1">
              Status: {ORDER_STATUS[filters.status]}
              <button
                onClick={() => handleFilterUpdate('status', null)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {filters.paymentStatus && (
            <Badge variant="blue" className="flex items-center gap-1">
              Payment: {PAYMENT_STATUS[filters.paymentStatus]}
              <button
                onClick={() => handleFilterUpdate('paymentStatus', null)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {filters.city && (
            <Badge variant="blue" className="flex items-center gap-1">
              City: {filters.city}
              <button
                onClick={() => handleFilterUpdate('city', null)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {(filters.dateFrom || filters.dateTo) && (
            <Badge variant="blue" className="flex items-center gap-1">
              Date: {filters.dateFrom && new Date(filters.dateFrom).toLocaleDateString()} - {filters.dateTo && new Date(filters.dateTo).toLocaleDateString()}
              <button
                onClick={() => handleDateRangeChange({ from: null, to: null })}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderFilters;