import { NextRequest, NextResponse } from "next/server";
import { ok, created, error } from "@/lib/api/response";
import { requireAuth, getSession } from "@/lib/auth";
import {
  createListing,
  listListings,
} from "@/lib/services/listings.service";

// GET /api/listings
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

const filters = {
  search: searchParams.get('search') || undefined,

  city: searchParams.get('city') || undefined,

  locality:
    searchParams.get('locality') || undefined,

  property_type:
    searchParams.get('property_type') || undefined,

  bhk_type:
    searchParams.get('bhk_type') || undefined,

  furnishing:
    searchParams.get('furnishing') || undefined,

  gender_preference:
    searchParams.get('gender_preference') || undefined,

  verified_only:
    searchParams.get('verified_only') || undefined,

  sort:
    searchParams.get('sort') || undefined,

  min_rent: searchParams.get('min_rent')
    ? Number(searchParams.get('min_rent'))
    : undefined,

  max_rent: searchParams.get('max_rent')
    ? Number(searchParams.get('max_rent'))
    : undefined,

  page: searchParams.get('page')
    ? Number(searchParams.get('page'))
    : 1,

  per_page: searchParams.get('per_page')
    ? Number(searchParams.get('per_page'))
    : undefined,
}
    const session = await getSession();
    const listings = await listListings({
      ...filters,
      user_id: session?.userId,
    });

    return ok(listings);

  } catch (e: any) {

    return error(
      e?.response?.data?.message ??
      e?.message ??
      "Failed to fetch listings",
      500
    );

  }
}

// POST /api/listings
export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);

  if (guard instanceof NextResponse) {
    return guard;
  }

  if (!["owner", "admin"].includes(guard.session.role)) {
    return error(
      "Only property owners can create listings",
      403,
      "FORBIDDEN"
    );
  }

  try {

    const body = await req.json();

    const listing = await createListing({
      ...body,
      owner_id: guard.session.userId,
    });

    return created(listing);

  } catch (e: any) {

    return error(
      e?.response?.data?.message ??
      e?.message ??
      "Failed to create listing",
      500
    );

  }
}