import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { paymentId, userId, amount, productName } = await request.json();

    // Save initial payment record as pending_approval
    const payment = await prisma.payment.upsert({
      where: { paymentId },
      update: { status: 'pending_approval' },
      create: {
        paymentId,
        userId,
        amount,
        productName,
        status: 'pending_approval',
      },
    });

    // Notify Pi Network that we approve the payment creation
    return NextResponse.json({ success: true, payment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
