/**
 * PI NETWORK WEBHOOK HANDLER
 * apps/web/src/app/api/payments/pi/webhook/route.ts
 * 
 * Receives payment status updates from Pi Network
 * IMPORTANT: This endpoint should be registered in Pi Developer Portal
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPiPayment, verifyPiTransaction } from '@/lib/pi-network';
import crypto from 'crypto';

const logger = {
  info: (message: string, data?: any) => console.log(`[INFO] ${message}`, data || ''),
  warn: (message: string, data?: any) => console.warn(`[WARN] ${message}`, data || ''),
  error: (message: string, error?: any) => console.error(`[ERROR] ${message}`, error),
};

interface WebhookPayload {
  payment_id: string;
  transaction_id?: string;
  status: string;
  amount: number;
  timestamp: string;
}

/**
 * Verify webhook signature from Pi Network
 * IMPORTANT: Pi Network signs webhooks to prevent spoofing
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null
): boolean {
  if (!signature) {
    logger.warn('No signature provided in webhook');
    return false;
  }

  try {
    const apiKey = process.env.PI_API_KEY;
    if (!apiKey) {
      logger.error('PI_API_KEY not configured');
      return false;
    }

    // Pi Network uses HMAC-SHA256 for webhook signatures
    const expectedSignature = crypto
      .createHmac('sha256', apiKey)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    logger.error('Signature verification error', error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Get raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get('x-pi-signature');

    // 2. Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      logger.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // 3. Parse webhook payload
    const payload: WebhookPayload = JSON.parse(rawBody);

    logger.info('Webhook received', {
      paymentId: payload.payment_id,
      status: payload.status,
      amount: payload.amount,
    });

    // 4. Get full payment details from Pi Network
    const payment = await getPiPayment(payload.payment_id);

    if (!payment) {
      logger.error('Payment not found', undefined, { 
        paymentId: payload.payment_id 
      });
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // 5. Process based on payment status
    const { status, transaction } = payment;

    // Case 1: Payment approved (user completed on their end)
    if (status.developer_approved && transaction && transaction.verified) {
      logger.info('Payment transaction verified', {
        paymentId: payment.identifier,
        txid: transaction.txid,
      });

      // Verify transaction on blockchain
      const isValid = await verifyPiTransaction(
        transaction.txid,
        payment.amount
      );

      if (!isValid) {
        logger.error('Transaction verification failed', undefined, {
          paymentId: payment.identifier,
          txid: transaction.txid,
        });
        
        return NextResponse.json(
          { error: 'Transaction verification failed' },
          { status: 400 }
        );
      }

      // TODO: Update payment and order in database
      // await prisma.$transaction([
      //   prisma.payment.update({
      //     where: { piPaymentId: payment.identifier },
      //     data: {
      //       status: 'COMPLETED',
      //       piTxid: transaction.txid,
      //       completedAt: new Date(),
      //     },
      //   }),
      //   prisma.order.update({
      //     where: { id: payment.metadata.orderId },
      //     data: { status: 'PAID' },
      //   }),
      // ]);

      // TODO: Send confirmation email/notification to user

      logger.info('Payment completed successfully', {
        paymentId: payment.identifier,
        orderId: payment.metadata.orderId,
      });
    }

    // Case 2: Payment cancelled
    if (status.cancelled || status.user_cancelled) {
      logger.info('Payment cancelled', { paymentId: payment.identifier });

      // TODO: Update payment and order status
      // await prisma.$transaction([
      //   prisma.payment.update({
      //     where: { piPaymentId: payment.identifier },
      //     data: { status: 'CANCELLED' },
      //   }),
      //   prisma.order.update({
      //     where: { id: payment.metadata.orderId },
      //     data: { status: 'CANCELLED' },
      //   }),
      // ]);

      // TODO: Restore product inventory if needed
    }

    // 6. Return success response to Pi Network
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
    });

  } catch (error) {
    logger.error('Webhook processing error', error as Error);
    
    // Return 200 to acknowledge receipt even if processing failed
    // This prevents Pi Network from retrying indefinitely
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal error - logged for review' 
      },
      { status: 200 }
    );
  }
}

// Health check for webhook endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Pi Network webhook endpoint',
    timestamp: new Date().toISOString(),
  });
}
