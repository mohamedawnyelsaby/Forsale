// File: apps/web/src/app/api/pi/complete/route.ts
// Pi Network Payment Completion Endpoint

import { NextRequest, NextResponse } from 'next/server';

const logger = {
  info: (msg: string, data?: any) => console.log(`[PI COMPLETE] ${msg}`, data || ''),
  error: (msg: string, error: any) => console.error(`[PI COMPLETE ERROR] ${msg}`, error),
};

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { paymentId, txid } = body;

    if (!paymentId || !txid) {
      logger.error('Missing required fields', { paymentId, txid });
      return NextResponse.json(
        { success: false, error: 'paymentId and txid are required' },
        { status: 400 }
      );
    }

    logger.info('Payment completion received', { paymentId, txid });

    // Get Pi API credentials from environment
    const PI_API_KEY = process.env.PI_API_KEY;
    const PI_API_URL = process.env.PI_API_URL || 'https://api.minepi.com';

    if (!PI_API_KEY) {
      logger.error('PI_API_KEY not configured');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Complete payment with Pi Network API
    try {
      const completeResponse = await fetch(
        `${PI_API_URL}/v2/payments/${paymentId}/complete`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Key ${PI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ txid }),
        }
      );

      if (!completeResponse.ok) {
        const errorText = await completeResponse.text();
        logger.error('Pi API completion failed', {
          status: completeResponse.status,
          error: errorText,
        });

        return NextResponse.json(
          { 
            success: false, 
            error: `Pi API error: ${completeResponse.status}` 
          },
          { status: completeResponse.status }
        );
      }

      const completeData = await completeResponse.json();
      logger.info('Payment completed successfully', { 
        paymentId, 
        txid, 
        data: completeData 
      });

      // TODO: Update payment in database
      // await prisma.payment.update({
      //   where: { piPaymentId: paymentId },
      //   data: {
      //     status: 'COMPLETED',
      //     txid: txid,
      //     completedAt: new Date(),
      //   }
      // });

      // TODO: Update order status
      // await prisma.order.update({
      //   where: { id: metadata.orderId },
      //   data: { status: 'PAID' }
      // });

      return NextResponse.json({
        success: true,
        paymentId,
        txid,
        message: 'Payment completed successfully',
      });
    } catch (apiError: any) {
      logger.error('Pi API request failed', apiError);
      return NextResponse.json(
        { 
          success: false, 
          error: `API request failed: ${apiError.message}` 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    logger.error('Completion endpoint error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET method to check if endpoint is working
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Pi Payment Completion Endpoint',
    timestamp: new Date().toISOString(),
  });
}
