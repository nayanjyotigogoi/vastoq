import { NextRequest } from "next/server";
import { ok, error } from "@/lib/api/response";
import { requireRole } from "@/lib/auth";
import { updateEnquiryStatus } from "@/lib/services/admin.service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(req, "admin");
  if ("status" in auth) return auth;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { status, adminNotes } = body as { status?: string; adminNotes?: string };

  if (!status) return error("status is required", 422);

  const result = updateEnquiryStatus(id, status as "open" | "contacted" | "converted" | "cancelled", adminNotes);
  if (!result) return error("Enquiry not found", 404);

  return ok(result);
}
