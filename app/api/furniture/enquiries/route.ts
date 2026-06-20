import { NextRequest, NextResponse } from "next/server";
import { ok, created, error } from "@/lib/api/response";
import { FurnitureEnquirySchema } from "@/lib/api/validators";
import { requireAuth } from "@/lib/auth";
import { createEnquiry, getUserEnquiries } from "@/lib/services/furniture.service";

// GET /api/furniture/enquiries — user's own enquiries
export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  const enquiries = getUserEnquiries(guard.session.userId);
  return ok(enquiries);
}

// POST /api/furniture/enquiries — new enquiry
export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => ({}));
  const parsed = FurnitureEnquirySchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const result = createEnquiry(guard.session.userId, parsed.data);
  if ("error" in result) return error(result.error, 400);
  return created(result);
}
