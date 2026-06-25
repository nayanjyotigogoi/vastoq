import { NextRequest } from "next/server";
import { ok, error } from "@/lib/api/response";
import { setSessionCookie } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function extractLaravelError(json: any): string {
  if (json?.errors && typeof json.errors === 'object') {
    const fieldErrors: string[] = Object.values(json.errors).flat() as string[]
    if (fieldErrors.length > 0) return fieldErrors.join(' ')
  }
  if (json?.error?.message) return json.error.message
  if (json?.message) return json.message
  return 'Login failed. Please try again.'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    if (!res.ok) {
      return error(extractLaravelError(json), res.status);
    }

    const user = json.data.user;

    await setSessionCookie({
      userId: String(user.id),
      phone:  user.phone,
      name:   user.name,
      role:   user.role,
    });

    return ok({
      user,
      redirect_to: json.data.redirect_to,
    });
  } catch {
    return error("Unable to connect to server", 500);
  }
}
