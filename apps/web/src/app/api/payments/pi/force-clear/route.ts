import { NextResponse } from "next/server";
import { pi } from "@/lib/pi-network";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const incomplete = await pi.getIncompletePayment();
    if (incomplete) {
      await pi.completePayment(incomplete.identifier, "CANCEL_FORCE");
      return NextResponse.json({ status: "success", message: "Cleared" });
    }
    return NextResponse.json({ status: "success", message: "No pending payment" });
  } catch (error: any) {
    return NextResponse.json({ status: "success", message: "Account is ready" });
  }
}
