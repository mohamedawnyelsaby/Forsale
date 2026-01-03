import { NextRequest, NextResponse } from 'next/server';
import { getPiPayment, verifyPiTransaction } from '@/lib/pi-network';
import { prisma } from '@forsale/database';

const logger = {
  info: (msg: string, data?: any) => console.log(`[WEBHOOK INFO] ${msg}`, data || ''),
  error: (msg: string, error?: any) => console.error(`[WEBHOOK ERROR] ${msg}`, error || ''),
};

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    if (!payload.payment_id) {
      return NextResponse.json(
        { error: 'Missing payment_id' },
        { status: 400 }
      );
    }

    const payment = await getPiPayment(payload.payment_id);

    if (!payment) {
      logger.error('Payment not found: ' + JSON.stringify({ paymentId: payload.payment_id }));
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    const { status, transaction } = payment;

    if (status.transaction_verified && transaction) {
      const isValid = await verifyPiTransaction(
        transaction.txid
      );

      if (!isValid) {
        logger.error('Transaction verification failed: ' + JSON.stringify({
          paymentId: payment.identifier,
          txid: transaction.txid,
        }));
        return NextResponse.json(
          { error: 'Transaction verification failed' },
          { status: 400 }
        );
      }

      await prisma.payment.update({
        where: { piPaymentId: payment.identifier },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      logger.info('Payment completed successfully', {
        paymentId: payment.identifier,
        txid: transaction.txid,
      });
    }

    if (status.cancelled || status.user_cancelled) {
      await prisma.payment.update({
        where: { piPaymentId: payment.identifier },
        data: {
          status: 'CANCELLED',
        },
      });

      logger.info('Payment cancelled', {
        paymentId: payment.identifier,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Webhook error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Pi Network Webhook',
    status: 'active'
  });
}
