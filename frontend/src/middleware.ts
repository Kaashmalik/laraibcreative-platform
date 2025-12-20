/**
 * Next.js Middleware
 * Handles Supabase Auth session refresh and route protection
 */


import { NextResponse, type NextRequest } from 'next/server'

// Custom Middleware for JWT Auth
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get token from cookies
  const token = request.cookies.get('accessToken')?.value
  const userStr = request.cookies.get('user')?.value // Optional: check user role from cookie if available

  // Route protection
  const isAuthPage = pathname.startsWith('/auth')
  const isAdminPage = pathname.startsWith('/admin')
  const isAccountPage = pathname.startsWith('/account')
  const isCheckoutPage = pathname.startsWith('/checkout')
  const isApiRoute = pathname.startsWith('/api')

  if (isApiRoute) return NextResponse.next()

  // Redirect unauthenticated users from protected pages
  if (!token && (isAccountPage || isCheckoutPage)) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (token && isAuthPage && !pathname.includes('logout')) {
    const returnUrl = request.nextUrl.searchParams.get('returnUrl') || '/account'
    const url = request.nextUrl.clone()
    url.pathname = returnUrl
    url.searchParams.delete('returnUrl')
    return NextResponse.redirect(url)
  }

  // Admin route protection handled by client components mostly, but basic check here
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

