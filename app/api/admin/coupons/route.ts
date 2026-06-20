import { NextRequest } from "next/server";
import { ok, created, error } from "@/lib/api/response";
import { requireRole } from "@/lib/auth";
import { CreateCouponSchema } from "@/lib/api/validators";
import { createCoupon, listCoupons } from "@/lib/services/admin.service";

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "admin");
  if ("status" in auth) return auth;

  return ok(listCoupons());
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, "admin");
  if ("status" in auth) return auth;

  const body = await req.json().catch(() => ({}));
  const parsed = CreateCouponSchema.safeParse(body);

  if (!parsed.success) {
    return error(parsed.error.issues[0].message, 422);
  }

  const result = createCoupon({ ...parsed.data, isActive: true });
  if ("error" in result) return error(String(result.error), 400);

  return created(result);
}
