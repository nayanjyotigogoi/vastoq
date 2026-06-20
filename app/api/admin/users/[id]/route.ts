import { NextRequest } from "next/server";
import { ok, error } from "@/lib/api/response";
import { requireRole } from "@/lib/auth";
import { AdminUserActionSchema } from "@/lib/api/validators";
import { adminUserAction } from "@/lib/services/admin.service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(req, "admin");
  if ("status" in auth) return auth;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = AdminUserActionSchema.safeParse(body);

  if (!parsed.success) {
    return error(parsed.error.issues[0].message, 422);
  }

  const result = adminUserAction(id, parsed.data.action, parsed.data.amount);
  if ("error" in result) return error(result.error, 404);

  return ok(result);
}
