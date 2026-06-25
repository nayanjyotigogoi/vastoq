import { NextRequest, NextResponse } from "next/server";
import { ok, error } from "@/lib/api/response";
import { requireRole } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// POST /api/listings/:id/unlock
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Only tenants (and admin) can unlock listings
  const guard = await requireRole(req, "tenant", "admin");
  if (guard instanceof NextResponse) return guard;

  try {
    const body = await req.json().catch(() => ({}));

    const res = await fetch(`${API_URL}/listings/${id}/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        user_id:     guard.session.userId,   // always from session, never from client
        coupon_code: body.coupon_code ?? undefined,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      return error(json.message ?? json.error?.message ?? "Unlock failed", res.status);
    }

    return ok(json.data);
  } catch {
    return error("Unable to connect to backend", 500);
  }
}
