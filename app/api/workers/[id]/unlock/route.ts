import { NextRequest, NextResponse } from "next/server";
import { ok, error } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth";
import { unlockWorker } from "@/lib/services/workers.service";

// POST /api/workers/:id/unlock
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  const result = unlockWorker(guard.session, id);
  if ("error" in result) {
    const statusMap: Record<string, number> = {
      NOT_FOUND: 404,
      WORKER_INACTIVE: 410,
      INSUFFICIENT_CREDITS: 402,
    };
    return error(result.error, statusMap[result.code] ?? 400, result.code);
  }

  return ok({ ...result.unlock, alreadyUnlocked: result.alreadyUnlocked });
}
