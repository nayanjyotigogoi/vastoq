import { NextRequest, NextResponse } from "next/server";
import { error } from "@/lib/api/response";
import { requireRole } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// POST /api/listings/:id/create-boost-order
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const guard = await requireRole(req, "owner", "admin");
  if (guard instanceof NextResponse) return guard;

  try {
    const res = await fetch(`${API_URL}/listings/${id}/create-boost-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ user_id: guard.session.userId }),
    });

    const json = await res.json();

    if (!res.ok) {
      return error(json.message ?? "Failed to create boost order", res.status);
    }

    return NextResponse.json(json);
  } catch {
    return error("Unable to connect to backend", 500);
  }
}
