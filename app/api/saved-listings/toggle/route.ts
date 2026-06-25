import { NextRequest, NextResponse } from "next/server";
import { ok, error } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  try {
    const body = await req.json();

    const res = await fetch(`${API_URL}/saved-listings/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        user_id:    guard.session.userId,
        listing_id: body.listing_id,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      return error(json.error?.message ?? "Failed to toggle saved listing", res.status);
    }

    return ok({ saved: json.saved });
  } catch {
    return error("Unable to connect to backend", 500);
  }
}
