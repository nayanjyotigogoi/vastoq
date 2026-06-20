import { NextRequest, NextResponse } from "next/server";
import { ok, error } from "@/lib/api/response";
import { VerifyPaymentSchema } from "@/lib/api/validators";
import { requireAuth } from "@/lib/auth";
import { confirmPayment } from "@/lib/services/payments.service";

// POST /api/payments/verify
export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => ({}));
  const parsed = VerifyPaymentSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const result = confirmPayment(
    parsed.data.razorpayOrderId,
    parsed.data.razorpayPaymentId,
    parsed.data.razorpaySignature
  );

  if ("error" in result) return error(result.error, 400);
  return ok(result);
}
