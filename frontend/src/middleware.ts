/**
 * Next.js Middleware
 * Handles i18n routing
 * 
 * TEMPORARILY DISABLED: i18n is not fully implemented yet
 * Re-enable when translations are ready
 */

// import createMiddleware from 'next-intl/middleware';
// import { routing } from './i18n/routing';

// export default createMiddleware(routing);

// export const config = {
//   // Match only internationalized pathnames
//   matcher: ['/', '/(ur|en)/:path*'],
// };

// Temporary middleware - does nothing, allowing normal routing
export function middleware() {
  return;
}

export const config = {
  matcher: [],
};

