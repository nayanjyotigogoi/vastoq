import { NextRequest } from "next/server";
import { ok, error } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/saved-listings/status?listing_id=<id>
// Returns { saved: boolean } for the currently authenticated user
export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  const listingId = req.nextUrl.searchParams.get("listing_id");
  if (!listingId) return error("listing_id is required", 400);

  try {
    const res = await fetch(
      `${API_URL}/saved-listings?user_id=${guard.session.userId}`,
      { headers: { Accept: "application/json" } }
    );

    if (!res.ok) return ok({ saved: false });

    const json = await res.json();
    const savedListings: any[] = json?.data ?? [];
    const isSaved = savedListings.some(
      (sl: any) => String(sl.listing_id) === String(listingId)
    );

    return ok({ saved: isSaved });
  } catch {
    return ok({ saved: false }); // fail-open: don't block the page
  }
}
