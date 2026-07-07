import { NextRequest } from "next/server";
import { createHmac } from "crypto";
import { ok, error } from "@/lib/api/response";
import { setSessionCookie } from "@/lib/auth";

/**
 * POST /api/auth/google/session
 *
 * Verifies the self-contained HMAC-signed token produced by the Laravel
 * callback entirely in-process (no outbound HTTP needed).
 * Token format: base64(json_user_data) + "." + hmac_sha256_hex
 */
export async function POST(req: NextRequest) {
  try {
    const { token, role } = await req.json();

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

    // ── 2. Verify HMAC using the Laravel APP_KEY (server-side only) ──────
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

    const user = {
      id:                data.id,
      name:              data.name,
      email:             data.email,
      phone:             data.phone,
      role:              role ?? data.role, // use selected role if new user chose one
      credit_balance:    data.credit_balance,
      is_verified:       data.is_verified,
      profile_photo_url: data.profile_photo_url,
    };

    // ── 4. If a new role was selected, update it in the DB (best-effort) ─
    if (role && role !== data.role) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (apiUrl) {
        fetch(`${apiUrl}/auth/google/exchange`, {
          method:  "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body:    JSON.stringify({ token, role }),
        }).catch(() => {
          // Non-critical — cookie already has the correct role
        });
      }
    }

    // ── 5. Set session cookie (same as phone/password login) ─────────────
    await setSessionCookie({
      userId: String(user.id),
      phone:  user.phone ?? "",
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
  } catch {
    return error("Unable to process authentication", 500);
  }
}
