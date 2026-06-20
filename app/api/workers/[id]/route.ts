import { NextRequest, NextResponse } from "next/server";
import { ok, error } from "@/lib/api/response";
import { UpdateWorkerProfileSchema } from "@/lib/api/validators";
import { requireAuth } from "@/lib/auth";
import {
  getWorker,
  updateWorkerProfile,
  sanitizeWorker,
} from "@/lib/services/workers.service";

// GET /api/workers/:id
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const worker = getWorker(id);
  if (!worker) return error("Worker not found", 404);

  const guard = await requireAuth(req);
  const viewerUserId = guard instanceof NextResponse ? undefined : guard.session.userId;

  return ok(sanitizeWorker(worker, viewerUserId));
}

// PATCH /api/workers/:id
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => ({}));
  const parsed = UpdateWorkerProfileSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const result = updateWorkerProfile(id, guard.session.userId, guard.session.role, parsed.data);
  if ("error" in result) return error(result.error, result.code === "NOT_FOUND" ? 404 : 403, result.code);
  return ok(result);
}
