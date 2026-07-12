import { NextRequest, NextResponse } from "next/server";
import { ok, error } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// POST /api/payments/unlock-package/verify
export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  try {
    const body = await req.json().catch(() => ({}));
    const res = await fetch(`${API_URL}/payments/unlock-package/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        user_id: guard.session.userId,
        razorpay_payment_id: body.razorpay_payment_id,
        razorpay_order_id: body.razorpay_order_id,
        razorpay_signature: body.razorpay_signature,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      return error(json.message ?? "Payment verification failed", res.status);
    }

    return NextResponse.json(json);
  } catch (err: any) {
    return error(err?.message ?? "Unable to connect to backend", 500);
  }
}
