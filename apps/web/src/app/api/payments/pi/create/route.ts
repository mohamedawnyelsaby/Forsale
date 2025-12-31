/**
 * PI NETWORK PAYMENT CREATION ENDPOINT
 * Creates new payment request for Pi Network
 * apps/web/src/app/api/payments/pi/create/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyPiAccessToken, isValidPiAmount } from '@/lib/pi-network';
import { prisma } from '@forsale/database';
import { CommissionCalculator } from '@forsale/utils';

// ============================================
// TYPES
// ============================================

interface CreatePaymentRequest {
  orderId: string;
  amount: number;
  memo: string;
  metadata?: Record<string, any>;
}

// ============================================
// LOGGER
// ============================================

const logger = {
  info: (msg: string, data?: any) => console.log(`[CREATE PAYMENT] ${msg}`, data || ''),
  error: (msg: string, error: any, data?: any) => console.error(`[CREATE PAYMENT ERROR] ${msg}`, error, data || ''),
};

// ============================================
// VALIDATION
// ============================================

function validateRequest(body: any): body is CreatePaymentRequest {
  return (
    body &&
    typeof body === 'object' &&
    typeof body.orderId === 'string' &&
    body.orderId.length > 0 &&
    typeof body.amount === 'number' &&
    body.amount > 0 &&
    typeof body.memo === 'string' &&
    body.memo.length > 0
  );
}

// ============================================
// POST: Create Payment
// ============================================

export async function POST(req: NextRequest) {
  try {
    // 1. Get and verify authorization
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.error('Missing authorization header');
      return NextResponse.json(
        { error: 'Unauthorized - Missing access token' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);

    // Verify user
    const user = await verifyPiAccessToken(accessToken);

    if (!user) {
      logger.error('Invalid access token');
      return NextResponse.json(
        { error: 'Unauthorized - Invalid access token' },
        { status: 401 }
      );
    }

    logger.info('User verified', { userId: user.uid });

    // 2. Parse and validate request
    const body = await req.json();

    if (!validateRequest(body)) {
      logger.error('Invalid request body', body);
      return NextResponse.json(
        { error: 'Bad Request - orderId, amount, and memo required' },
        { status: 400 }
      );
    }

    const { orderId, amount, memo, metadata = {} } = body;

    // Validate amount
    if (!isValidPiAmount(amount)) {
      logger.error('Invalid Pi amount', null, { amount });
      return NextResponse.json(
        { error: 'Invalid amount - must be between 0.0001 and 10,000 Pi' },
        { status: 400 }
      );
    }

    logger.info('Payment creation requested', {
      orderId,
      amount,
      userId: user.uid,
    });

    // 3. Get order from database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: {
          select: {
            id: true,
            piUserId: true,
            piUsername: true,
          },
        },
        seller: {
          select: {
            id: true,
            piUserId: true,
            piUsername: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      logger.error('Order not found', null, { orderId });
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify user owns this order
    if (order.buyer.piUserId !== user.uid) {
      logger.error('User does not own this order', null, {
        userId: user.uid,
        orderBuyer: order.buyer.piUserId,
      });
      return NextResponse.json(
        { error: 'Unauthorized - Not your order' },
        { status: 403 }
      );
    }

    // Verify order amount matches
    if (Math.abs(order.total - amount) > 0.0001) {
      logger.error('Amount mismatch', null, {
        orderTotal: order.total,
        requestedAmount: amount,
      });
      return NextResponse.json(
        { error: 'Amount mismatch' },
        { status: 400 }
      );
    }

    // Check if order already has a payment
    if (order.piTransactionId) {
      logger.warn('Order already has payment', { 
        orderId, 
        existingPaymentId: order.piTransactionId 
      });
      return NextResponse.json(
        { error: 'Order already has a payment' },
        { status: 400 }
      );
    }

    // 4. Create payment metadata
    const paymentMetadata = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      buyerId: order.buyer.id,
      sellerId: order.seller.id,
      itemCount: order.items.length,
      ...metadata,
    };

    // 5. Calculate commission breakdown
    const firstProduct = order.items[0]?.product;
    const category = firstProduct?.category || 'DEFAULT';
    
    const commission = CommissionCalculator.calculate(
      category as any,
      amount,
      0 // No volume discount for now
    );

    logger.info('Commission calculated', {
      amount: commission.grossPrice,
      commission: commission.commission,
      netToSeller: commission.netToSeller,
      effectiveRate: commission.effectiveRate,
    });

    // 6. Return payment data for frontend to initiate
    // Note: Actual payment is created by Pi SDK on frontend
    return NextResponse.json({
      success: true,
      payment: {
        amount,
        memo,
        metadata: paymentMetadata,
      },
      commission: {
        gross: commission.grossPrice,
        commission: commission.commission,
        net: commission.netToSeller,
        rate: commission.effectiveRate,
      },
      order: {
        id: order.id,
        number: order.orderNumber,
        total: order.total,
        itemCount: order.items.length,
      },
      message: 'Payment data prepared - initiate on frontend',
    });

  } catch (error) {
    logger.error('Payment creation error', error as Error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// GET: Get Payment Status
// ============================================

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId query parameter required' },
        { status: 400 }
      );
    }

    // Get order with payment info
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        piTransactionId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        number: order.orderNumber,
        status: order.status,
        total: order.total,
        paymentId: order.piTransactionId,
        hasPayment: !!order.piTransactionId,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });

  } catch (error) {
    logger.error('Get payment status error', error as Error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
