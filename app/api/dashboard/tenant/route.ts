import { NextRequest, NextResponse } from "next/server";
import { ok, error } from "@/lib/api/response";
import { requireRole } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: NextRequest) {
  const guard = await requireRole(req, "tenant", "admin");
  if (guard instanceof NextResponse) return guard;

  try {
    const res = await fetch(
      `${API_URL}/dashboard/tenant?user_id=${guard.session.userId}`,
      { headers: { Accept: "application/json" } }
    );

    const json = await res.json();

    if (!res.ok) {
      return error(json.error?.message ?? "Failed to load dashboard", res.status);
    }

    return ok(json.data);
  } catch {
    return error("Unable to connect to backend", 500);
  }
}
