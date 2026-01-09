/**
 * Next.js Middleware
 * Unified JWT authentication session management and route protection
 * Uses httpOnly cookies (accessToken, refreshToken) for secure authentication
 * Consistent with backend JWT auth system
 */

import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get JWT access token from httpOnly cookie (backend sets this)
  const token = request.cookies.get('accessToken')?.value

  // Route protection
  const isAuthPage = pathname.startsWith('/auth')
  const isAdminPage = pathname.startsWith('/admin')
  const isAccountPage = pathname.startsWith('/account')
  const isCheckoutPage = pathname.startsWith('/checkout')
  const isApiRoute = pathname.startsWith('/api')

  // Allow API routes to pass through (handled by backend)
  if (isApiRoute) return NextResponse.next()

  // Redirect unauthenticated users from protected pages
  if (!token && (isAccountPage || isCheckoutPage)) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages (except logout)
  if (token && isAuthPage && !pathname.includes('logout')) {
    const returnUrl = request.nextUrl.searchParams.get('returnUrl') || '/account'
    const url = request.nextUrl.clone()
    url.pathname = returnUrl
    url.searchParams.delete('returnUrl')
    return NextResponse.redirect(url)
  }

  // Admin route protection - basic check here, full role check on server
  if (isAdminPage && pathname !== '/admin/login' && !token) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

