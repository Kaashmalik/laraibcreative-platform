/**
 * Get Current User Endpoint
 * Proxies to backend API to verify JWT token and return user data
 * This route is DEPRECATED - use /api/v1/auth/me directly from backend
 */

import { NextRequest, NextResponse } from 'next/server';
import axiosInstance from '@/lib/axios';

// Force dynamic rendering since this route uses cookies
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Proxy to backend API
    const response = await axiosInstance.get('/auth/me');

    return NextResponse.json(response);

  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get user data' },
      { status: 500 }
    );
  }
}
