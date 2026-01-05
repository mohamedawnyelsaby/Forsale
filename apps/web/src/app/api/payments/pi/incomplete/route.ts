import { NextResponse } from "next/server";
import { pi } from "@/lib/pi-network";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const payment = await request.json();
    const paymentId = payment.identifier;

    // محاولة تحديث قاعدة البيانات إذا وجد السجل
    try {
      await prisma.payment.update({
        where: { piPaymentId: paymentId },
        data: { status: "COMPLETED" },
      });
    } catch (e) {
      console.log("Record not found in DB, skipping local update.");
    }

    // إكمال العملية في Pi Network
    await pi.completePayment(paymentId, payment.transaction.txid);
    
    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
