import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/prices — public, no auth, cached 60s
export async function GET() {
  try {
    const res = await fetch(`${API_URL}/prices`, {
      next: { revalidate: 60 },
    });
    const json = await res.json();
    return NextResponse.json(json);
  } catch {
    // Fallback if Laravel is unreachable — mirrors DEFAULT_PRICES in usePrices.ts
    return NextResponse.json({
      success: true,
      data: {
        listing_unlock_amount:     25,
        worker_unlock_amount:      15,
        listing_boost_amount:      99,
        listing_boost_days:        7,
        listing_points_cost:       20,
        worker_points_cost:        10,
        vastoq_points_pack_amount: 59,
        vastoq_points_pack_points: 60,
      },
    });
  }
}
