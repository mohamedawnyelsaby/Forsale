import { NextResponse } from "next/server";
import { pi } from "@/lib/pi-network";

export async function GET() {
  try {
    const incompletePayment = await pi.getIncompletePayment();
    if (incompletePayment) {
      await pi.cancelPayment(incompletePayment.identifier);
      return NextResponse.json({ status: "success", message: "Pending payment cancelled", id: incompletePayment.identifier });
    }
    return NextResponse.json({ status: "clean", message: "No pending payments found" });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
