import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie, requireAuth } from "@/lib/auth";
import { ok, error } from "@/lib/api/response";
import type { SessionPayload, Role } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface CacheEntry {
  user: any;
  timestamp: number;
}

const profileCache = new Map<string, CacheEntry>();
const CACHE_TTL = 3000; // 3 seconds TTL

// GET /api/auth/session — read current session and fetch live details (credits) from backend.
export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  const { session } = guard;
  const cacheKey = session.userId;
  const now = Date.now();
  const nocache = req.nextUrl.searchParams.get("nocache") === "true";

  if (!nocache && profileCache.has(cacheKey)) {
    const entry = profileCache.get(cacheKey)!;
    if (now - entry.timestamp < CACHE_TTL) {
      return ok(entry.user);
    }
  }

  try {
    const res = await fetch(
      `${API_URL}/auth/me?user_id=${session.userId}`,
      { headers: { Accept: "application/json" } }
    );
    if (res.ok) {
      const json = await res.json();
      const user = json.data?.user;
      if (user) {
        const payload = {
          userId: String(user.id),
          phone:  user.phone,
          name:   user.name ?? "",
          email:  user.email ?? "",
          role:   user.role,
          free_unlocks_remaining: user.free_unlocks_remaining ?? 0,
          vastoq_points: user.vastoq_points ?? 0,
        };
        profileCache.set(cacheKey, { user: payload, timestamp: now });
        return ok(payload);
      }
    }
  } catch {
    // backend unreachable — return fallback from cookie
  }

  return ok({
    userId: session.userId,
    phone:  session.phone,
    name:   session.name ?? "",
    email:  "",
    role:   session.role,
    free_unlocks_remaining: 0,
    vastoq_points: 0,
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
