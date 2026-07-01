import { NextRequest, NextResponse } from "next/server";
import { ok, error, noContent } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth";
import { getListing, updateListing, deleteListing } from "@/lib/services/listings.service";

// GET /api/listings/:id
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const listing = await getListing(id);
    return ok(listing);
  } catch (e: any) {
    const status = e?.response?.status === 404 ? 404 : 500;
    return error(e?.response?.data?.message ?? "Listing not found", status);
  }
}

// PATCH /api/listings/:id
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  const body  = await req.json().catch(() => ({}));
  const token = req.cookies.get("token")?.value;

  try {
    const result = await updateListing(id, body, token);
    return ok(result);
  } catch (e: any) {
    const status = e?.response?.status ?? 500;
    return error(e?.response?.data?.message ?? "Failed to update listing", status);
  }
}

// DELETE /api/listings/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  const token = req.cookies.get("token")?.value;

  try {
    await deleteListing(id, token);
    return noContent();
  } catch (e: any) {
    const status = e?.response?.status ?? 500;
    return error(e?.response?.data?.message ?? "Failed to delete listing", status);
  }
}
