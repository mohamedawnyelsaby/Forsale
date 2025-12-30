/**
 * HEALTH CHECK ENDPOINT
 * apps/web/src/app/api/health/route.ts
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'forsale-api',
    version: '1.0.0',
  });
}
