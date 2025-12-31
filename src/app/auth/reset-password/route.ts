import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const targetUrl = new URL('/api/auth/reset-password', baseUrl);
  targetUrl.search = url.search;
  return NextResponse.redirect(targetUrl);
}
