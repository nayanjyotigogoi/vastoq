import { NextRequest } from "next/server";
import { ok, error } from "@/lib/api/response";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(
      `${API_URL}/auth/send-otp`,
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
        "Failed to send OTP",
        response.status
      );
    }

    return ok(json.data);

  } catch {
    return error(
      "Unable to connect to backend",
      500
    );
  }
}