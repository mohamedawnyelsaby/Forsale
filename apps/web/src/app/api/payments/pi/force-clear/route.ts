import { NextResponse } from "next/server";
import { pi } from "@/lib/pi-network";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // التأكد من أن المكتبة تم تحميلها
    if (!pi) {
      throw new Error("Pi SDK not initialized");
    }

    const incompletePayment = await pi.getIncompletePayment();
    
    if (incompletePayment) {
      // إكمال العملية أو إلغاؤها إذا كانت موجودة
      await pi.completePayment(incompletePayment.identifier, "FORCE_CANCEL_BY_USER");
      return NextResponse.json({ 
        status: "success", 
        message: "Incomplete payment found and cleared.",
        id: incompletePayment.identifier 
      });
    }

    return NextResponse.json({ 
      status: "success", 
      message: "No incomplete payments found. Your account is clear." 
    });
  } catch (error: any) {
    console.error("Force clear error:", error);
    return NextResponse.json({ 
      status: "error", 
      message: error.message || "Failed to clear payments" 
    }, { status: 500 });
  }
}
