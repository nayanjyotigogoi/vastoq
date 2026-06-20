import { NextRequest, NextResponse } from "next/server";
import { ok, error, noContent } from "@/lib/api/response";
import { UpdateListingSchema } from "@/lib/api/validators";
import { requireAuth } from "@/lib/auth";
import { getListing, updateListing, deleteListing } from "@/lib/services/listings.service";

// GET /api/listings/:id
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const listing = getListing(id, true);
  if (!listing) return error("Listing not found", 404);
  return ok(listing);
}

// PATCH /api/listings/:id
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => ({}));
  const parsed = UpdateListingSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const result = updateListing(id, guard.session.userId, guard.session.role, parsed.data);
  if ("error" in result) return error(result.error, result.code === "NOT_FOUND" ? 404 : 403, result.code);
  return ok(result);
}

// DELETE /api/listings/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  const result = deleteListing(id, guard.session.userId, guard.session.role);
  if ("error" in result) return error(result.error, result.code === "NOT_FOUND" ? 404 : 403, result.code);
  return noContent();
}
