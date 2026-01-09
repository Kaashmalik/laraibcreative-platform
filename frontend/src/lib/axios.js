import axios from 'axios';
import { API_BASE_URL } from './constants';
import { toast } from 'react-hot-toast';

/**
 * Configured Axios Instance for API Requests
 * Production-ready with retry logic, request tracking, and comprehensive error handling
 * Unified with backend JWT authentication using httpOnly cookies
 */

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  withCredentials: true, // Include cookies for JWT authentication (accessToken, refreshToken)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

const isBrowser = typeof window !== 'undefined';
const safeToastError = (message, options) => {
  if (!isBrowser) return;
  toast.error(message, options);
};

// Track ongoing requests for retry logic and cancellation
const ongoingRequests = new Map();
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

/**
 * Request Interceptor
 * - JWT httpOnly cookies are sent automatically with withCredentials: true
 * - Logs requests in development
 * - Tracks requests for retry logic
 * - Adds request timestamp
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // JWT httpOnly cookies (accessToken, refreshToken) are sent automatically
    // No need to manually add Authorization header from localStorage

    // Add request timestamp for performance tracking
    config.metadata = { startTime: Date.now() };

    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      // console.log(
      //   `🚀 [API] ${config.method?.toUpperCase()} ${config.url}`,
      //   config.params || config.data || ''
      // );
    }

    // Generate unique request ID
    const requestId = `${config.method}_${config.url}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    config.requestId = requestId;

    // Track request for retry logic
    ongoingRequests.set(requestId, {
      retryCount: 0,
      config: { ...config },
      timestamp: Date.now()
    });

    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * - Returns response.data directly
 * - Handles common error cases
 * - Implements retry logic for failed requests
 * - Logs response time in development
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Log response time in development
    if (process.env.NODE_ENV === 'development' && response.config.metadata) {
      const duration = Date.now() - response.config.metadata.startTime;
      // console.log(
      //   `✅ [API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`
      // );
    }

    // Clear request from tracking
    if (response.config.requestId) {
      ongoingRequests.delete(response.config.requestId);
    }

    // Return data directly for cleaner API usage
    return response.data;
  },
  async (error) => {
    // Treat canceled requests (AbortController/CancelToken) as non-errors to avoid retries/toasts
    try {
      const isCanceled = (typeof axios?.isCancel === 'function' && axios.isCancel(error)) ||
                         error?.code === 'ERR_CANCELED' ||
                         (typeof error?.message === 'string' && error.message.toLowerCase().includes('canceled'));
      if (isCanceled) {
        const canceledRequestId = error?.config?.requestId;
        if (canceledRequestId) {
          ongoingRequests.delete(canceledRequestId);
        }
        return Promise.reject(error);
      }
    } catch (_) {
      // Ignore errors in cancel detection
    }

    const originalRequest = error.config;
    const requestId = originalRequest?.requestId;
    const requestInfo = requestId ? ongoingRequests.get(requestId) : null;

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `❌ [API] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`,
        error.response?.status,
        error.response?.data || error.message
      );
    }

    // Handle network errors (including timeouts)
    if (!error.response) {
      // Check if it's a timeout error - don't retry timeouts aggressively
      const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');

      // Retry logic for network errors (but limit retries for timeouts)
      if (requestInfo && requestInfo.retryCount < MAX_RETRIES && !isTimeout) {
        requestInfo.retryCount++;

        safeToastError(`Connection failed. Retrying... (${requestInfo.retryCount}/${MAX_RETRIES})`);

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * requestInfo.retryCount));

        return axiosInstance(originalRequest);
      }

      // Clear request from tracking
      ongoingRequests.delete(requestId);

      // Show appropriate error message
      if (isTimeout) {
        safeToastError('Request timed out. The server may be slow or unavailable.');
      } else {
        safeToastError('Unable to connect. Please check your internet connection.');
      }

      return Promise.reject(error);
    }

    // Get error details
    const { status, data } = error.response;
    const errorMessage = data?.message || data?.error || 'Something went wrong';

    // Skip retry for validation-related errors to prevent infinite loops
    const isValidationError = errorMessage.includes('validation') ||
                              errorMessage.includes('Validation') ||
                              errorMessage.includes('cannot exceed') ||
                              errorMessage.includes('is required') ||
                              errorMessage.includes('not a valid enum');

    // Implement retry logic for 5xx errors (but not for validation errors)
    if (status >= 500 && requestInfo && requestInfo.retryCount < MAX_RETRIES && !isValidationError) {
      requestInfo.retryCount++;

      // Wait before retry with exponential backoff
      const delay = RETRY_DELAY * Math.pow(2, requestInfo.retryCount - 1);
      await new Promise(resolve => setTimeout(resolve, delay));

      return axiosInstance(originalRequest);
    }

    // Clear request from tracking after retry attempts
    if (requestId) {
      ongoingRequests.delete(requestId);
    }

    // Handle specific HTTP status codes
    switch (status) {
      case 400: // Bad Request
        safeToastError(errorMessage);
        break;

      case 401: // Unauthorized
        handleUnauthorized(originalRequest);
        break;

      case 403: // Forbidden
        safeToastError('Access denied. You do not have permission for this action.');
        break;

      case 404: // Not Found
        // Only show toast for non-GET requests or if explicitly requested
        if (originalRequest.method !== 'get' || originalRequest.showNotFoundToast) {
          safeToastError('The requested resource was not found.');
        }
        break;

      case 409: // Conflict
        safeToastError(errorMessage || 'A conflict occurred. Please refresh and try again.');
        break;

      case 422: // Validation Error
        handleValidationError(data);
        break;

      case 429: // Too Many Requests
        const retryAfter = error.response.headers['retry-after'];
        safeToastError(
          retryAfter
            ? `Too many requests. Please try again in ${retryAfter} seconds.`
            : 'Too many requests. Please try again later.'
        );
        break;

      case 500: // Internal Server Error
        safeToastError('Server error. Our team has been notified.');
        // Log to error tracking service in production
        if (process.env.NODE_ENV === 'production') {
          logErrorToService(error);
        }
        break;

      case 502: // Bad Gateway
      case 503: // Service Unavailable
      case 504: // Gateway Timeout
        safeToastError('Service temporarily unavailable. Please try again in a moment.');
        break;

      default:
        safeToastError(errorMessage);
    }

    return Promise.reject(error);
  }
);

/**
 * Handle unauthorized errors (401)
 * Attempts to refresh token and retry request
 */
