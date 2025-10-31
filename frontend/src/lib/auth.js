/**
 * Authentication Utilities
 * Production-ready authentication helpers for LaraibCreative platform
 */

import * as storage from './storage';
import { jwtDecode } from 'jwt-decode';

// Auth token storage key
const AUTH_TOKEN_KEY = 'auth-token';
const USER_DATA_KEY = 'user-data';
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

/**
 * Store authentication token
 * @param {string} token - JWT token
 */
export function setAuthToken(token) {
  if (!token) {
    console.warn('[Auth] Attempted to set empty token');
    return;
  }
  storage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * Get stored authentication token
 * @returns {string|null} - JWT token or null
 */
export function getAuthToken() {
  return storage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Remove authentication token
 */
export function removeAuthToken() {
  storage.removeItem(AUTH_TOKEN_KEY);
  storage.removeItem(USER_DATA_KEY);
}

/**
 * Store user data
 * @param {Object} user - User data object
 */
export function setUserData(user) {
  if (!user) {
    console.warn('[Auth] Attempted to set empty user data');
    return;
  }
  storage.setItem(USER_DATA_KEY, JSON.stringify(user));
}

/**
 * Get stored user data
 * @returns {Object|null} - User data or null
 */
export function getUserData() {
  try {
    const data = storage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('[Auth] Error parsing user data:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean} - Authentication status
 */
export function isAuthenticated() {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const now = Date.now();
    
    // Check if token is expired
    if (decoded.exp * 1000 < now) {
      removeAuthToken();
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Auth] Error decoding token:', error);
    removeAuthToken();
    return false;
  }
}

/**
 * Check if user has admin role
 * @returns {boolean} - Admin status
 */
export function isAdmin() {
  const user = getUserData();
  return user?.role === 'admin' || user?.role === 'superadmin';
}

/**
 * Check if user has specific role
 * @param {string|Array<string>} roles - Role(s) to check
 * @returns {boolean} - Role status
 */
export function hasRole(roles) {
  const user = getUserData();
  if (!user?.role) return false;

  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.includes(user.role);
}

/**
 * Check if user has specific permission
 * @param {string} permission - Permission to check
 * @returns {boolean} - Permission status
 */
export function hasPermission(permission) {
  const user = getUserData();
  if (!user?.permissions) return false;

  return user.permissions.includes(permission);
}

/**
 * Decode JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded token payload or null
 */
export function decodeToken(token) {
  try {
    return jwtDecode(token || getAuthToken());
  } catch (error) {
    console.error('[Auth] Error decoding token:', error);
    return null;
  }
}

/**
 * Get token expiration time
 * @returns {Date|null} - Expiration date or null
 */
export function getTokenExpiration() {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return new Date(decoded.exp * 1000);
  } catch (error) {
    console.error('[Auth] Error getting token expiration:', error);
    return null;
  }
}

/**
 * Check if token needs refresh
 * @returns {boolean} - Whether token should be refreshed
 */
export function shouldRefreshToken() {
  const expiration = getTokenExpiration();
  if (!expiration) return false;

  const now = Date.now();
  const timeUntilExpiry = expiration.getTime() - now;

  return timeUntilExpiry < TOKEN_REFRESH_THRESHOLD && timeUntilExpiry > 0;
}

/**
 * Get time until token expires
 * @returns {number} - Milliseconds until expiration
 */
export function getTimeUntilExpiry() {
  const expiration = getTokenExpiration();
  if (!expiration) return 0;

  return Math.max(0, expiration.getTime() - Date.now());
}

/**
 * Format authentication header
 * @param {string} token - JWT token
 * @returns {Object} - Authorization header object
 */
export function getAuthHeader(token) {
  const authToken = token || getAuthToken();
  if (!authToken) return {};

  return {
    Authorization: `Bearer ${authToken}`
  };
}

/**
 * Handle authentication error
 * @param {Error} error - Error object
 * @returns {Object} - Formatted error response
 */
export function handleAuthError(error) {
  const response = error?.response;
  
  // Token expired or invalid
  if (response?.status === 401) {
    removeAuthToken();
    
    return {
      code: 'AUTH_EXPIRED',
      message: 'Session expired. Please login again.',
      shouldRedirect: true,
      redirectUrl: '/auth/login'
    };
  }

  // Forbidden - insufficient permissions
  if (response?.status === 403) {
    return {
      code: 'AUTH_FORBIDDEN',
      message: 'You do not have permission to access this resource.',
      shouldRedirect: false
    };
  }

  // Generic auth error
  return {
    code: 'AUTH_ERROR',
    message: response?.data?.message || 'Authentication failed.',
    shouldRedirect: false
  };
}

/**
 * Redirect to login with return URL
 * @param {string} returnUrl - URL to return to after login
 */
export function redirectToLogin(returnUrl) {
  if (typeof window === 'undefined') return;

  const currentPath = returnUrl || window.location.pathname;
  const loginUrl = `/auth/login${currentPath !== '/' ? `?returnUrl=${encodeURIComponent(currentPath)}` : ''}`;
  
  window.location.href = loginUrl;
}

/**
 * Get return URL from query params
 * @returns {string} - Return URL or default route
 */
export function getReturnUrl() {
  if (typeof window === 'undefined') return '/';

  const params = new URLSearchParams(window.location.search);
  const returnUrl = params.get('returnUrl');

  // Validate return URL to prevent open redirect
  if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')) {
    return returnUrl;
  }

  return '/';
}

/**
 * Clear all authentication data
 */
export function clearAuth() {
  removeAuthToken();
  
  // Clear any other auth-related data
  const keysToRemove = [
    'cart',
    'wishlist',
    'recent-views',
    'user-preferences'
  ];
  
  keysToRemove.forEach(key => storage.removeItem(key));
}

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} - Validation result
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password string
 * @returns {Object} - Validation result with strength level
 */
export function validatePasswordStrength(password) {
  if (!password) {
    return { valid: false, strength: 0, message: 'Password is required' };
  }

  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  let strength = 0;
  const issues = [];

  if (password.length >= minLength) strength++;
  else issues.push(`at least ${minLength} characters`);

  if (hasUpperCase) strength++;
  else issues.push('an uppercase letter');

  if (hasLowerCase) strength++;
  else issues.push('a lowercase letter');

  if (hasNumbers) strength++;
  else issues.push('a number');

  if (hasSpecialChar) strength++;
  else issues.push('a special character');

  const strengthLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  
  return {
    valid: strength >= 3,
    strength,
    level: strengthLevels[Math.min(strength, 4)],
    message: issues.length > 0 
      ? `Password must include: ${issues.join(', ')}` 
      : 'Password strength is good',
    requirements: {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    }
  };
}

/**
 * Generate secure password reset token hash (client-side verification)
 * @param {string} token - Reset token
 * @returns {string} - Hashed token
 */
export async function hashResetToken(token) {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    return token; // Fallback for SSR or old browsers
  }

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    console.error('[Auth] Error hashing token:', error);
    return token;
  }
}

