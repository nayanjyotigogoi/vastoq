import { db, newId, now } from "@/lib/store";
import type { Conversation, Message } from "@/lib/types";

// ─── Get or create conversation ───────────────────────────────────────────────

export function getOrCreateConversation(
  participantIds: [string, string],
  options?: { listingId?: string; workerId?: string }
): Conversation {
  const [a, b] = participantIds.sort();

  const existing = Array.from(db.conversations.values()).find(
    (c) => {
      const sorted = [...c.participantIds].sort();
      return (
        sorted[0] === a &&
        sorted[1] === b &&
        c.listingId === options?.listingId &&
        c.workerId === options?.workerId
      );
    }
  );

  if (existing) return existing;

  const conversation: Conversation = {
    id: newId(),
    participantIds,
    listingId: options?.listingId,
    workerId: options?.workerId,
    lastMessageAt: now(),
    createdAt: now(),
  };

  db.conversations.set(conversation.id, conversation);
  return conversation;
}

// ─── Send message ─────────────────────────────────────────────────────────────

export function sendMessage(
  conversationId: string,
  senderId: string,
  text: string
): Message | { error: string } {
  const conversation = db.conversations.get(conversationId);
  if (!conversation) return { error: "Conversation not found" };

  if (!conversation.participantIds.includes(senderId)) {
    return { error: "You are not a participant in this conversation" };
  }

  const message: Message = {
    id: newId(),
    conversationId,
    senderId,
    text,
    isRead: false,
    createdAt: now(),
  };

  db.messages.set(message.id, message);
  conversation.lastMessageAt = now();
  db.conversations.set(conversationId, conversation);

  return message;
}

// ─── Get messages ─────────────────────────────────────────────────────────────

export function getMessages(conversationId: string, userId: string): Message[] | { error: string } {
  const conversation = db.conversations.get(conversationId);
  if (!conversation) return { error: "Conversation not found" };
  if (!conversation.participantIds.includes(userId)) {
    return { error: "Forbidden" };
  }

  const messages = Array.from(db.messages.values())
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));

  // Mark as read
  messages.forEach((m) => {
    if (m.senderId !== userId && !m.isRead) {
      m.isRead = true;
      db.messages.set(m.id, m);
    }
  });

  return messages;
}

// ─── Get user conversations ───────────────────────────────────────────────────

export function getUserConversations(userId: string): Conversation[] {
  return Array.from(db.conversations.values())
    .filter((c) => c.participantIds.includes(userId))
    .sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1));
}
