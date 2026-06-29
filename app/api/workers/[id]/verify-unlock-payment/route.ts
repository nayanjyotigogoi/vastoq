import { NextRequest, NextResponse } from "next/server";
import { ok, error } from "@/lib/api/response";
import { requireRole } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// POST /api/workers/:id/verify-unlock-payment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const guard = await requireRole(req, "tenant", "admin");
  if (guard instanceof NextResponse) return guard;

  try {
    const body = await req.json().catch(() => ({}));

    const res = await fetch(`${API_URL}/workers/${id}/verify-unlock-payment`, {
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
  } catch {
    return error("Unable to connect to backend", 500);
  }
}
