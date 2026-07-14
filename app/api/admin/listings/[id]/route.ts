import { NextRequest } from "next/server";
import { ok, error } from "@/lib/api/response";
import { requireRole } from "@/lib/auth";

const BACKEND = process.env.NEXT_PUBLIC_API_URL;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(req, "admin");
  if ("status" in auth) return auth;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  try {
    const res = await fetch(`${BACKEND}/admin/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    if (!res.ok) return error(json?.message ?? "Action failed", res.status);
    return ok(json.data ?? json);
  } catch (e: any) {
    return error(e?.message ?? "Failed to apply action", 500);
  }
}
