import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { ok, error } from "@/lib/api/response";
import { getMyListings } from "@/lib/services/listings.service";

export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);

  if (guard instanceof NextResponse) {
    return guard;
  }

  try {
    const listings = await getMyListings(
        String(guard.session.userId)
    );

    return ok(listings);

  } catch (e: any) {

    return error(
      e?.response?.data?.message ??
      e?.message ??
      "Failed to load listings",
      500
    );

  }
}