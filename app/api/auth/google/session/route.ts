import { NextRequest } from "next/server";
import { ok, error } from "@/lib/api/response";
import { setSessionCookie } from "@/lib/auth";

/**
 * POST /api/auth/google/session
 *
 * Receives the Sanctum token produced by the Laravel Google OAuth callback,
 * exchanges it with Laravel to get user data, then sets the session cookie.
 */
export async function POST(req: NextRequest) {
  try {
    const { token, role, phone } = await req.json();

    if (!token) {
      return error("No token provided", 400);
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.error("[google/session] NEXT_PUBLIC_API_URL is not set");
      return error("Server configuration error", 500);
    }

    // ── 1. If new user supplied role/phone, update their profile first ────
    if (role || phone) {
      const updateRes = await fetch(`${apiUrl}/auth/google/exchange`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role, phone }),
      });
      const updateJson = await updateRes.json();
      if (!updateRes.ok) {
        if (updateJson.errors && typeof updateJson.errors === "object") {
          const msgs = Object.values(updateJson.errors).flat() as string[];
          if (msgs.length > 0) return error(msgs.join(" "), updateRes.status);
        }
        return error(
          updateJson.error?.message ?? updateJson.message ?? "Failed to save profile details",
          updateRes.status
        );
      }
    }

    // ── 2. Fetch current user data from Laravel using the Sanctum token ───
    const meRes = await fetch(`${apiUrl}/auth/me`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!meRes.ok) {
      return error("Invalid or expired token", 401);
    }

    const meJson = await meRes.json();
    const userData = meJson.data ?? meJson;

    const user = {
      userId:            String(userData.id),
      name:              userData.name ?? "",
      email:             userData.email ?? "",
      phone:             phone ?? userData.phone ?? "",
      role:              role ?? userData.role ?? "tenant",
      credit_balance:    userData.credit_balance ?? 0,
      is_verified:       userData.is_verified ?? true,
      profile_photo_url: userData.profile_photo_url ?? null,
    };

    // ── 3. Set session cookie (same as phone/password login) ─────────────
    await setSessionCookie({
      userId: user.userId,
      phone:  user.phone,
      name:   user.name,
      role:   user.role,
    });

    const redirectMap: Record<string, string> = {
      owner:  "/owner/dashboard",
      worker: "/worker/dashboard",
      admin:  "/admin",
    };

    return ok({
      user,
      redirect_to: redirectMap[user.role] ?? "/dashboard",
    });
  } catch (err) {
    console.error("[google/session] error:", err);
    return error("Unable to process authentication", 500);
  }
}
