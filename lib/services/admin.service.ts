/**
 * Admin Service
 *
 * Provides all privileged operations:
 * - Listing approve / reject / feature / unfeature
 * - User block / unblock / grant credits / verify aadhaar / flag broker
 * - Worker verify / reject / deactivate
 * - Platform-wide stats
 * - Review approval
 * - Furniture enquiry status management
 */

import { db, newId, now } from "@/lib/store";
import type {
  Listing,
  User,
  WorkerProfile,
  VerificationStatus,
} from "@/lib/types";
import { approveReview } from "./reviews.service";
import { listAllEnquiries, updateEnquiryStatus } from "./furniture.service";
import { createCoupon, listCoupons } from "./coupons.service";

export { approveReview, listAllEnquiries, updateEnquiryStatus, createCoupon, listCoupons };

// ─── Stats ────────────────────────────────────────────────────────────────────

export function getPlatformStats() {
  const users = Array.from(db.users.values());
  const listings = Array.from(db.listings.values());
  const workers = Array.from(db.workers.values());
  const payments = Array.from(db.payments.values());
  const unlocks = Array.from(db.unlocks.values());

  const totalRevenuePaise = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  return {
    users: {
      total: users.length,
      tenants: users.filter((u) => u.role === "tenant").length,
      owners: users.filter((u) => u.role === "owner").length,
      workers: users.filter((u) => u.role === "worker").length,
      blocked: users.filter((u) => u.isBlocked).length,
      aadhaarPending: users.filter((u) => u.aadhaarStatus === "pending").length,
    },
    listings: {
      total: listings.length,
      active: listings.filter((l) => l.status === "active").length,
      pending: listings.filter((l) => l.status === "pending").length,
      rejected: listings.filter((l) => l.status === "rejected").length,
      broker: listings.filter((l) => l.isBroker).length,
    },
    workers: {
      total: workers.length,
      verified: workers.filter((w) => w.isVerified).length,
      pending: workers.filter((w) => w.aadhaarStatus === "pending").length,
    },
    revenue: {
      totalPaise: totalRevenuePaise,
      totalPayments: payments.filter((p) => p.status === "paid").length,
    },
    unlocks: {
      total: unlocks.length,
      listings: unlocks.filter((u) => u.targetType === "listing").length,
      workers: unlocks.filter((u) => u.targetType === "worker").length,
    },
  };
}

// ─── Listing actions ──────────────────────────────────────────────────────────

type ListingAction = "approve" | "reject" | "feature" | "unfeature";

export function adminListingAction(
  listingId: string,
  action: ListingAction,
  reason?: string
): Listing | { error: string } {
  const listing = db.listings.get(listingId);
  if (!listing) return { error: "Listing not found" };

  switch (action) {
    case "approve":
      listing.status = "active";
      listing.rejectionReason = undefined;
      break;
    case "reject":
      listing.status = "rejected";
      listing.rejectionReason = reason ?? "Does not meet platform guidelines";
      break;
    case "feature":
      listing.isFeatured = true;
      break;
    case "unfeature":
      listing.isFeatured = false;
      break;
  }

  listing.updatedAt = now();
  db.listings.set(listingId, listing);
  return listing;
}

// ─── User actions ─────────────────────────────────────────────────────────────

type UserAction = "block" | "unblock" | "grant_credits" | "verify_aadhaar" | "reject_aadhaar" | "flag_broker";

export function adminUserAction(
  userId: string,
  action: UserAction,
  amount?: number
): User | { error: string } {
  const user = db.users.get(userId);
  if (!user) return { error: "User not found" };

  switch (action) {
    case "block":
      user.isBlocked = true;
      break;
    case "unblock":
      user.isBlocked = false;
      break;
    case "grant_credits":
      if (!amount || amount <= 0) return { error: "Amount must be positive" };
      user.creditBalance += amount;
      // Record transaction
      const grantTx = {
        id: newId(),
        userId,
        type: "admin_grant" as const,
        amount,
        description: `Admin credit grant`,
        balanceAfter: user.creditBalance,
        createdAt: now(),
      };
      db.creditTxs.set(grantTx.id, grantTx);
      break;
    case "verify_aadhaar":
      user.aadhaarStatus = "verified" as VerificationStatus;
      break;
    case "reject_aadhaar":
      user.aadhaarStatus = "rejected" as VerificationStatus;
      break;
    case "flag_broker": {
      // Flag all active listings by this owner as broker listings
      Array.from(db.listings.values())
        .filter((l) => l.ownerId === userId)
        .forEach((l) => {
          l.isBroker = true;
          db.listings.set(l.id, l);
        });
      break;
    }
  }

  user.updatedAt = now();
  db.users.set(userId, user);
  return user;
}

// ─── Worker actions ────────────────────────────────────────────────────────────

type WorkerAction = "verify" | "reject" | "deactivate";

export function adminWorkerAction(
  workerId: string,
  action: WorkerAction
): WorkerProfile | { error: string } {
  const worker = db.workers.get(workerId);
  if (!worker) return { error: "Worker not found" };

  switch (action) {
    case "verify":
      worker.isVerified = true;
      worker.aadhaarStatus = "verified";
      break;
    case "reject":
      worker.isVerified = false;
      worker.aadhaarStatus = "rejected";
      break;
    case "deactivate":
      worker.isActive = false;
      break;
  }

  worker.updatedAt = now();
  db.workers.set(workerId, worker);
  return worker;
}

// ─── All users (admin list) ───────────────────────────────────────────────────

export function listAllUsers(): User[] {
  return Array.from(db.users.values()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

// ─── All listings (admin list with all statuses) ──────────────────────────────

export function listAllListings(): Listing[] {
  return Array.from(db.listings.values()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
