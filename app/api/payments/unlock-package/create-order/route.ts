import { NextRequest, NextResponse } from "next/server";
import { ok, error } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// POST /api/payments/unlock-package/create-order
export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  try {
    const res = await fetch(`${API_URL}/payments/unlock-package/create-order`, {
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
  } catch (err: any) {
    return error(err?.message ?? "Unable to connect to backend", 500);
  }
}
