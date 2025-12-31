/**
 * PI NETWORK INCOMPLETE PAYMENTS HANDLER
 * Processes incomplete payments found during authentication
 * apps/web/src/app/api/payments/pi/incomplete/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPiPayment, approvePiPayment, completePiPayment } from '@/lib/pi-network';
import { prisma } from '@forsale/database';

// ============================================
// TYPES
// ============================================

interface IncompletePaymentRequest {
  payment: {
    identifier: string;
    amount: number;
    user_uid: string;
    metadata: {
      orderId?: string;
      [key: string]: any;
    };
  };
}

// ============================================
// LOGGER
// ============================================

const logger = {
  info: (msg: string, data?: any) => console.log(`[INCOMPLETE] ${msg}`, data || ''),
  warn: (msg: string, data?: any) => console.warn(`[INCOMPLETE] ${msg}`, data || ''),
  error: (msg: string, error: any) => console.error(`[INCOMPLETE ERROR] ${msg}`, error),
};

// ============================================
// VALIDATION
// ============================================

function validateRequest(body: any): body is IncompletePaymentRequest {
  return (
    body &&
    body.payment &&
    typeof body.payment.identifier === 'string' &&
    typeof body.payment.amount === 'number' &&
    typeof body.payment.user_uid === 'string'
  );
}

// ============================================
// POST: Process Incomplete Payment
// ============================================

export async function POST(req: NextRequest) {
  try {
    // 1. Parse request
    const body = await req.json();

    if (!validateRequest(body)) {
      logger.error('Invalid request body', body);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { payment } = body;
    const paymentId = payment.identifier;

    logger.info('Processing incomplete payment', {
      paymentId,
      amount: payment.amount,
      userId: payment.user_uid,
    });

    // 2. Get full payment details from Pi Network
    const piPayment = await getPiPayment(paymentId);

    if (!piPayment) {
      logger.error('Payment not found on Pi Network', null, { paymentId });
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // 3. Check payment status
    const { status, transaction } = piPayment;

    // Case 1: Payment was cancelled
    if (status.cancelled || status.user_cancelled) {
      logger.info('Payment was cancelled', { paymentId });

      // Update order status in database if exists
      if (payment.metadata.orderId) {
        await prisma.order.updateMany({
          where: { 
            piTransactionId: paymentId,
            status: 'PENDING',
          },
          data: { status: 'CANCELLED' },
        });
      }

      return NextResponse.json({
        success: true,
        status: 'cancelled',
        message: 'Payment was cancelled',
      });
    }

    // Case 2: Payment needs approval
    if (!status.developer_approved) {
      logger.info('Payment needs approval', { paymentId });

      // Approve the payment
      const approved = await approvePiPayment(paymentId);

      if (!approved) {
        logger.error('Failed to approve payment', null, { paymentId });
        return NextResponse.json(
          { error: 'Failed to approve payment' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        status: 'approved',
        message: 'Payment approved, waiting for completion',
      });
    }

    // Case 3: Payment needs completion
    if (transaction && transaction.verified && !status.developer_completed) {
      logger.info('Payment needs completion', { 
        paymentId, 
        txid: transaction.txid 
      });

      // Complete the payment
      const completed = await completePiPayment(paymentId, transaction.txid);

      if (!completed) {
        logger.error('Failed to complete payment', null, { paymentId });
        return NextResponse.json(
          { error: 'Failed to complete payment' },
          { status: 500 }
        );
      }

      // Update order status
      if (payment.metadata.orderId) {
        await prisma.order.update({
          where: { id: payment.metadata.orderId },
          data: { 
            status: 'PAID',
            piTransactionId: paymentId,
          },
        });
      }

      logger.info('Payment completed successfully', { paymentId });

      return NextResponse.json({
        success: true,
        status: 'completed',
        txid: transaction.txid,
        message: 'Payment completed successfully',
      });
    }

    // Case 4: Payment already completed
    if (status.developer_completed) {
      logger.info('Payment already completed', { paymentId });

      return NextResponse.json({
        success: true,
        status: 'completed',
        message: 'Payment was already completed',
      });
    }

    // Case 5: Payment in unknown state
    logger.warn('Payment in unknown state', { paymentId, status });

    return NextResponse.json({
      success: false,
      status: 'unknown',
      message: 'Payment in unknown state',
    });

  } catch (error) {
    logger.error('Error processing incomplete payment', error as Error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// GET: List Incomplete Payments
// ============================================

export async function GET(req: NextRequest) {
  try {
    // Get user from authorization header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    // Get incomplete orders from database
    const incompleteOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        piTransactionId: { not: null },
      },
      select: {
        id: true,
        piTransactionId: true,
        total: true,
        createdAt: true,
        buyer: {
          select: {
            piUserId: true,
            piUsername: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      count: incompleteOrders.length,
      payments: incompleteOrders,
    });

  } catch (error) {
    logger.error('Error listing incomplete payments', error as Error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
