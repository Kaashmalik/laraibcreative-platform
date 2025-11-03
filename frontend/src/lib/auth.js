// =============================================
// Token Utility Functions
// Handles storing, retrieving, and decoding JWT tokens
// =============================================

const TOKEN_KEY = 'auth_token';

/**
 * Get token from localStorage (if available)
 */
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

/**
 * Save token to localStorage
 * @param {string} token - JWT token string
 */
export const setToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/**
 * Remove token from localStorage
 */
export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

/**
 * Decode user data from JWT token
 * @param {string} token - JWT token
 * @returns {object|null} Decoded user payload or null if invalid
 */
export const getUserFromToken = (token) => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    // Return null if decoding fails
    return null;
  }
};
