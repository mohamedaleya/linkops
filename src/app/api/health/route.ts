import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Docker healthcheck and load balancers
 */
export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: Date.now() });
}
