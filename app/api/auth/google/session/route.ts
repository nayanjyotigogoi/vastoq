import { NextRequest } from "next/server";
import { createHmac } from "crypto";
import { ok, error } from "@/lib/api/response";
import { setSessionCookie } from "@/lib/auth";

/**
 * POST /api/auth/google/session
 *
 * Verifies the HMAC-signed token produced by the Laravel Google OAuth callback,
 * then sets the session cookie.
 * Token format: base64(json_user_data) + "." + hmac_sha256_hex
 */
export async function POST(req: NextRequest) {
  try {
    const { token, role, phone } = await req.json();

    if (!token) {
      return error("No token provided", 400);
    }

    // ── 1. Split payload and signature ──────────────────────────────────
    const dotIndex = token.lastIndexOf(".");
    if (dotIndex === -1) {
      return error("Malformed token", 400);
    }
    const payloadB64 = token.slice(0, dotIndex);
    const sig        = token.slice(dotIndex + 1);

    // ── 2. Verify HMAC using the Laravel APP_KEY ─────────────────────────
    const appKey = process.env.BACKEND_APP_KEY;
    if (!appKey) {
      console.error("[google/session] BACKEND_APP_KEY is not set");
      return error("Server configuration error", 500);
    }
    const expectedSig = createHmac("sha256", appKey)
      .update(payloadB64)
      .digest("hex");

    if (expectedSig !== sig) {
      return error("Invalid token signature", 401);
    }

    // ── 3. Decode and validate payload ───────────────────────────────────
    let data: {
      id: number;
      name: string;
      email: string;
      phone: string | null;
      role: string;
      credit_balance: number;
      is_verified: boolean;
      profile_photo_url: string | null;
      exp: number;
    };
    try {
      data = JSON.parse(Buffer.from(payloadB64, "base64").toString("utf-8"));
    } catch {
      return error("Malformed token payload", 400);
    }

    if (!data.exp || Math.floor(Date.now() / 1000) > data.exp) {
      return error("Token has expired. Please try signing in again.", 401);
    }

    // ── 4. Update role/phone in DB if provided (new user) ────────────────
    if (role || phone) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (apiUrl) {
        if (role) {
          await fetch(`${apiUrl}/auth/update-role`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ user_id: data.id, role }),
          });
        }
        if (phone) {
          await fetch(`${apiUrl}/auth/update-profile`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ user_id: data.id, name: data.name, phone }),
          });
        }
      }
    }

    // ── 5. Set session cookie ─────────────────────────────────────────────
    const finalRole  = role  ?? data.role;
    const finalPhone = phone ?? data.phone ?? "";

    await setSessionCookie({
      userId: String(data.id),
      phone:  finalPhone,
      name:   data.name,
      role:   finalRole,
    });

    const redirectMap: Record<string, string> = {
      owner:  "/owner/dashboard",
      worker: "/worker/dashboard",
      admin:  "/admin",
    };

    return ok({
      user: {
        userId:            String(data.id),
        name:              data.name,
        email:             data.email,
        phone:             finalPhone,
        role:              finalRole,
        credit_balance:    data.credit_balance,
        is_verified:       data.is_verified,
        profile_photo_url: data.profile_photo_url,
      },
      redirect_to: redirectMap[finalRole] ?? "/dashboard",
    });
  } catch (err) {
    console.error("[google/session] error:", err);
    return error("Unable to process authentication", 500);
  }
}
