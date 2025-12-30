import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Use NEXT_PUBLIC_URL for production redirects to avoid 0.0.0.0 hostname issues
  const baseUrl = process.env.NEXT_PUBLIC_URL || request.url;

  // Auth routes that logged-in users should not access
  const authRoutes = ['/login', '/register'];

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard'];

  // If user is logged in and trying to access auth routes, redirect to dashboard
  if (sessionCookie && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard', baseUrl));
  }

  // If user is not logged in and trying to access protected routes, redirect to login
  if (
    !sessionCookie &&
    protectedRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL('/login', baseUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/register', '/dashboard/:path*'],
};
