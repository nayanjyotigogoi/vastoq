import { NextRequest } from "next/server";
import { ok, error } from "@/lib/api/response";
import { requireRole } from "@/lib/auth";
import { approveReview } from "@/lib/services/admin.service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(req, "admin");
  if ("status" in auth) return auth;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { action } = body as { action?: string };

  if (action !== "approve" && action !== "reject") {
    return error("action must be 'approve' or 'reject'", 422);
  }

  if (action === "reject") {
    // Delete or mark as rejected — reviews.service only has approve, so we just remove it
    const { db } = await import("@/lib/store");
    const review = db.reviews.get(id);
    if (!review) return error("Review not found", 404);
    db.reviews.delete(id);
    return ok({ deleted: true });
  }

  const result = approveReview(id);
  if (!result) return error("Review not found", 404);

  return ok(result);
}
