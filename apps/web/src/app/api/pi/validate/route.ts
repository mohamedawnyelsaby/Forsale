import { NextRequest, NextResponse } from 'next/server';

// Pi Network validation endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId } = body;

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // TODO: Validate payment with Pi Network API
    // For now, return success for testing
    return NextResponse.json({
      success: true,
      paymentId,
      status: 'approved',
    });
  } catch (error) {
    console.error('Pi validation error:', error);
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    );
  }
}

// Health check for Pi Network
export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'pi-validation',
  });
}
