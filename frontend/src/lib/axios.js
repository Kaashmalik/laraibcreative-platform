import axios from 'axios';
import { API_BASE_URL } from './constants';
import * as storage from './storage';
import { toast } from 'react-hot-toast';

/**
 * Configured Axios instance for API requests
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});

// Track ongoing requests for retry logic
const ongoingRequests = new Map();

/**
 * Request Interceptor
 * - Adds auth token
 * - Logs requests in development
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = storage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 [API] ${config.method?.toUpperCase()} ${config.url}`, 
        config.params || config.data
      );
    }

    // Track request for retry logic
    const requestId = Math.random().toString(36).substring(7);
    config.requestId = requestId;
    ongoingRequests.set(requestId, {
      retryCount: 0,
      config: { ...config }
    });

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * - Returns response.data directly
 * - Handles common error cases
 * - Implements retry logic
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Clear request from tracking
    if (response.config.requestId) {
      ongoingRequests.delete(response.config.requestId);
    }

    // Return data directly
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const requestId = originalRequest?.requestId;
    const requestInfo = requestId ? ongoingRequests.get(requestId) : null;

    // Handle network errors
    if (!error.response) {
      toast.error('Connection failed. Please check your internet connection.');
      return Promise.reject(error);
    }

    // Get error details
    const { status, data } = error.response;
    const errorMessage = data?.message || 'Something went wrong';

    // Handle retry logic for 5xx errors and network issues
    if (
      (status >= 500 || !error.response) && 
      requestInfo && 
      requestInfo.retryCount === 0
    ) {
      requestInfo.retryCount++;
      
      // Wait 1 second before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove Authorization header if it's a 401 to prevent infinite loops
      if (status === 401) {
        delete originalRequest.headers.Authorization;
      }

      return axiosInstance(originalRequest);
    }

    // Clear request from tracking
    if (requestId) {
      ongoingRequests.delete(requestId);
    }

    // Handle specific error cases
    switch (status) {
      case 401: // Unauthorized
        // Clear auth token
        storage.removeItem('auth-token');
        
        // Redirect to login if not already there
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
          toast.error('Session expired. Please login again.');
          window.location.href = '/auth/login';
        }
        break;

      case 403: // Forbidden
        toast.error('Access denied. You do not have permission for this action.');
        break;

      case 404: // Not Found
        toast.error('The requested resource was not found.');
        break;

      case 422: // Validation Error
        // Show first validation error
        if (data.errors && Object.keys(data.errors).length > 0) {
          const firstError = Object.values(data.errors)[0];
          toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
        } else {
          toast.error(errorMessage);
        }
        break;

      case 429: // Too Many Requests
        toast.error('Too many requests. Please try again later.');
        break;

      case 500: // Server Error
        toast.error('Server error. Our team has been notified.');
        // Could add error logging service here
        break;

      default:
        toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
