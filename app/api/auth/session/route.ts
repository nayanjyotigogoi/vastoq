import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie, requireAuth } from "@/lib/auth";
import { ok, error } from "@/lib/api/response";
import type { SessionPayload, Role } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/auth/session — read current session from JWT cookie.
// If name is missing (old cookie), fetches from backend once and refreshes the cookie.
export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  let { session } = guard;

  // Back-fill name if the stored JWT pre-dates the name field
  if (!session.name) {
    try {
      const res = await fetch(
        `${API_URL}/auth/me?user_id=${session.userId}`,
        { headers: { Accept: "application/json" } }
      );
      if (res.ok) {
        const json = await res.json();
        const name = json.data?.user?.name ?? "";
        if (name) {
          session = { ...session, name };
          await setSessionCookie(session); // refresh cookie so next request is instant
        }
      }
    } catch {
      // backend unreachable — return what we have
    }
  }

  return ok({
    userId: session.userId,
    phone:  session.phone,
    name:   session.name ?? "",
    role:   session.role,
  });
}

// POST /api/auth/session — set/replace session cookie
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const payload: SessionPayload = {
      userId: String(body.userId),
      phone:  body.phone,
      name:   body.name ?? "",
      role:   body.role as Role,
    };

    await setSessionCookie(payload);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to create session" },
      { status: 500 }
    );
  }
}
