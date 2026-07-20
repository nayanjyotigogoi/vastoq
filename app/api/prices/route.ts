import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/prices — public, no auth
export async function GET() {
  try {
    const res = await fetch(`${API_URL}/prices`, {
      next: { revalidate: 60 }, // cache for 60s so every page load doesn't hit Laravel
    });
    const json = await res.json();
    return NextResponse.json(json);
  } catch {
    // Fallback to defaults if backend is unreachable
    return NextResponse.json({
      success: true,
      data: {
          listing_unlock: 25,
          worker_unlock: 15,
          listing_boost: 99,
          listing_boost_duration_days: 7,
          premium_unlock_package: 59,
          premium_unlock_package_count: 3,
          vastoq_points_pack: 59,
          vastoq_points_pack_points: 60,
        },
    });
  }
}
