/**
 * Workers Service
 *
 * Business rules:
 * - Worker profile linked 1:1 to a user with role "worker"
 * - Phone number only revealed after unlock (1 credit)
 * - Aadhaar verification status drives the "Verified" badge
 * - Rating is recalculated after every approved review
 */

import { db, newId, now } from "@/lib/store";
import type { WorkerProfile, SessionPayload } from "@/lib/types";

const UNLOCK_COST_CREDITS = 1;
const UNLOCK_EXPIRY_DAYS = 30;

// ─── List / filter ────────────────────────────────────────────────────────────

export interface WorkerFilters {
  city?: string;
  category?: string;
  isVerified?: boolean;
  page: number;
  limit: number;
}

export function listWorkers(filters: WorkerFilters) {
  let items = Array.from(db.workers.values()).filter((w) => w.isActive);

  if (filters.city) {
    items = items.filter((w) => w.city.toLowerCase().includes(filters.city!.toLowerCase()));
  }
  if (filters.category) {
    items = items.filter((w) => w.category === filters.category);
  }
  if (filters.isVerified !== undefined) {
    items = items.filter((w) => w.isVerified === filters.isVerified);
  }

  items.sort((a, b) => b.rating - a.rating);

  const total = items.length;
  const start = (filters.page - 1) * filters.limit;
  return { data: items.slice(start, start + filters.limit), total };
}

// ─── Get single worker ────────────────────────────────────────────────────────

export function getWorker(id: string): WorkerProfile | undefined {
  return db.workers.get(id);
}

// ─── Sanitize — strip phone unless unlocked ───────────────────────────────────

export function sanitizeWorker(
  worker: WorkerProfile,
  viewerUserId?: string
): Omit<WorkerProfile, "phone"> & { phone?: string; isUnlocked: boolean } {
  let isUnlocked = false;

  if (viewerUserId) {
    const unlock = Array.from(db.unlocks.values()).find(
      (u) =>
        u.userId === viewerUserId &&
        u.targetType === "worker" &&
        u.targetId === worker.id &&
        new Date(u.expiresAt) > new Date()
    );
    isUnlocked = !!unlock;
  }

  const { phone, ...rest } = worker;
  return { ...rest, phone: isUnlocked ? phone : undefined, isUnlocked };
}

// ─── Create worker profile ────────────────────────────────────────────────────

export function createWorkerProfile(
  userId: string,
  data: Omit<WorkerProfile, "id" | "userId" | "rating" | "reviewCount" | "isVerified" | "aadhaarStatus" | "isActive" | "createdAt" | "updatedAt">
): WorkerProfile {
  const existing = Array.from(db.workers.values()).find((w) => w.userId === userId);
  if (existing) throw new Error("Worker profile already exists for this user");

  const profile: WorkerProfile = {
    id: newId(),
    userId,
    ...data,
    rating: 0,
    reviewCount: 0,
    isVerified: false,
    aadhaarStatus: "unverified",
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
  };

  db.workers.set(profile.id, profile);
  return profile;
}

// ─── Update worker profile ─────────────────────────────────────────────────────

export function updateWorkerProfile(
  workerId: string,
  requesterId: string,
  requesterRole: string,
  updates: Partial<WorkerProfile>
): WorkerProfile | { error: string; code: string } {
  const worker = db.workers.get(workerId);
  if (!worker) return { error: "Worker profile not found", code: "NOT_FOUND" };

  if (requesterRole !== "admin" && worker.userId !== requesterId) {
    return { error: "Forbidden", code: "FORBIDDEN" };
  }

  Object.assign(worker, { ...updates, updatedAt: now() });
  db.workers.set(workerId, worker);
  return worker;
}

// ─── Get worker profile by userId ────────────────────────────────────────────

export function getWorkerByUserId(userId: string): WorkerProfile | undefined {
  return Array.from(db.workers.values()).find((w) => w.userId === userId);
}

// ─── Unlock worker ────────────────────────────────────────────────────────────

export function unlockWorker(
  session: SessionPayload,
  workerId: string
): { unlock: import("@/lib/types").Unlock; alreadyUnlocked: boolean } | { error: string; code: string } {
  const worker = db.workers.get(workerId);
  if (!worker) return { error: "Worker not found", code: "NOT_FOUND" };
  if (!worker.isActive) return { error: "Worker is not currently active", code: "WORKER_INACTIVE" };

  const user = db.users.get(session.userId);
  if (!user) return { error: "User not found", code: "NOT_FOUND" };

  // Double-unlock prevention
  const existing = Array.from(db.unlocks.values()).find(
    (u) =>
      u.userId === session.userId &&
      u.targetType === "worker" &&
      u.targetId === workerId &&
      new Date(u.expiresAt) > new Date()
  );
  if (existing) return { unlock: existing, alreadyUnlocked: true };

  if (user.creditBalance < UNLOCK_COST_CREDITS) {
    return { error: "Insufficient credits", code: "INSUFFICIENT_CREDITS" };
  }

  user.creditBalance -= UNLOCK_COST_CREDITS;
  user.updatedAt = now();
  db.users.set(user.id, user);

  const unlock = {
    id: newId(),
    userId: session.userId,
    targetType: "worker" as const,
    targetId: workerId,
    creditsSpent: UNLOCK_COST_CREDITS,
    revealedPhone: worker.phone,
    expiresAt: new Date(Date.now() + UNLOCK_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: now(),
  };
  db.unlocks.set(unlock.id, unlock);

  const tx = {
    id: newId(),
    userId: session.userId,
    type: "unlock_worker" as const,
    amount: -UNLOCK_COST_CREDITS,
    description: `Unlocked worker: ${worker.name}`,
    referenceId: unlock.id,
    balanceAfter: user.creditBalance,
    createdAt: now(),
  };
  db.creditTxs.set(tx.id, tx);

  return { unlock, alreadyUnlocked: false };
}

// ─── Recalculate worker rating ────────────────────────────────────────────────

export function recalculateWorkerRating(workerId: string) {
  const worker = db.workers.get(workerId);
  if (!worker) return;

  const reviews = Array.from(db.reviews.values()).filter(
    (r) => r.targetType === "worker" && r.targetId === workerId && r.isApproved
  );

  if (reviews.length === 0) return;

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  worker.rating = Math.round(avg * 10) / 10;
  worker.reviewCount = reviews.length;
  db.workers.set(workerId, worker);
}
