import { NextRequest, NextResponse } from "next/server";
import { ok, error } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth";
import { unlockListing } from "@/lib/services/listings.service";

// POST /api/listings/:id/unlock
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  const result = unlockListing(guard.session, id);
  if ("error" in result) {
    const statusMap: Record<string, number> = {
      NOT_FOUND: 404,
      LISTING_INACTIVE: 410,
      AADHAAR_REQUIRED: 403,
      INSUFFICIENT_CREDITS: 402,
    };
    return error(result.error, statusMap[result.code] ?? 400, result.code);
  }

  return ok({ ...result.unlock, alreadyUnlocked: result.alreadyUnlocked });
}
