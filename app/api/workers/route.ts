import { NextRequest, NextResponse } from "next/server";
import { ok, created, error, paginated } from "@/lib/api/response";
import { CreateWorkerProfileSchema, WorkerFiltersSchema } from "@/lib/api/validators";
import { requireAuth, requireRole } from "@/lib/auth";
import { listWorkers, createWorkerProfile, sanitizeWorker } from "@/lib/services/workers.service";

// GET /api/workers
export async function GET(req: NextRequest) {
  const sp = Object.fromEntries(req.nextUrl.searchParams);
  const parsed = WorkerFiltersSchema.safeParse(sp);
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const guard = await requireAuth(req);
  const viewerUserId = guard instanceof NextResponse ? undefined : guard.session.userId;

  const { data, total } = listWorkers(parsed.data);
  const sanitized = data.map((w) => sanitizeWorker(w, viewerUserId));
  return paginated(sanitized, total, parsed.data.page, parsed.data.limit);
}

// POST /api/workers — create profile (worker role only)
export async function POST(req: NextRequest) {
  const guard = await requireRole(req, "worker");
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => ({}));
  const parsed = CreateWorkerProfileSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  try {
    const profile = createWorkerProfile(guard.session.userId, parsed.data);
    return created(profile);
  } catch (e: unknown) {
    return error((e as Error).message, 400);
  }
}
