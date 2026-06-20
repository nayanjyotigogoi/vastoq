import { NextRequest, NextResponse } from "next/server";
import { ok } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth";
import { getCreditHistory } from "@/lib/services/payments.service";
import { db } from "@/lib/store";

// GET /api/credits — user balance + transaction history
export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  const user = db.users.get(guard.session.userId);
  const history = getCreditHistory(guard.session.userId);

  return ok({
    balance: user?.creditBalance ?? 0,
    history,
  });
}
