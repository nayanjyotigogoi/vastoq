import { NextRequest } from "next/server";
import { ok, error } from "@/lib/api/response";
import { setSessionCookie } from "@/lib/auth";

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

    // ── 1. Fetch current user data using the Sanctum Bearer token ─────────
    const meRes = await fetch(`${apiUrl}/auth/user`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!meRes.ok) {
      console.error("[google/session] /auth/user failed", meRes.status);
      return error("Invalid or expired token", 401);
    }

    const meJson = await meRes.json();
    const userData = meJson.data?.user ?? meJson.data ?? meJson;

    // ── 2. Update role if provided (new user picked a role) ───────────────
    if (role) {
      const roleRes = await fetch(`${apiUrl}/auth/update-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      if (!roleRes.ok) {
        const roleJson = await roleRes.json();
        return error(roleJson.error?.message ?? roleJson.message ?? "Failed to update role", roleRes.status);
      }
    }

    // ── 3. Update phone if provided (owner/worker must supply phone) ───────
    if (phone) {
      const profileRes = await fetch(`${apiUrl}/auth/update-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          user_id: userData.id,
          name: userData.name,
          phone,
        }),
      });
      if (!profileRes.ok) {
        const profileJson = await profileRes.json();
        if (profileJson.errors && typeof profileJson.errors === "object") {
          const msgs = Object.values(profileJson.errors).flat() as string[];
          if (msgs.length > 0) return error(msgs.join(" "), profileRes.status);
        }
        return error(profileJson.error?.message ?? profileJson.message ?? "Failed to update phone", profileRes.status);
      }
    }

    // ── 4. Set session cookie ─────────────────────────────────────────────
    const finalRole  = role  ?? userData.role  ?? "tenant";
    const finalPhone = phone ?? userData.phone ?? "";

    await setSessionCookie({
      userId: String(userData.id),
      phone:  finalPhone,
      name:   userData.name ?? "",
      role:   finalRole,
    });

    const redirectMap: Record<string, string> = {
      owner:  "/owner/dashboard",
      worker: "/worker/dashboard",
      admin:  "/admin",
    };

    return ok({
      user: {
        userId:            String(userData.id),
        name:              userData.name,
        email:             userData.email,
        phone:             finalPhone,
        role:              finalRole,
        credit_balance:    userData.credit_balance ?? 0,
        is_verified:       userData.is_verified ?? true,
        profile_photo_url: userData.profile_photo_url ?? null,
      },
      redirect_to: redirectMap[finalRole] ?? "/dashboard",
    });
  } catch (err) {
    console.error("[google/session] error:", err);
    return error("Unable to process authentication", 500);
  }
}
