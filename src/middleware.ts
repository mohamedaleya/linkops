import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Auth routes that logged-in users should not access
  const authRoutes = ['/login', '/register'];

  // Protected routes that require authentication
  const protectedRoutes = ['/links'];

  // If user is logged in and trying to access auth routes, redirect to dashboard
  if (sessionCookie && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/links', request.url));
  }

  // If user is not logged in and trying to access protected routes, redirect to login
  if (
    !sessionCookie &&
    protectedRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/register', '/links/:path*'],
};
