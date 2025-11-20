/**
 * useAuth Hook Tests
 * Tests for the useAuth custom hook
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useAuth, AuthProvider } from '@/context/AuthContext';
import { AllTheProviders } from '../__mocks__/test-utils';

// Mock fetch
global.fetch = jest.fn();

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within AuthProvider');
  });

  it('should return auth context when used inside provider', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current).toBeDefined();
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBeDefined();
    expect(result.current.login).toBeDefined();
    expect(result.current.logout).toBeDefined();
  });

  it('should handle login', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'test-token',
        user: { id: '1', email: 'test@example.com' },
      }),
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const loginResult = await result.current.login('test@example.com', 'password');

    expect(loginResult.success).toBe(true);
    expect(localStorage.getItem('auth_token')).toBe('test-token');
  });

  it('should handle login failure', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Invalid credentials',
      }),
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const loginResult = await result.current.login('test@example.com', 'wrong');

    expect(loginResult.success).toBe(false);
    expect(loginResult.error).toBe('Invalid credentials');
  });

  it('should handle logout', async () => {
    localStorage.setItem('auth_token', 'test-token');

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await result.current.logout();

    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});

