import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const PROTECTED_ROUTES: Record<string, string[]> = {
  "/dashboard":        ["tenant"],
  "/owner/dashboard":  ["owner", "admin"],
  "/owner/listings":   ["owner", "admin"],
  "/worker/dashboard": ["worker", "admin"],
  "/admin":            ["admin"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Find matching protected prefix
  const matchedPrefix = Object.keys(PROTECTED_ROUTES).find((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!matchedPrefix) return NextResponse.next();

  const allowedRoles = PROTECTED_ROUTES[matchedPrefix];

  const token =
    req.cookies.get("vastoq_session")?.value ??
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname)}`, req.url));
  }

  const session = await verifyToken(token);

  if (!session) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname)}`, req.url));
  }

  if (!allowedRoles.includes(session.role)) {
    // Wrong role — redirect to the correct dashboard
    const redirectMap: Record<string, string> = {
      tenant: "/dashboard",
      owner: "/owner/dashboard",
      worker: "/worker/dashboard",
      admin: "/admin",
    };
    return NextResponse.redirect(new URL(redirectMap[session.role] ?? "/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/owner/:path*",
    "/worker/:path*",
    "/admin/:path*",
  ],
};
