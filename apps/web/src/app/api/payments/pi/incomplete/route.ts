import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const logger = {
  info: (msg: string, data?: any) => console.log(`[INCOMPLETE INFO] ${msg}`, data || ''),
  error: (msg: string, error?: any) => console.error(`[INCOMPLETE ERROR] ${msg}`, error || ''),
};

export async function POST(req: NextRequest) {
  try {
    const { paymentId } = await req.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Missing paymentId' },
        { status: 400 }
      );
    }

    const payment = await getPiPayment(paymentId);

    if (!payment) {
      logger.error('Payment not found on Pi Network', { paymentId });
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    const { status } = payment;

    if (!status.developer_approved) {
      const approved = await approvePiPayment(paymentId);
      
      if (!approved) {
        logger.error('Failed to approve payment', { paymentId });
        return NextResponse.json(
          { error: 'Failed to approve payment' },
          { status: 500 }
        );
      }
    }).catch(() => console.log("Record not found in DB, skipping local update."));

      await prisma.payment.update({
        where: { piPaymentId: paymentId },
        data: { status: 'APPROVED' },
      });
    }

    if (status.transaction_verified && !status.developer_completed) {
      const completed = await completePiPayment(paymentId, payment.transaction?.txid || '');
      
      if (!completed) {
        logger.error('Failed to complete payment', { paymentId });
        return NextResponse.json(
          { error: 'Failed to complete payment' },
          { status: 500 }
        );
      }

      await prisma.payment.update({
        where: { piPaymentId: paymentId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ payment });
  } catch (error) {
    logger.error('Incomplete payment error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
