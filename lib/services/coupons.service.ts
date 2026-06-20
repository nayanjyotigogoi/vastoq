import { db, newId, now } from "@/lib/store";
import type { Coupon, Role } from "@/lib/types";

export function validateCoupon(
  code: string,
  userId: string,
  userRole: Role,
  amountPaise: number
):
  | { valid: true; coupon: Coupon; discount: number; bonusCredits: number }
  | { valid: false; error: string } {
  const coupon = Array.from(db.coupons.values()).find(
    (c) => c.code === code.toUpperCase() && c.isActive
  );

  if (!coupon) return { valid: false, error: "Invalid or expired coupon code" };
  if (new Date(coupon.expiresAt) < new Date()) return { valid: false, error: "Coupon has expired" };
  if (coupon.usageCount >= coupon.usageLimit) return { valid: false, error: "Coupon usage limit reached" };
  if (coupon.minAmount && amountPaise < coupon.minAmount) {
    return {
      valid: false,
      error: `Minimum purchase of ₹${coupon.minAmount / 100} required for this coupon`,
    };
  }

  // Role check
  if (coupon.applicableTo !== "all" && coupon.applicableTo !== userRole) {
    return { valid: false, error: `This coupon is only for ${coupon.applicableTo} accounts` };
  }

  // Per-user usage check
  const usageKey = `${coupon.id}:${userId}`;
  const userUsage = db.couponUsages.get(usageKey);
  if (userUsage && userUsage.count >= coupon.perUserLimit) {
    return { valid: false, error: "You have already used this coupon the maximum number of times" };
  }

  let discount = 0;
  let bonusCredits = 0;

  if (coupon.type === "flat") {
    discount = Math.min(coupon.value, amountPaise);
  } else if (coupon.type === "percent") {
    discount = Math.min(
      Math.floor((amountPaise * coupon.value) / 100),
      coupon.maxDiscount ?? Infinity
    );
  } else if (coupon.type === "bonus_credits") {
    bonusCredits = coupon.value;
  }

  return { valid: true, coupon, discount, bonusCredits };
}

export function createCoupon(data: Omit<Coupon, "id" | "usageCount" | "createdAt">): Coupon {
  const existing = Array.from(db.coupons.values()).find((c) => c.code === data.code.toUpperCase());
  if (existing) throw new Error("Coupon code already exists");

  const coupon: Coupon = {
    id: newId(),
    ...data,
    code: data.code.toUpperCase(),
    usageCount: 0,
    createdAt: now(),
  };
  db.coupons.set(coupon.id, coupon);
  return coupon;
}

export function listCoupons(): Coupon[] {
  return Array.from(db.coupons.values()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
