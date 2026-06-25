import { NextRequest } from "next/server";
import { ok, error } from "@/lib/api/response";
import { setSessionCookie } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(
      `${API_URL}/auth/select-role`,
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
        json.message ??
        "Failed to save role",
        response.status
      );
    }

    const user = json.data.user;

    await setSessionCookie({
      userId: String(user.id),
      phone:  user.phone,
      name:   user.name ?? "",
      role:   user.role,
    });

    return ok({
      user,
      redirect_to: json.data.redirect_to,
    });

  } catch (e) {

    return error(
      "Unable to connect to backend",
      500
    );

  }
}