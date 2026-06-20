import { NextRequest } from "next/server";
import { ok } from "@/lib/api/response";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/store";

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "admin");
  if ("status" in auth) return auth;

  const reviews = Array.from(db.reviews.values()).sort(
    (a, b) => (a.createdAt < b.createdAt ? 1 : -1)
  );
  return ok(reviews);
}