async function handleUnauthorized(originalRequest) {
  // Don't retry for auth endpoints
  const authEndpoints = ['/auth/login', '/auth/register', '/auth/verify-token', '/auth/refresh-token'];
  const isAuthEndpoint = authEndpoints.some(endpoint =>
    originalRequest.url?.includes(endpoint)
  );

  if (isAuthEndpoint) {
    safeToastError('Session expired. Please login again.');
    redirectToLogin();
    return Promise.reject(new Error('Unauthorized'));
  }

  // Don't show toast for token refresh - we'll handle silently
  // Attempt to refresh token
  try {
    const refreshResponse = await axiosInstance.post('/auth/refresh-token', {}, {
      skipAuthRefresh: true // Prevent infinite loop
    });

    if (refreshResponse.success) {
      // Token refreshed successfully, retry original request
      return axiosInstance(originalRequest);
    }
  } catch (refreshError) {
    console.error('Token refresh failed:', refreshError);
  }

  // Refresh failed, redirect to login
  safeToastError('Session expired. Please login again.');
  redirectToLogin();
  return Promise.reject(new Error('Unauthorized'));
}

/**
 * Redirect to login page
 */
function redirectToLogin() {
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;

    if (!currentPath.includes('/auth/')) {
      // Save current path to return after login
      const returnUrl = currentPath !== '/' ? currentPath : '';
      setTimeout(() => {
        window.location.href = `/auth/login${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`;
      }, 1000);
    }
  }
}

/**
 * Handle validation errors (422)
 * Shows specific field errors
 */
function handleValidationError(data) {
  if (data?.errors && typeof data.errors === 'object') {
    // Get first error message
    const errors = Object.values(data.errors);
    if (errors.length > 0) {
      const firstError = errors[0];
      const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      safeToastError(errorMessage);

      // Log all errors in development
      if (process.env.NODE_ENV === 'development') {
        // console.log('Validation errors:', data.errors);
      }
    }
  } else {
    safeToastError(data?.message || 'Validation failed. Please check your input.');
  }
}

/**
 * Log error to external service
 * Replace with your error tracking service (Sentry, LogRocket, etc.)
 */
function logErrorToService(error) {
  // Example: Sentry.captureException(error);
  console.error('[Error Service] Logging error:', {
    message: error.message,
    status: error.response?.status,
    url: error.config?.url,
    method: error.config?.method,
    data: error.response?.data
  });
}

/**
 * Cancel all pending requests
 * Useful for cleanup on component unmount or route change
 */
export function cancelAllRequests() {
  ongoingRequests.forEach((_, requestId) => {
    ongoingRequests.delete(requestId);
  });

  if (process.env.NODE_ENV === 'development') {
    // console.log('🚫 [API] All requests cancelled');
  }
}

/**
 * Get number of pending requests
 * Useful for loading indicators
 */
export function getPendingRequestsCount() {
  return ongoingRequests.size;
}

/**
 * Create a cancellable request
 * Returns [promise, cancel function]
 */
export function createCancellableRequest(config) {
  const source = axios.CancelToken.source();

  const request = axiosInstance({
    ...config,
    cancelToken: source.token
  });

  return [request, () => source.cancel('Request cancelled by user')];
}

/**
 * Batch multiple requests
 * Executes requests in parallel and returns all results
 */
export async function batchRequests(requests) {
  try {
    const results = await Promise.allSettled(
      requests.map(req => axiosInstance(req))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return { success: true, data: result.value };
      } else {
        return {
          success: false,
          error: result.reason,
          request: requests[index]
        };
      }
    });
  } catch (error) {
    console.error('[API] Batch request error:', error);
    throw error;
  }
}

/**
 * Helper to check if error is from axios
 */
export function isAxiosError(error) {
  return axios.isAxiosError(error);
}

/**
 * Helper to get error message from axios error
 */
export function getErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message
      || error.response?.data?.error
      || error.message
      || 'An error occurred';
  }

  return error?.message || 'An unexpected error occurred';
}

/**
 * Helper to check if error is network error
 */
export function isNetworkError(error) {
  return axios.isAxiosError(error) && !error.response;
}

export default axiosInstance;

