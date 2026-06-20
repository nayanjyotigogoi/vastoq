import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { ok, error } from "@/lib/api/response";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);

  if (guard instanceof NextResponse) {
    return guard;
  }

  try {
    const response = await fetch(
      `${API_URL}/auth/me?user_id=${guard.session.userId}`
    );

    const json = await response.json();

    if (!response.ok) {
      return error(
        json.error?.message ?? "Failed to load profile",
        response.status
      );
    }

    return ok(json.data.user);

  } catch (e) {

    return error(
      "Unable to connect to backend",
      500
    );

  }
}