/**
 * Format user display name
 * @param {Object} user - User object
 * @returns {string} - Formatted display name
 */
export function getUserDisplayName(user) {
  if (!user) return 'Guest';
  
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  if (user.firstName) return user.firstName;
  if (user.name) return user.name;
  if (user.email) return user.email.split('@')[0];
  
  return 'User';
}

/**
 * Get user initials for avatar
 * @param {Object} user - User object
 * @returns {string} - User initials
 */
export function getUserInitials(user) {
  if (!user) return '?';
  
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  
  const name = user.firstName || user.name || user.email;
  if (!name) return '?';
  
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  
  return name.substring(0, 2).toUpperCase();
}

/**
 * Session timeout manager
 */
export class SessionManager {
  constructor(timeoutMinutes = 30) {
    this.timeout = timeoutMinutes * 60 * 1000;
    this.warningTime = 5 * 60 * 1000; // 5 minutes warning
    this.timer = null;
    this.warningTimer = null;
    this.onWarning = null;
    this.onTimeout = null;
  }

  start(onWarning, onTimeout) {
    this.onWarning = onWarning;
    this.onTimeout = onTimeout;
    this.resetTimer();
    this.setupActivityListeners();
  }

  setupActivityListeners() {
    if (typeof window === 'undefined') return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, () => this.resetTimer(), { passive: true });
    });
  }

  resetTimer() {
    this.clearTimers();

    // Set warning timer
    this.warningTimer = setTimeout(() => {
      if (this.onWarning) this.onWarning();
    }, this.timeout - this.warningTime);

    // Set timeout timer
    this.timer = setTimeout(() => {
      if (this.onTimeout) this.onTimeout();
      this.logout();
    }, this.timeout);
  }

  clearTimers() {
    if (this.timer) clearTimeout(this.timer);
    if (this.warningTimer) clearTimeout(this.warningTimer);
  }

  logout() {
    clearAuth();
    redirectToLogin();
  }

  stop() {
    this.clearTimers();
  }
}

const authHelpers = {
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  setUserData,
  getUserData,
  isAuthenticated,
  isAdmin,
  hasRole,
  hasPermission,
  decodeToken,
  getTokenExpiration,
  shouldRefreshToken,
  getTimeUntilExpiry,
  getAuthHeader,
  handleAuthError,
  redirectToLogin,
  getReturnUrl,
  clearAuth,
  isValidEmail,
  validatePasswordStrength,
  hashResetToken,
  getUserDisplayName,
  getUserInitials,
  SessionManager
};

export default authHelpers;