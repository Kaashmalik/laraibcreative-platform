// =============================================
// Token Utility Functions (Deprecated)
// httpOnly cookies are the source of truth for auth.
// =============================================

const TOKEN_KEY = 'auth_token';

const warnDeprecated = (action) => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(`[auth] ${action} is deprecated. Use httpOnly cookies via backend JWT auth.`);
  }
};

/**
 * Get token from localStorage (if available)
 */
export const getToken = () => {
  warnDeprecated('getToken');
  return null;
};

/**
 * Save token to localStorage
 * @param {string} token - JWT token string
 */
export const setToken = () => {
  warnDeprecated('setToken');
};

/**
 * Remove token from localStorage
 */
export const removeToken = () => {
  warnDeprecated('removeToken');
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
