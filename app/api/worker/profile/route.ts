import { NextRequest, NextResponse } from "next/server";
import { ok, error } from "@/lib/api/response";
import { requireRole } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: NextRequest) {
  const guard = await requireRole(req, "worker", "admin");
  if (guard instanceof NextResponse) return guard;

  try {
    const res = await fetch(
      `${API_URL}/worker/profile?user_id=${guard.session.userId}`,
      { headers: { Accept: "application/json" } }
    );

    const json = await res.json();

    if (!res.ok) {
      return error(json.error?.message ?? "Worker profile not found", res.status);
    }

    return ok(json.data.worker);
  } catch {
    return error("Unable to connect to backend", 500);
  }
}

export async function PUT(req: NextRequest) {
  const guard = await requireRole(req, "worker", "admin");
  if (guard instanceof NextResponse) return guard;

  try {
    const body = await req.json();

    const res = await fetch(`${API_URL}/worker/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ ...body, user_id: guard.session.userId }),
    });

    const json = await res.json();

    if (!res.ok) {
      return error(json.error?.message ?? "Failed to update profile", res.status);
    }

    return ok(json.data.worker);
  } catch {
    return error("Unable to connect to backend", 500);
  }
}
