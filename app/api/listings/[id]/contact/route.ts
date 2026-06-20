import { NextRequest, NextResponse } from "next/server";
import { ok, error } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/store";

/**
 * GET /api/listings/:id/contact
 * Returns the unlocked contact details (phone + address) for a listing
 * the calling user has already unlocked and the unlock has not expired.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  const unlock = Array.from(db.unlocks.values()).find(
    (u) =>
      u.userId === guard.session.userId &&
      u.targetType === "listing" &&
      u.targetId === id &&
      new Date(u.expiresAt) > new Date()
  );

  if (!unlock) {
    return error(
      "You have not unlocked this listing or the unlock has expired",
      403,
      "NOT_UNLOCKED"
    );
  }

  return ok({
    phone: unlock.revealedPhone,
    address: unlock.revealedAddress,
    expiresAt: unlock.expiresAt,
  });
}
