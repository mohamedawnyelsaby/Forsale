import { NextResponse } from 'next/server';
import pi from '@/lib/pi-network'; 

export async function GET() {
  try {
    const payment = await pi.getIncompletePayment();
    if (payment) {
      await pi.cancelPayment(payment.identifier);
      return NextResponse.json({ success: true, message: "تم إلغاء العملية المعلقة بنجاح: " + payment.identifier });
    }
    return NextResponse.json({ success: true, message: "لا توجد عمليات معلقة، حسابك نظيف." });
  } catch (error) {
    return NextResponse.json({ success: false, error: "فشل في إلغاء التعليق" }, { status: 500 });
  }
}
