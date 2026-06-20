import { NextRequest, NextResponse } from "next/server";
import { ok, error } from "@/lib/api/response";
import { ValidateCouponSchema } from "@/lib/api/validators";
import { requireAuth } from "@/lib/auth";
import { validateCoupon } from "@/lib/services/coupons.service";

// POST /api/coupons/validate
export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => ({}));
  const parsed = ValidateCouponSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const result = validateCoupon(
    parsed.data.code,
    guard.session.userId,
    guard.session.role,
    parsed.data.amount
  );

  if (!result.valid) return error(result.error, 400, "INVALID_COUPON");
  return ok({
    code: result.coupon.code,
    type: result.coupon.type,
    discount: result.discount,
    bonusCredits: result.bonusCredits,
  });
}
