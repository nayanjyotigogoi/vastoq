import { NextRequest, NextResponse } from "next/server";
import { ok, created, error } from "@/lib/api/response";
import { CreateReviewSchema } from "@/lib/api/validators";
import { requireAuth } from "@/lib/auth";
import { createReview, getReviews } from "@/lib/services/reviews.service";

// GET /api/reviews?targetType=listing&targetId=l1
export async function GET(req: NextRequest) {
  const targetType = req.nextUrl.searchParams.get("targetType") as "listing" | "worker" | null;
  const targetId = req.nextUrl.searchParams.get("targetId");

  if (!targetType || !targetId) {
    return error("targetType and targetId are required", 422);
  }

  const reviews = getReviews(targetType, targetId);
  return ok(reviews);
}

// POST /api/reviews
export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => ({}));
  const parsed = CreateReviewSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const result = createReview(guard.session.userId, parsed.data);
  if ("error" in result) return error(result.error, 400);
  return created(result);
}
