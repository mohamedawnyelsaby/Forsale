import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const PI_API_URL = 'https://api.minepi.com/v2/payments';

export async function POST(request: NextRequest) {
  try {
    const { paymentId, reason } = await request.json();
    const PI_API_KEY = process.env.PI_API_KEY;

    // Call Pi Network API to void the incomplete payment
    const response = await fetch(`${PI_API_URL}/${paymentId}/incomplete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Update local database to reflect cancellation
    await prisma.payment.update({
      where: { paymentId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: reason || 'Incomplete payment handled by system'
      }
    }).catch(() => console.log("Record not found in DB, skipping local update."));

    return NextResponse.json({ success: true, message: 'Payment cancelled successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
