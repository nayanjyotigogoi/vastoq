import { NextRequest, NextResponse } from "next/server";
import { ok } from "@/lib/api/response";
import { requireRole } from "@/lib/auth";
import { getOwnerListings } from "@/lib/services/listings.service";

// GET /api/owner/listings — all listings belonging to the authenticated owner
export async function GET(req: NextRequest) {
  const guard = await requireRole(req, "owner", "admin");
  if (guard instanceof NextResponse) return guard;

  const listings = getOwnerListings(guard.session.userId);
  return ok(listings);
}
