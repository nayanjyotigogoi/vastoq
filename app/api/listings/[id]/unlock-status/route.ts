import { NextRequest, NextResponse } from "next/server";
import { ok, error } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/listings/:id/unlock-status
// Returns the previously unlocked contact data if this user already unlocked the listing.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  try {
    const res = await fetch(
      `${API_URL}/listings/${id}/unlock-status?user_id=${guard.session.userId}`,
      { headers: { Accept: "application/json" } }
    );

    if (!res.ok) {
      return ok({ unlocked: false });
    }

    const json = await res.json();
    return ok(json.data ?? { unlocked: false });
  } catch {
    return ok({ unlocked: false });
  }
}
