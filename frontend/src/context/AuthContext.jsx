import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import api from '@/lib/api';
import { getToken, setToken, removeToken, getUserFromToken } from '@/lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auto-load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = getToken();
      if (token) {
        try {
          // First try to get user from token
          const userData = getUserFromToken();
          // Then verify token with backend
          const { valid } = await api.auth.verifyToken();
          if (valid) {
            setUser(userData);
          } else {
            throw new Error('Token invalid');
          }
        } catch (err) {
          console.error('Auth token validation failed:', err);
          removeToken();
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    loadUser();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      setIsLoading(true);
      const { token, user: userData } = await api.auth.login(email, password);
      setToken(token);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setError(null);
      setIsLoading(true);
      const { token, user: newUser } = await api.auth.register(userData);
      setToken(token);
      setUser(newUser);
      return newUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      await api.auth.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      removeToken();
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (data) => {
    try {
      setError(null);
      setIsLoading(true);
      const updatedUser = await api.customers.updateProfile(data);
      setUser(current => ({ ...current, ...updatedUser }));
      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    try {
      setError(null);
      setIsLoading(true);
      await api.auth.forgotPassword(email);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (token, newPassword) => {
    try {
      setError(null);
      setIsLoading(true);
      await api.auth.resetPassword(token, newPassword);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    register,
    updateUser,
    forgotPassword,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
