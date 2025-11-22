/**
 * Enhanced JWT Middleware with Refresh Token Rotation
 * Implements secure token management with rotation for better security
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError, HttpStatus, ErrorCode } from '../utils/AppError';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        id: string;
        email: string;
        role: string;
        isActive: boolean;
        isLocked: boolean;
      };
      refreshToken?: string;
      requestId?: string;
    }
  }
}

interface TokenPayload {
  id: string;
  type?: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT access token
 */
export const generateAccessToken = (userId: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return jwt.sign(
    { id: userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (userId: string): string => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }
  
  return jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

/**
 * Set secure authentication cookies
 * Uses httpOnly, Secure, and SameSite=Strict for maximum security
 */
export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
  rememberMe: boolean = false
): void => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Access token cookie options (short-lived)
  const accessTokenOptions = {
    httpOnly: true, // Prevents XSS attacks
    secure: isProduction, // HTTPS only in production
    sameSite: 'strict' as const, // CSRF protection
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/'
  };

  // Refresh token cookie options (long-lived if rememberMe)
  const refreshTokenOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
    maxAge: rememberMe 
      ? 30 * 24 * 60 * 60 * 1000  // 30 days
      : 7 * 24 * 60 * 60 * 1000,  // 7 days
    path: '/'
  };

  res.cookie('accessToken', accessToken, accessTokenOptions);
  res.cookie('refreshToken', refreshToken, refreshTokenOptions);
};

/**
 * Clear authentication cookies
 */
export const clearAuthCookies = (res: Response): void => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
    path: '/'
  };
  
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
};

/**
 * Verify JWT access token
 */
export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;
    
    // Get token from Authorization header or cookie
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw AppError.unauthorized('Access denied. No token provided.', req.requestId);
    }

    if (!process.env.JWT_SECRET) {
      throw AppError.internal('JWT configuration error', req.requestId);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
    
    // Ensure this is an access token
    if (decoded.type && decoded.type !== 'access') {
      throw AppError.unauthorized('Invalid token type', req.requestId);
    }

    // Attach user ID to request (user will be loaded by route handler if needed)
    (req as any).userId = decoded.id;
    
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return next(AppError.unauthorized('Invalid token. Please login again.', req.requestId));
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return next(AppError.unauthorized('Token expired. Please login again.', req.requestId));
    }
    
    return next(AppError.internal('Authentication failed', req.requestId));
  }
};

/**
 * Verify refresh token (for token refresh endpoint)
 * Implements refresh token rotation for enhanced security
 */
export const verifyRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      throw AppError.unauthorized('Refresh token not provided.', req.requestId);
    }

    if (!process.env.JWT_REFRESH_SECRET) {
      throw AppError.internal('JWT configuration error', req.requestId);
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET) as TokenPayload;
    
    // Ensure this is a refresh token
    if (decoded.type && decoded.type !== 'refresh') {
      throw AppError.unauthorized('Invalid token type', req.requestId);
    }

    // Attach user ID and refresh token to request
    (req as any).userId = decoded.id;
    req.refreshToken = refreshToken;
    
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return next(AppError.unauthorized('Invalid refresh token.', req.requestId));
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return next(AppError.unauthorized('Refresh token expired. Please login again.', req.requestId));
    }
    
    return next(AppError.internal('Token refresh failed', req.requestId));
  }
};

/**
 * Optional authentication middleware
 * Doesn't fail if no token provided
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;
    
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token || !process.env.JWT_SECRET) {
      (req as any).user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
      (req as any).userId = decoded.id;
    } catch {
      // Ignore errors for optional auth
      (req as any).user = null;
    }
    
    next();
  } catch {
    (req as any).user = null;
    next();
  }
};

/**
 * Admin-only middleware (must be used after verifyToken)
 */
export const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(AppError.unauthorized('Authentication required', req.requestId));
  }

  if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
    return next(AppError.forbidden('Admin privileges required', req.requestId));
  }

  next();
};

/**
 * Role-based authorization middleware
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required', req.requestId));
    }

    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden(`Required role: ${roles.join(' or ')}`, req.requestId));
    }

    next();
  };
};

