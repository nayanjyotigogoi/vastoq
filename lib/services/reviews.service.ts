import { db, newId, now } from "@/lib/store";
import type { Review } from "@/lib/types";
import { recalculateWorkerRating } from "./workers.service";

export function createReview(
  authorId: string,
  data: { targetType: Review["targetType"]; targetId: string; rating: number; comment: string }
): Review | { error: string } {
  // Check target exists
  if (data.targetType === "listing" && !db.listings.get(data.targetId)) {
    return { error: "Listing not found" };
  }
  if (data.targetType === "worker" && !db.workers.get(data.targetId)) {
    return { error: "Worker not found" };
  }

  // Prevent duplicate review
  const existing = Array.from(db.reviews.values()).find(
    (r) =>
      r.authorId === authorId &&
      r.targetType === data.targetType &&
      r.targetId === data.targetId
  );
  if (existing) return { error: "You have already reviewed this" };

  const review: Review = {
    id: newId(),
    authorId,
    ...data,
    isApproved: false, // admin must approve
    createdAt: now(),
  };

  db.reviews.set(review.id, review);
  return review;
}

export function getReviews(targetType: Review["targetType"], targetId: string): Review[] {
  return Array.from(db.reviews.values()).filter(
    (r) => r.targetType === targetType && r.targetId === targetId && r.isApproved
  );
}

export function approveReview(reviewId: string): Review | undefined {
  const review = db.reviews.get(reviewId);
  if (!review) return undefined;
  review.isApproved = true;
  db.reviews.set(reviewId, review);

  if (review.targetType === "worker") {
    recalculateWorkerRating(review.targetId);
  }

  return review;
}

export function listAllReviews(): Review[] {
  return Array.from(db.reviews.values()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
