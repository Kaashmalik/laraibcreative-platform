/**
 * Get Current User Endpoint
 * Returns user data if authenticated via JWT cookies
 */

import { NextRequest, NextResponse } from 'next/server';
// import { verifyToken } from '@/backend/src/middleware/auth.middleware';
// import User from '@/backend/src/models/User';

// Force dynamic rendering since this route uses cookies
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify JWT token from cookies
    const token = request.cookies.get('accessToken')?.value || request.cookies.get('token')?.value;
    let user = null;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // For now, return a mock user response
    // TODO: Implement proper JWT verification
    user = {
      id: 'mock-id',
      _id: 'mock-id',
      email: 'user@example.com',
      fullName: 'Mock User',
      role: 'customer',
      isActive: true,
      isLocked: false,
      phone: '+923001234567',
      whatsapp: '+923001234567',
      avatar: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Return user data without sensitive fields
    const userData = {
      id: user._id || user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      isLocked: user.isLocked,
      phone: user.phone,
      whatsapp: user.whatsapp,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get user data' },
      { status: 500 }
    );
  }
}
