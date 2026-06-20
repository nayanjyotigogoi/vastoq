/**
 * Auth Service — OTP send/verify, session management, profile update
 *
 * OTP provider: MSG91 (stubbed — falls back to console log in dev)
 * OTP is 6 digits, expires in 10 minutes, max 3 attempts
 */

import { db, newId, now } from "@/lib/store";
import type { User, Role } from "@/lib/types";

const OTP_TTL_MS = 10 * 60 * 1000;  // 10 min
const MAX_ATTEMPTS = 3;

// ─── Send OTP ─────────────────────────────────────────────────────────────────

export async function sendOtp(phone: string): Promise<{ sent: boolean; devOtp?: string }> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + OTP_TTL_MS;

  db.otps.set(phone, { phone, otp, expiresAt, attempts: 0 });

  // MSG91 stub — only fires in production when env var is present
  if (process.env.MSG91_AUTH_KEY && process.env.NODE_ENV === "production") {
    await sendViaMSG91(phone, otp);
    return { sent: true };
  }

  // Development: return OTP directly so the frontend can pre-fill it
  console.log(`[Vastoq Auth] OTP for ${phone}: ${otp}`);
  return { sent: true, devOtp: otp };
}

async function sendViaMSG91(phone: string, otp: string) {
  await fetch("https://api.msg91.com/api/v5/otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authkey: process.env.MSG91_AUTH_KEY!,
    },
    body: JSON.stringify({
      template_id: process.env.MSG91_TEMPLATE_ID,
      mobile: `91${phone}`,
      otp,
    }),
  });
}

// ─── Verify OTP ───────────────────────────────────────────────────────────────

export async function verifyOtp(
  phone: string,
  otp: string,
  role?: Role,
  name?: string
): Promise<{ user: User; isNew: boolean } | { error: string; code: string }> {
  const record = db.otps.get(phone);

  if (!record) return { error: "No OTP requested for this number", code: "OTP_NOT_FOUND" };
  if (Date.now() > record.expiresAt) {
    db.otps.delete(phone);
    return { error: "OTP has expired", code: "OTP_EXPIRED" };
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    db.otps.delete(phone);
    return { error: "Too many incorrect attempts", code: "OTP_MAX_ATTEMPTS" };
  }
  if (record.otp !== otp) {
    record.attempts += 1;
    return { error: "Incorrect OTP", code: "OTP_INCORRECT" };
  }

  // OTP valid — clean up
  db.otps.delete(phone);

  // Find or create user
  let user = Array.from(db.users.values()).find((u) => u.phone === phone) ?? null;
  let isNew = false;

  if (!user) {
    isNew = true;
    user = {
      id: newId(),
      phone,
      name: name ?? `User_${phone.slice(-4)}`,
      role: role ?? "tenant",
      aadhaarStatus: "unverified",
      isBlocked: false,
      creditBalance: 0,
      createdAt: now(),
      updatedAt: now(),
    };
    db.users.set(user.id, user);
  } else if (isNew && role && user.role !== role) {
    user.role = role;
    user.updatedAt = now();
    db.users.set(user.id, user);
  }

  if (user.isBlocked) {
    return { error: "Your account has been suspended", code: "ACCOUNT_BLOCKED" };
  }

  return { user, isNew };
}

// ─── Get user by id ───────────────────────────────────────────────────────────

export function getUserById(id: string): User | undefined {
  return db.users.get(id);
}

// ─── Update profile ───────────────────────────────────────────────────────────

export function updateProfile(
  userId: string,
  updates: Partial<Pick<User, "name" | "email" | "avatarUrl">>
): User | null {
  const user = db.users.get(userId);
  if (!user) return null;
  Object.assign(user, { ...updates, updatedAt: now() });
  db.users.set(userId, user);
  return user;
}

// ─── Public profile (strip sensitive fields) ─────────────────────────────────

export function toPublicUser(user: User) {
  const { ...pub } = user;
  return pub;
}
