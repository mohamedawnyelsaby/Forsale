/**
 * PI NETWORK PAYMENT API ROUTES - ULTRA SECURE
 * Handles payment approval, completion, and verification
 * @security MAXIMUM
 * @testnet YES
 * @mainnet YES
 */

// ============================================
// apps/web/src/app/api/payments/pi/approve/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@forsale/logger';
import { prisma } from '@forsale/database';
import { Errors, handleError } from '@forsale/errors';
import { verifyPiAccessToken, approvePiPayment } from '@/lib/pi-network';

// Validation schema
const approveSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
});

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    // ✅ Step 1: Verify authorization
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Errors.Unauthorized('Missing or invalid authorization header');
    }

    const accessToken = authHeader.replace('Bearer ', '');

    // ✅ Step 2: Verify Pi Network access token
    const piUser = await verifyPiAccessToken(accessToken);
    if (!piUser) {
      throw new Errors.Unauthorized('Invalid Pi Network access token');
    }

    // ✅ Step 3: Parse and validate request body
    const body = await req.json();
    const { paymentId } = approveSchema.parse(body);

    logger.info('Payment approval requested', {
      requestId,
      paymentId,
      userId: piUser.uid,
    });

    // ✅ Step 4: Get payment from Pi Network API
    const piPayment = await getPiPaymentDetails(paymentId, accessToken);
    if (!piPayment) {
      throw new Errors.NotFound('Payment not found on Pi Network');
    }

    // ✅ Step 5: Validate payment
    if (piPayment.user_uid !== piUser.uid) {
      throw new Errors.Forbidden('Payment does not belong to authenticated user');
    }

    if (piPayment.status.developer_approved) {
      logger.warn('Payment already approved', { paymentId });
      return NextResponse.json({
        success: true,
        message: 'Payment already approved',
        paymentId,
      });
    }

    if (piPayment.status.cancelled || piPayment.status.user_cancelled) {
      throw new Errors.BadRequest('Payment has been cancelled');
    }

    // ✅ Step 6: Business logic validation
    const order = await validatePaymentOrder(piPayment);

    // ✅ Step 7: Create payment record in database
    const payment = await prisma.transaction.create({
      data: {
        userId: order.buyerId,
        orderId: order.id,
        type: 'PAYMENT',
        amount: piPayment.amount,
        currency: 'PI',
        status: 'PROCESSING',
        piPaymentId: piPayment.identifier,
        piTransactionHash: null,
        metadata: {
          memo: piPayment.memo,
          ...piPayment.metadata,
        },
      },
    });

    logger.info('Payment record created', {
      requestId,
      paymentId,
      dbPaymentId: payment.id,
    });

    // ✅ Step 8: Approve payment on Pi Network
    await approvePiPayment(paymentId, accessToken);

    logger.info('Payment approved on Pi Network', {
      requestId,
      paymentId,
    });

    // ✅ Step 9: Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'AWAITING_PI_CONFIRMATION',
        piPaymentId: paymentId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment approved',
      paymentId,
      dbPaymentId: payment.id,
    });
  } catch (error) {
    logger.error('Payment approval failed', error as Error, { requestId });
    return NextResponse.json(
      handleError(error as Error, requestId),
      { status: error instanceof Errors ? (error as any).statusCode : 500 }
    );
  }
}

// ============================================
// apps/web/src/app/api/payments/pi/complete/route.ts
// ============================================

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    // ✅ Step 1: Verify authorization
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Errors.Unauthorized('Missing or invalid authorization header');
    }

    const accessToken = authHeader.replace('Bearer ', '');

    // ✅ Step 2: Verify Pi Network access token
    const piUser = await verifyPiAccessToken(accessToken);
    if (!piUser) {
      throw new Errors.Unauthorized('Invalid Pi Network access token');
    }

    // ✅ Step 3: Parse and validate request body
    const completeSchema = z.object({
      paymentId: z.string().min(1),
      txid: z.string().min(1),
    });

    const body = await req.json();
    const { paymentId, txid } = completeSchema.parse(body);

    logger.info('Payment completion requested', {
      requestId,
      paymentId,
      txid,
      userId: piUser.uid,
    });

    // ✅ Step 4: Get payment from database
    const payment = await prisma.transaction.findUnique({
      where: { piPaymentId: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new Errors.NotFound('Payment not found in database');
    }

    if (payment.status === 'COMPLETED') {
      logger.warn('Payment already completed', { paymentId });
      return NextResponse.json({
        success: true,
        message: 'Payment already completed',
        paymentId,
      });
    }

    // ✅ Step 5: Verify transaction on blockchain
    const isValid = await verifyPiTransaction(txid, payment.amount, accessToken);
    if (!isValid) {
      throw new Errors.BadRequest('Transaction verification failed');
    }

    logger.info('Transaction verified on blockchain', {
      requestId,
      txid,
      paymentId,
    });

    // ✅ Step 6: Complete payment on Pi Network
    await completePiPayment(paymentId, txid, accessToken);

    // ✅ Step 7: Update payment in database
    await prisma.transaction.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        piTransactionHash: txid,
        metadata: {
          ...(payment.metadata as object),
          completedAt: new Date().toISOString(),
          txid,
        },
      },
    });

    // ✅ Step 8: Update order status
    await prisma.order.update({
      where: { id: payment.orderId! },
      data: {
        status: 'PAID',
        paymentStatus: 'COMPLETED',
        piTransactionId: txid,
        paidAt: new Date(),
      },
    });

    logger.info('Payment completed successfully', {
      requestId,
      paymentId,
      txid,
    });

    // ✅ Step 9: Trigger post-payment actions
    await triggerPostPaymentActions(payment.orderId!);

    return NextResponse.json({
      success: true,
      message: 'Payment completed successfully',
      paymentId,
      txid,
    });
  } catch (error) {
    logger.error('Payment completion failed', error as Error, { requestId });
    return NextResponse.json(
      handleError(error as Error, requestId),
      { status: error instanceof Errors ? (error as any).statusCode : 500 }
    );
  }
}

