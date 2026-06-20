import { NextRequest, NextResponse } from "next/server";
import { ok, error } from "@/lib/api/response";
import { CreateOrderSchema } from "@/lib/api/validators";
import { requireAuth } from "@/lib/auth";
import { createOrder } from "@/lib/services/payments.service";

// POST /api/payments/create-order
export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => ({}));
  const parsed = CreateOrderSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const result = await createOrder(
    guard.session.userId,
    parsed.data.amount,
    parsed.data.couponCode
  );

  if ("error" in result) return error(result.error, 400);
  return ok(result);
}
