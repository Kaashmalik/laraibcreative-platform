/**
 * Request ID Middleware
 * Adds unique request ID to all requests for tracing
 * Can be enhanced with cls-rtracer for async context preservation
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Generate a simple request ID
 */
const generateRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Request ID middleware
 * Extracts request ID from header or generates a new one
 */
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Get request ID from header or generate new one
  const requestId = (req.headers['x-request-id'] as string) || generateRequestId();
  
  // Attach to request
  (req as any).requestId = requestId;
  
  // Add to response header
  res.setHeader('X-Request-ID', requestId);
  
  next();
};

