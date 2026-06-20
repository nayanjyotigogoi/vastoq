import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { Role, SessionPayload } from "@/lib/types";
import { error } from "@/lib/api/response";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "vastoq-dev-secret-change-in-production"
);

const COOKIE_NAME = "vastoq_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// ─── Sign ─────────────────────────────────────────────────────────────────────

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET_KEY);
}

// ─── Verify ───────────────────────────────────────────────────────────────────

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ─── Set session cookie (call from Route Handler) ─────────────────────────────

export async function setSessionCookie(payload: SessionPayload) {
  const token = await signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return token;
}

// ─── Clear session cookie ─────────────────────────────────────────────────────

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ─── Get session (Server Component / Route Handler) ───────────────────────────

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// ─── Require auth (Route Handler guard) ──────────────────────────────────────

export async function requireAuth(
  req: NextRequest
): Promise<{ session: SessionPayload } | NextResponse> {
  const token =
    req.cookies.get(COOKIE_NAME)?.value ??
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return error("Authentication required", 401, "UNAUTHENTICATED");

  const session = await verifyToken(token);
  if (!session) return error("Invalid or expired session", 401, "INVALID_TOKEN");

  return { session };
}

// ─── Require a specific role ─────────────────────────────────────────────────

export async function requireRole(
  req: NextRequest,
  ...roles: Role[]
): Promise<{ session: SessionPayload } | NextResponse> {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;

  const { session } = result;
  if (!roles.includes(session.role)) {
    return error(
      `Access denied. Required role: ${roles.join(" or ")}`,
      403,
      "FORBIDDEN"
    );
  }
  return { session };
}
