// ─── Vastoq Core Domain Types ───────────────────────────────────────────────

export type Role = "tenant" | "owner" | "worker" | "admin";

export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  role: Role;
  avatarUrl?: string;
  aadhaarStatus: VerificationStatus;
  isBlocked: boolean;
  creditBalance: number;          // in paise (1 credit = ₹1)
  createdAt: string;
  updatedAt: string;
}

// ─── Listing ─────────────────────────────────────────────────────────────────

export type ListingStatus =
  | "pending"
  | "approved"
  | "rejected";
export type FurnishingType =
  | "unfurnished"
  | "semi_furnished"
  | "fully_furnished";
export type BHKType =
  | "na"
  | "1rk"
  | "2rk"
  | "1bhk"
  | "2bhk"
  | "3bhk"
  | "4bhk"
  | "5bhk";
export type GenderPreference = "any" | "male" | "female";

export interface Listing {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  bhkType: BHKType;
  furnishing: FurnishingType;
  rentPerMonth: number;           // in paise
  deposit: number;                // in paise
  locality: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  amenities: string[];
  photos: string[];               // URLs (min 3 required to publish)
  genderPreference: GenderPreference;
  availableFrom: string;          // ISO date
  status: ListingStatus;
  isBroker: boolean;              // auto-flagged by admin
  isFeatured: boolean;
  viewCount: number;
  unlockCount: number;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
}

// ─── Worker ──────────────────────────────────────────────────────────────────

export type WorkerCategory =
  | "plumber"
  | "electrician"
  | "carpenter"
  | "painter"
  | "cleaner"
  | "packers-movers"
  | "interior-designer"
  | "appliance-repair"
  | "pest-control"
  | "security";

export interface WorkerProfile {
  id: string;
  userId: string;
  name: string;
  phone?: string;                 // revealed after unlock
  category: WorkerCategory;
  skills: string[];
  bio: string;
  city: string;
  locality: string;
  ratePerDay?: number;            // in paise
  availability: boolean[];        // 7-slot weekly grid (Mon–Sun)
  photoUrl?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  aadhaarStatus: VerificationStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Unlock ───────────────────────────────────────────────────────────────────

export type UnlockTargetType = "listing" | "worker";

export interface Unlock {
  id: string;
  userId: string;
  targetType: UnlockTargetType;
  targetId: string;
  creditsSpent: number;
  revealedPhone?: string;
  revealedAddress?: string;
  expiresAt: string;              // ISO datetime
  createdAt: string;
}

// ─── Credit Transaction ───────────────────────────────────────────────────────

export type CreditTxType =
  | "purchase"
  | "unlock_listing"
  | "unlock_worker"
  | "refund"
  | "admin_grant"
  | "coupon_bonus";

export interface CreditTransaction {
  id: string;
  userId: string;
  type: CreditTxType;
  amount: number;                 // positive = credit, negative = debit
  description: string;
  referenceId?: string;           // unlock id / payment id
  balanceAfter: number;
  createdAt: string;
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export type PaymentStatus = "created" | "paid" | "failed" | "refunded";

export interface Payment {
  id: string;
  userId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;                 // in paise
  creditsGranted: number;
  status: PaymentStatus;
  couponCode?: string;
  couponDiscount?: number;        // in paise
  createdAt: string;
  updatedAt: string;
}

// ─── Coupon ───────────────────────────────────────────────────────────────────

export type CouponType = "flat" | "percent" | "bonus_credits";
export type CouponApplicableTo = "all" | "tenant" | "owner" | "worker";

export interface Coupon {
  id: string;
  code: string;                   // uppercase
  type: CouponType;
  value: number;                  // flat paise | percent 0–100 | bonus credits
  minAmount?: number;             // in paise, optional min purchase
  maxDiscount?: number;           // cap for percent coupons, in paise
  usageLimit: number;             // total uses allowed
  usageCount: number;
  perUserLimit: number;
  applicableTo: CouponApplicableTo;
  blockedForBrokers: boolean;     // §22 broker coupon block
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface CouponUsage {
  couponId: string;
  userId: string;
  count: number;
}

// ─── Review ───────────────────────────────────────────────────────────────────

export type ReviewTargetType = "listing" | "worker";

export interface Review {
  id: string;
  authorId: string;
  targetType: ReviewTargetType;
  targetId: string;
  rating: number;                 // 1–5
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

// ─── Conversation / Message ───────────────────────────────────────────────────

export interface Conversation {
  id: string;
  participantIds: string[];
  listingId?: string;
  workerId?: string;
  lastMessageAt: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Furniture ────────────────────────────────────────────────────────────────

export type FurnitureCategory =
  | "sofa"
  | "bed"
  | "dining"
  | "study"
  | "wardrobe"
  | "appliance"
  | "combo-pack";

export interface FurnitureItem {
  id: string;
  name: string;
  category: FurnitureCategory;
  description: string;
  rentPerMonth: number;           // in paise
  depositAmount: number;          // in paise
  imageUrl: string;
  isAvailable: boolean;
  minRentalMonths: number;
  tags: string[];
}

export interface FurnitureEnquiry {
  id: string;
  userId: string;
  items: Array<{ itemId: string; quantity: number }>;
  city: string;
  address: string;
  moveInDate: string;
  durationMonths: number;
  totalMonthlyRent: number;       // in paise
  status: "open" | "contacted" | "converted" | "cancelled";
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── OTP ─────────────────────────────────────────────────────────────────────

export interface OtpRecord {
  phone: string;
  otp: string;
  expiresAt: number;              // unix ms
  attempts: number;
}

// ─── Session payload (JWT claims) ────────────────────────────────────────────

export interface SessionPayload {
  userId: string;
  phone: string;
  name: string;
  role: Role;
  iat?: number;
  exp?: number;
}
