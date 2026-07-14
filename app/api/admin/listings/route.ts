import { NextRequest } from "next/server";
import { ok, error } from "@/lib/api/response";
import { requireRole } from "@/lib/auth";

const BACKEND = process.env.NEXT_PUBLIC_API_URL;

function toListing(l: any) {
  return {
    id:            l.id,
    title:         l.title,
    description:   l.description,
    locality:      l.locality,
    city:          l.city,
    pincode:       l.pincode,
    address:       l.address,
    latitude:      l.latitude,
    longitude:     l.longitude,
    rentPerMonth:  Number(l.rent_per_month ?? 0),
    deposit:       Number(l.deposit ?? 0),
    areaSqft:      l.area_sqft,
    floorNumber:   l.floor_number,
    propertyType:  l.property_type,
    bhkType:       l.bhk_type,
    furnishing:    l.furnishing,
    listingClass:  l.listing_class,
    genderPref:    l.gender_preference,
    amenities:     l.amenities ?? [],
    photos:        l.photos ?? [],
    isBroker:      !!l.is_broker,
    isFeatured:    !!l.is_featured,
    status:        l.status,
    viewCount:     l.view_count ?? 0,
    unlockCount:   l.unlock_count ?? 0,
    createdAt:     l.created_at,
    updatedAt:     l.updated_at,
    ownerId:       l.owner_id,
    owner: l.owner ? {
      id:       l.owner.id,
      name:     l.owner.name,
      verified: !!l.owner.is_verified,
      avatar:   l.owner.profile_photo_url ?? null,
    } : undefined,
  };
}

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "admin");
  if ("status" in auth) return auth;

  try {
    const res = await fetch(`${BACKEND}/admin/listings`, {
      headers: { Accept: "application/json" },
    });
    const json = await res.json();
    if (!res.ok) return error(json?.message ?? "Failed to fetch listings", res.status);
    const listings = (json.data ?? []).map(toListing);
    return ok(listings);
  } catch (e: any) {
    return error("Failed to fetch listings", 500);
  }
}
