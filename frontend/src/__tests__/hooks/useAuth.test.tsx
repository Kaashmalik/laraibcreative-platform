/**
 * useAuth Hook Tests
 * Tests for the useAuth custom hook
 */

import { renderHook, waitFor } from '@testing-library/react';
import useAuth from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

jest.mock('@/lib/axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: null,
      loading: false,
      isAuthenticated: false,
      isAdmin: false,
    });
  });

  it('should expose auth state and actions', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current).toBeDefined();
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBeDefined();
    expect(result.current.login).toBeDefined();
    expect(result.current.logout).toBeDefined();
  });

  it('should handle login', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      success: true,
      data: {
        user: { id: '1', email: 'test@example.com', role: 'customer' },
      },
    });

    const { result } = renderHook(() => useAuth());

    const loginResult = await result.current.login('test@example.com', 'password');

    expect(loginResult.success).toBe(true);
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.email).toBe('test@example.com');
    });
  });

  it('should handle login failure', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Invalid credentials',
        },
      },
    });

    const { result } = renderHook(() => useAuth());

    const loginResult = await result.current.login('test@example.com', 'wrong');

    expect(loginResult.success).toBe(false);
    expect(loginResult.error).toBe('Invalid credentials');
  });

  it('should handle logout', async () => {
    mockedAxios.post
      .mockResolvedValueOnce({
        success: true,
        data: {
          user: { id: '1', email: 'test@example.com', role: 'customer' },
        },
      })
      .mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useAuth());

    await result.current.login('test@example.com', 'password');

    await result.current.logout();

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });
});

