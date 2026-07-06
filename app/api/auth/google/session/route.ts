import { NextRequest } from "next/server";
import { ok, error } from "@/lib/api/response";
import { setSessionCookie } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /api/auth/google/session
 *
 * Called by the /auth/google/callback page after Google redirects back
 * with an HMAC-signed token.  This route exchanges the token at the
 * backend for verified user data, then sets the Vastoq session cookie so
 * the rest of the app works exactly like a phone/password login.
 */
export async function POST(req: NextRequest) {
  try {
    const { token, role } = await req.json();

    if (!token) {
      return error("No token provided", 400);
    }

    // Exchange the HMAC-signed token for user data (verifies signature server-side)
    const res = await fetch(`${API_URL}/auth/google/exchange`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        token,
        ...(role ? { role } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "(unreadable)");
      console.error(
        `[google/session] /auth/google/exchange failed — status=${res.status} body=${body}`
      );
      return error("Google authentication failed. Please try again.", 401);
    }

    const json = await res.json();
    const user = json.data?.user;

    if (!user) {
      return error("User data not found", 500);
    }

    // Set the Vastoq session cookie (same as phone/password login)
    await setSessionCookie({
      userId: String(user.id),
      phone: user.phone ?? "",
      name: user.name,
      role: user.role,
    });

    // Return redirect path based on role
    const redirectMap: Record<string, string> = {
      owner: "/owner/dashboard",
      worker: "/worker/dashboard",
      admin: "/admin",
    };

    return ok({
      user,
      redirect_to: redirectMap[user.role] ?? "/dashboard",
    });
  } catch {
    return error("Unable to connect to server", 500);
  }
}
