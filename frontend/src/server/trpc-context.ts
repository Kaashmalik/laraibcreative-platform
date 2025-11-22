/**
 * tRPC Context Creator
 * Creates context for each tRPC request
 */

import { Context } from './trpc';
import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function createContext(): Promise<Context> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || cookieStore.get('token')?.value;

  let user: Context['user'] = undefined;

  if (token) {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      
      // Check if token is expired
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        // Token expired
        return { user: undefined };
      }
      
      user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      // Invalid token, user remains undefined
      console.error('Token decode error:', error);
    }
  }

  return {
    user,
  };
}

