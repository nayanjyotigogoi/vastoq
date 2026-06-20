import { NextRequest, NextResponse } from "next/server";
import { ok, error } from "@/lib/api/response";
import { requireRole } from "@/lib/auth";
import { getWorkerByUserId } from "@/lib/services/workers.service";

// GET /api/worker/profile — authenticated worker's own profile
export async function GET(req: NextRequest) {
  const guard = await requireRole(req, "worker", "admin");
  if (guard instanceof NextResponse) return guard;

  const profile = getWorkerByUserId(guard.session.userId);
  if (!profile) return error("Worker profile not found. Please create one.", 404, "NO_PROFILE");
  return ok(profile);
}
