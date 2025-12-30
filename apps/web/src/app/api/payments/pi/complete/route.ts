/**
 * PI NETWORK PAYMENT COMPLETION ENDPOINT
 * apps/web/src/app/api/payments/pi/complete/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { completePiPayment, verifyPiAccessToken } from '@/lib/pi-network';

const logger = {
  info: (message: string, data?: any) => console.log(`[INFO] ${message}`, data || ''),
  error: (message: string, error?: any, data?: any) => console.error(`[ERROR] ${message}`, error, data || ''),
};

interface CompletePaymentRequest {
  paymentId: string;
  txid: string;
}

function validateRequest(body: any): body is CompletePaymentRequest {
  return (
    body &&
    typeof body === 'object' &&
    typeof body.paymentId === 'string' &&
    body.paymentId.length > 0 &&
    typeof body.txid === 'string' &&
    body.txid.length > 0
  );
}

export async function POST(req: NextRequest) {
  try {
    // 1. Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.error('Missing or invalid authorization header');
      return NextResponse.json(
        { error: 'Unauthorized - Missing access token' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);

    // 2. Verify access token
    const user = await verifyPiAccessToken(accessToken);
    if (!user) {
      logger.error('Invalid Pi Network access token');
      return NextResponse.json(
        { error: 'Unauthorized - Invalid access token' },
        { status: 401 }
      );
    }

    logger.info('User authenticated', { userId: user.uid });

    // 3. Parse and validate request body
    const body = await req.json();
    if (!validateRequest(body)) {
      logger.error('Invalid request body', { body });
      return NextResponse.json(
        { error: 'Bad Request - paymentId and txid are required' },
        { status: 400 }
      );
    }

    const { paymentId, txid } = body;

    logger.info('Payment completion requested', { paymentId, txid, userId: user.uid });

    // 4. Complete payment with Pi Network
    const completed = await completePiPayment(paymentId, txid, accessToken);

    if (!completed) {
      logger.error('Pi Network payment completion failed', undefined, { paymentId, txid });
      return NextResponse.json(
        { error: 'Payment completion failed' },
        { status: 500 }
      );
    }

    // 5. TODO: Update order status in database
    // await prisma.payment.update({
    //   where: { piPaymentId: paymentId },
    //   data: {
    //     status: 'COMPLETED',
    //     piTxid: txid,
    //     completedAt: new Date(),
    //   },
    // });

    logger.info('Payment completed successfully', { paymentId, txid });

    // 6. Return success response
    return NextResponse.json({
      success: true,
      paymentId,
      txid,
      message: 'Payment completed successfully',
    });

  } catch (error) {
    logger.error('Payment completion error', error as Error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
