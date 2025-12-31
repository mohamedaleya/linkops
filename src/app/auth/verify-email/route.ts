import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const targetUrl = new URL('/api/auth/verify-email', url.origin);
  targetUrl.search = url.search;
  return NextResponse.redirect(targetUrl);
}
