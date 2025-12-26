import { NextResponse } from 'next/server';

// Health check endpoint - Required by Pi Network
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Forsale',
    version: '1.0.0',
  });
}

// Allow both GET and HEAD requests (Pi Network uses HEAD)
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
