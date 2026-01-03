import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { paymentId, txid } = await request.json();

    // Update payment status to completed and store transaction ID
    const updatedPayment = await prisma.payment.update({
      where: { paymentId },
      data: {
        status: 'completed',
        txid: txid,
        completedAt: new Date(),
      },
    });

    // Automatically create or update the product record for the seller
    const product = await prisma.product.create({
      data: {
        name: updatedPayment.productName,
        price: updatedPayment.amount,
        userId: updatedPayment.userId,
        status: 'sold',
        paymentId: updatedPayment.paymentId,
        txid: txid,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Payment completed and product saved',
      product 
    });
  } catch (error: any) {
    console.error('Completion Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
