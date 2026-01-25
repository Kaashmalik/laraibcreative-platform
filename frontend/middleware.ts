// Temporarily disable i18n middleware until [locale] routes are implemented
// To enable: create app/[locale]/layout.tsx and app/[locale]/page.tsx structure
// import createMiddleware from 'next-intl/middleware';
// import { routing } from './src/i18n/routing';

// export default createMiddleware(routing);

// export const config = {
//   // Match only internationalized pathnames
//   matcher: ['/', '/(en|ur)/:path*']
// };

import { NextResponse } from 'next/server';

// Simple middleware for now (no i18n)
export default function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};