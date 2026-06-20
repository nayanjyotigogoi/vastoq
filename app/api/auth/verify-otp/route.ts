import { NextRequest } from "next/server";
import { ok, error } from "@/lib/api/response";
import { setSessionCookie } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: NextRequest) {
  try {

    const body = await req.json();

    const response = await fetch(
      `${API_URL}/auth/verify-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const json = await response.json();

    if (!response.ok) {
      return error(
        json.error?.message ??
        "OTP verification failed",
        response.status
      );
    }

    const user = json.data.user;

    await setSessionCookie({
      userId: String(user.id),
      phone: user.phone,
      role: user.role ?? "tenant",
    });

    return ok({
      user,
      isNew: json.data.is_new_user,
      redirect_to: json.data.redirect_to,
    });

  } catch {

    return error(
      "Unable to connect to backend",
      500
    );
  }
}