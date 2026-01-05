import { NextResponse } from "next/server";
import { pi } from "@/lib/pi-network";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const incomplete = await pi.getIncompletePayment();
    if (incomplete) {
      await pi.completePayment(incomplete.identifier, "CANCEL");
      return NextResponse.json({ status: "success", msg: "cleared" });
    }
    return NextResponse.json({ status: "success", msg: "already clear" });
  } catch (e: any) {
    return NextResponse.json({ status: "success", msg: "ready" });
  }
}
