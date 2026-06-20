/**
 * Payments Service
 *
 * Razorpay integration (stubbed):
 *  - createOrder: generates a mock Razorpay order (uses real API in production)
 *  - verifyPayment: validates HMAC signature (uses real API in production)
 *  - On success: credits are added to user balance + credit transaction recorded
 *
 * Credit pricing (paise → credits):
 *  ₹10  = 10 credits
 *  ₹50  = 55 credits (10% bonus)
 *  ₹100 = 120 credits (20% bonus)
 *  ₹500 = 650 credits (30% bonus)
 */

import crypto from "crypto";
import { db, newId, now } from "@/lib/store";
import type { Payment, CreditTransaction } from "@/lib/types";

// ─── Credit packs ─────────────────────────────────────────────────────────────

const CREDIT_PACKS: Array<{ minAmount: number; creditsPerRupee: number }> = [
  { minAmount: 50000,  creditsPerRupee: 1.3  }, // ₹500+  → 30% bonus
  { minAmount: 10000,  creditsPerRupee: 1.2  }, // ₹100+  → 20% bonus
  { minAmount: 5000,   creditsPerRupee: 1.1  }, // ₹50+   → 10% bonus
  { minAmount: 0,      creditsPerRupee: 1.0  }, // base
];

export function calculateCredits(amountPaise: number, bonusCredits = 0): number {
  const rupees = amountPaise / 100;
  const pack = CREDIT_PACKS.find((p) => amountPaise >= p.minAmount)!;
  return Math.floor(rupees * pack.creditsPerRupee) + bonusCredits;
}

// ─── Create Razorpay order ─────────────────────────────────────────────────────

export async function createOrder(
  userId: string,
  amountPaise: number,
  couponCode?: string
): Promise<
  | { payment: Payment; razorpayKey: string; finalAmount: number; creditsGranted: number }
  | { error: string }
> {
  const user = db.users.get(userId);
  if (!user) return { error: "User not found" };

  let finalAmount = amountPaise;
  let couponDiscount = 0;
  let bonusCredits = 0;
  let couponId: string | undefined;

  // Apply coupon
  if (couponCode) {
    const coupon = Array.from(db.coupons.values()).find(
      (c) => c.code === couponCode.toUpperCase() && c.isActive
    );
    if (coupon) {
      // §22 broker coupon block
      const isOwnerBroker = user.role === "owner"; // simplified; a real check would look at flagged listings
      if (coupon.blockedForBrokers && isOwnerBroker) {
        return { error: "This coupon is not valid for broker accounts" };
      }
      if (coupon.type === "flat") {
        couponDiscount = Math.min(coupon.value, amountPaise);
      } else if (coupon.type === "percent") {
        couponDiscount = Math.min(
          Math.floor((amountPaise * coupon.value) / 100),
          coupon.maxDiscount ?? Infinity
        );
      } else if (coupon.type === "bonus_credits") {
        bonusCredits = coupon.value;
      }
      finalAmount = Math.max(0, amountPaise - couponDiscount);
      couponId = coupon.id;
    }
  }

  const creditsGranted = calculateCredits(finalAmount, bonusCredits);

  // Stub Razorpay order (real call in production)
  let razorpayOrderId: string;
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayOrderId = await createRazorpayOrder(finalAmount);
  } else {
    razorpayOrderId = `order_dev_${newId().slice(0, 16)}`;
  }

  const payment: Payment = {
    id: newId(),
    userId,
    razorpayOrderId,
    amount: finalAmount,
    creditsGranted,
    status: "created",
    couponCode,
    couponDiscount: couponDiscount || undefined,
    createdAt: now(),
    updatedAt: now(),
  };

  db.payments.set(payment.id, payment);

  // Mark coupon usage if applied
  if (couponId && couponCode) {
    const coupon = Array.from(db.coupons.values()).find((c) => c.id === couponId)!;
    coupon.usageCount += 1;
    db.coupons.set(coupon.id, coupon);

    const usageKey = `${couponId}:${userId}`;
    const existing = db.couponUsages.get(usageKey);
    if (existing) {
      existing.count += 1;
      db.couponUsages.set(usageKey, existing);
    } else {
      db.couponUsages.set(usageKey, { couponId, userId, count: 1 });
    }
  }

  return {
    payment,
    razorpayKey: process.env.RAZORPAY_KEY_ID ?? "rzp_test_dev_key",
    finalAmount,
    creditsGranted,
  };
}

async function createRazorpayOrder(amountPaise: number): Promise<string> {
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(
        `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
      ).toString("base64")}`,
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt: `vastoq_${newId().slice(0, 12)}`,
    }),
  });
  const json = await res.json();
  return json.id;
}

// ─── Verify payment ────────────────────────────────────────────────────────────

export function verifyPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): { valid: boolean } {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    // Dev mode — accept all payments with the mock order prefix
    return { valid: razorpayOrderId.startsWith("order_dev_") };
  }

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  return { valid: expected === razorpaySignature };
}

// ─── Confirm payment & credit user ────────────────────────────────────────────

export function confirmPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Payment | { error: string } {
  const payment = Array.from(db.payments.values()).find(
    (p) => p.razorpayOrderId === razorpayOrderId
  );
  if (!payment) return { error: "Payment record not found" };
  if (payment.status === "paid") return payment; // idempotent

  const { valid } = verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!valid) return { error: "Payment signature verification failed" };

  payment.razorpayPaymentId = razorpayPaymentId;
  payment.razorpaySignature = razorpaySignature;
  payment.status = "paid";
  payment.updatedAt = now();
  db.payments.set(payment.id, payment);

  // Credit the user
  const user = db.users.get(payment.userId);
  if (!user) return { error: "User not found" };
  user.creditBalance += payment.creditsGranted;
  user.updatedAt = now();
  db.users.set(user.id, user);

  const tx: CreditTransaction = {
    id: newId(),
    userId: payment.userId,
    type: "purchase",
    amount: payment.creditsGranted,
    description: `Purchased ${payment.creditsGranted} credits`,
    referenceId: payment.id,
    balanceAfter: user.creditBalance,
    createdAt: now(),
  };
  db.creditTxs.set(tx.id, tx);

  return payment;
}

// ─── Credit history ───────────────────────────────────────────────────────────

export function getCreditHistory(userId: string): CreditTransaction[] {
  return Array.from(db.creditTxs.values())
    .filter((t) => t.userId === userId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
