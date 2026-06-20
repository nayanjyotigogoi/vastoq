import { NextRequest, NextResponse } from "next/server";
import { ok, created, error } from "@/lib/api/response";
import { SendMessageSchema } from "@/lib/api/validators";
import { requireAuth } from "@/lib/auth";
import {
  getOrCreateConversation,
  sendMessage,
  getMessages,
} from "@/lib/services/messages.service";

// GET /api/messages?conversationId=xxx
export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  const conversationId = req.nextUrl.searchParams.get("conversationId");
  if (!conversationId) return error("conversationId is required", 422);

  const result = getMessages(conversationId, guard.session.userId);
  if ("error" in result) return error(result.error, 403);
  return ok(result);
}

// POST /api/messages — send message (creates conversation if needed)
export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => ({}));
  const parsed = SendMessageSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  let conversationId = parsed.data.conversationId;

  // Create conversation if not provided
  if (!conversationId) {
    if (!parsed.data.recipientId) return error("Either conversationId or recipientId is required", 422);
    const conversation = getOrCreateConversation(
      [guard.session.userId, parsed.data.recipientId],
      { listingId: parsed.data.listingId, workerId: parsed.data.workerId }
    );
    conversationId = conversation.id;
  }

  const result = sendMessage(conversationId, guard.session.userId, parsed.data.text);
  if ("error" in result) return error(result.error, 400);
  return created({ ...result, conversationId });
}