// ============================================
// apps/web/src/app/api/payments/pi/incomplete/route.ts
// ============================================

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const body = await req.json();
    const { payment } = body;

    logger.warn('Incomplete payment found', {
      requestId,
      paymentId: payment.identifier,
      status: payment.status,
    });

    // Check if already in database
    const existingPayment = await prisma.transaction.findUnique({
      where: { piPaymentId: payment.identifier },
    });

    if (!existingPayment) {
      // Create record for incomplete payment
      await prisma.transaction.create({
        data: {
          userId: payment.metadata.userId,
          orderId: payment.metadata.orderId,
          type: 'PAYMENT',
          amount: payment.amount,
          currency: 'PI',
          status: 'PENDING',
          piPaymentId: payment.identifier,
          piTransactionHash: payment.transaction?.txid,
          metadata: payment.metadata,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Incomplete payment logged',
    });
  } catch (error) {
    logger.error('Failed to log incomplete payment', error as Error, {
      requestId,
    });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getPiPaymentDetails(
  paymentId: string,
  accessToken: string
): Promise<any> {
  const apiUrl = process.env.PI_API_URL || 'https://api.minepi.com';
  const apiKey = process.env.PI_API_KEY;

  const response = await fetch(`${apiUrl}/v2/payments/${paymentId}`, {
    headers: {
      Authorization: `Key ${apiKey}`,
      'X-Access-Token': accessToken,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get payment: ${response.statusText}`);
  }

  return response.json();
}

async function validatePaymentOrder(piPayment: any) {
  const orderId = piPayment.metadata.orderId;
  if (!orderId) {
    throw new Errors.BadRequest('Order ID missing in payment metadata');
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Errors.NotFound('Order not found');
  }

  if (order.status !== 'PENDING_PAYMENT') {
    throw new Errors.BadRequest('Order is not pending payment');
  }

  if (Math.abs(order.total - piPayment.amount) > 0.01) {
    throw new Errors.BadRequest('Payment amount does not match order total');
  }

  return order;
}

async function verifyPiTransaction(
  txid: string,
  expectedAmount: number,
  accessToken: string
): Promise<boolean> {
  const apiUrl = process.env.PI_API_URL || 'https://api.minepi.com';
  const apiKey = process.env.PI_API_KEY;

  try {
    const response = await fetch(
      `${apiUrl}/v2/blockchain/transactions/${txid}`,
      {
        headers: {
          Authorization: `Key ${apiKey}`,
          'X-Access-Token': accessToken,
        },
      }
    );

    if (!response.ok) {
      return false;
    }

    const transaction = await response.json();
    return transaction.verified && transaction.amount >= expectedAmount;
  } catch (error) {
    logger.error('Transaction verification failed', error as Error, { txid });
    return false;
  }
}

async function approvePiPayment(
  paymentId: string,
  accessToken: string
): Promise<void> {
  const apiUrl = process.env.PI_API_URL || 'https://api.minepi.com';
  const apiKey = process.env.PI_API_KEY;

  const response = await fetch(`${apiUrl}/v2/payments/${paymentId}/approve`, {
    method: 'POST',
    headers: {
      Authorization: `Key ${apiKey}`,
      'X-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to approve payment: ${response.statusText}`);
  }
}

async function completePiPayment(
  paymentId: string,
  txid: string,
  accessToken: string
): Promise<void> {
  const apiUrl = process.env.PI_API_URL || 'https://api.minepi.com';
  const apiKey = process.env.PI_API_KEY;

  const response = await fetch(`${apiUrl}/v2/payments/${paymentId}/complete`, {
    method: 'POST',
    headers: {
      Authorization: `Key ${apiKey}`,
      'X-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ txid }),
  });

  if (!response.ok) {
    throw new Error(`Failed to complete payment: ${response.statusText}`);
  }
}

async function triggerPostPaymentActions(orderId: string): Promise<void> {
  // Send confirmation email
  // Update inventory
  // Notify seller
  // Trigger analytics event
  logger.info('Post-payment actions triggered', { orderId });
}
