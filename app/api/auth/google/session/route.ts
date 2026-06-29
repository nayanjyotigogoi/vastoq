import { NextRequest } from "next/server";
import { ok, error } from "@/lib/api/response";
import { setSessionCookie } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /api/auth/google/session
 *
 * Called by the /auth/google/callback page after Google redirects back
 * with a Sanctum token.  This route fetches the user from Laravel using
 * that token, then sets the Vastoq session cookie so the rest of the app
 * works exactly like a phone/password login.
 */
export async function POST(req: NextRequest) {
  try {
    const { token, role } = await req.json();

    if (!token) {
      return error("No token provided", 400);
    }

    // If role is provided, update the user's role on the backend first
    if (role) {
      const updateRes = await fetch(`${API_URL}/auth/update-role`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ role }),
      });

      if (!updateRes.ok) {
        return error("Failed to update user role", 500);
      }
    }

    // Fetch user from Laravel using the Sanctum token
    const res = await fetch(`${API_URL}/auth/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return error("Invalid or expired Google token", 401);
    }

    const json = await res.json();
    const user = json.data?.user;

    if (!user) {
      return error("User data not found", 500);
    }

    // Set the Vastoq session cookie (same as phone/password login)
    await setSessionCookie({
      userId: String(user.id),
      phone:  user.phone ?? "",
      name:   user.name,
      role:   user.role,
    });

    // Return redirect path based on role
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
    return error("Unable to connect to server", 500);
  }
}
