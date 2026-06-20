import { NextRequest, NextResponse } from "next/server";
import { ok } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth";
import { getUserConversations } from "@/lib/services/messages.service";

// GET /api/conversations — all conversations for authenticated user
export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  const conversations = getUserConversations(guard.session.userId);
  return ok(conversations);
}
