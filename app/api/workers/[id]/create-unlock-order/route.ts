import { NextRequest, NextResponse } from "next/server";
import { ok, error } from "@/lib/api/response";
import { requireRole } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// POST /api/workers/:id/create-unlock-order
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const guard = await requireRole(req, "tenant", "admin");
  if (guard instanceof NextResponse) return guard;

  try {
    const res = await fetch(`${API_URL}/workers/${id}/create-unlock-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ user_id: guard.session.userId }),
    });

    const json = await res.json();

    if (!res.ok) {
      return error(json.message ?? "Failed to create payment order", res.status);
    }

    return NextResponse.json(json);
  } catch {
    return error("Unable to connect to backend", 500);
  }
}
