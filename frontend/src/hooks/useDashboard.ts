/**
 * useDashboard Hook
 * Custom hook for fetching and managing dashboard data
 */

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import type { DashboardData, DashboardResponse, DateRange } from '@/types/dashboard';
import toast from 'react-hot-toast';

interface UseDashboardOptions {
  period?: DateRange;
  startDate?: string;
  endDate?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export function useDashboard(options: UseDashboardOptions = {}) {
  const {
    period = 'month',
    startDate,
    endDate,
    autoRefresh = false,
    refreshInterval = 60000 // 1 minute default
  } = options;

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const params: any = { period };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.dashboard.getDashboard(params);
      const result: DashboardResponse = response as unknown as DashboardResponse;

      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch dashboard data');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load dashboard data';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [period, startDate, endDate]);

  // Initial fetch
  useEffect(() => {
    fetchDashboard(false);
  }, [period, startDate, endDate]); // Only re-fetch when these change

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDashboard(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchDashboard]);

  const refresh = useCallback(() => {
    fetchDashboard(true);
  }, [fetchDashboard]);

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    refresh,
    refetch: fetchDashboard
  };
}

