/**
 * Environment Variable Validation
 * Ensures required environment variables are present at runtime
 */

import { z } from 'zod';

/**
 * Client-side environment variables schema
 * Only NEXT_PUBLIC_ prefixed variables are available on the client
 */
const clientEnvSchema = z.object({
  // API Configuration
  NEXT_PUBLIC_API_URL: z.string().url().optional().default('http://localhost:5000/api'),
  NEXT_PUBLIC_BACKEND_URL: z.string().url().optional().default('http://localhost:5000'),
  
  // Supabase (optional - only if using Supabase auth)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  
  // Analytics (optional)
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_FB_PIXEL_ID: z.string().optional(),
  NEXT_PUBLIC_ANALYTICS_URL: z.string().url().optional(),
  NEXT_PUBLIC_ANALYTICS_DEV: z.string().optional(),
  
  // Features (optional)
  NEXT_PUBLIC_ENABLE_PWA: z.string().optional().default('true'),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().optional().default('false'),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
});

/**
 * Server-side environment variables schema
 * These are only available on the server
 */
const serverEnvSchema = z.object({
  // Database
  DATABASE_URL: z.string().optional(),
  
  // Authentication
  JWT_SECRET: z.string().min(32).optional(),
  
  // External Services
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  
  // AI Services
  GROQ_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

/**
 * Validated client environment variables
 */
function getClientEnv() {
  // Only validate on client or during build
  const env = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_FB_PIXEL_ID: process.env.NEXT_PUBLIC_FB_PIXEL_ID,
    NEXT_PUBLIC_ANALYTICS_URL: process.env.NEXT_PUBLIC_ANALYTICS_URL,
    NEXT_PUBLIC_ANALYTICS_DEV: process.env.NEXT_PUBLIC_ANALYTICS_DEV,
    NEXT_PUBLIC_ENABLE_PWA: process.env.NEXT_PUBLIC_ENABLE_PWA,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    NODE_ENV: process.env.NODE_ENV,
  };

  const result = clientEnvSchema.safeParse(env);
  
  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format());
    
    // In development, throw error. In production, use defaults
    if (process.env.NODE_ENV === 'development') {
      throw new Error('Invalid environment variables');
    }
  }

  return result.success ? result.data : clientEnvSchema.parse({});
}

/**
 * Validated server environment variables
 */
function getServerEnv() {
  // Only run on server
  if (typeof window !== 'undefined') {
    throw new Error('getServerEnv should only be called on the server');
  }

  const result = serverEnvSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('❌ Invalid server environment variables:', result.error.format());
  }

  return result.success ? result.data : {};
}

// Export validated environment
export const env = getClientEnv();

// Export server env getter (only use on server)
export { getServerEnv };

// Export type for TypeScript
export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Helper to check if feature is enabled
 */
export function isFeatureEnabled(feature: keyof ClientEnv): boolean {
  const value = env[feature];
  return value === 'true' || value === '1';
}

/**
 * Get API URL with fallback
 */
export function getApiUrl(): string {
  return env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
}

/**
 * Get backend URL with fallback
 */
export function getBackendUrl(): string {
  return env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
}

/**
 * Check if in production
 */
export function isProduction(): boolean {
  return env.NODE_ENV === 'production';
}

/**
 * Check if in development
 */
export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development';
}

export default env;

