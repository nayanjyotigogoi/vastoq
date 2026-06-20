import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const SendOtpSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
});

export const VerifyOtpSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  role: z.enum(["tenant", "owner", "worker"]).optional(),
  name: z.string().min(2).max(80).optional(),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  email: z.string().email().optional().or(z.literal("")),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

// ─── Listings ─────────────────────────────────────────────────────────────────

export const CreateListingSchema = z.object({
  title: z.string().min(3).max(255),

  description: z.string().optional(),

  bhk_type: z.enum([
    "1rk",
    "1bhk",
    "2bhk",
    "3bhk",
    "4bhk",
    "5bhk",
    "studio",
    "other",
  ]),

  furnishing: z.enum([
    "unfurnished",
    "semi_furnished",
    "fully_furnished",
  ]),

  property_type: z.enum([
    "apartment",
    "independent_house",
    "villa",
    "office",
    "shop",
    "other",
  ]),

  listing_class: z.enum([
    "residential",
    "commercial",
  ]),

  locality: z.string().min(2),

  city: z.string().min(2),

  address: z.string().min(5),

  rent_per_month: z.coerce.number().min(0),

  deposit: z.coerce.number().min(0).optional(),

  amenities: z.array(z.string()).optional(),

  photos: z.array(z.string()).optional(),

  owner_phone: z.string().min(10),

  owner_email: z.string().email().optional(),

  is_broker: z.boolean().optional(),

  area_sqft: z.coerce.number().optional(),

  floor_number: z.coerce.number().optional(),

  gender_preference: z.enum([
    "male",
    "female",
    "family",
    "any",
  ]).optional(),

  latitude: z.coerce.number().optional(),

  longitude: z.coerce.number().optional(),

  pincode: z.string().optional(),
});

export const UpdateListingSchema =
  CreateListingSchema.partial();

export const ListingFiltersSchema = z.object({
  city: z.string().optional(),

  locality: z.string().optional(),

  property_type: z.string().optional(),

  bhk_type: z.string().optional(),

  furnishing: z.string().optional(),

  gender_preference: z.string().optional(),

  min_rent: z.coerce.number().optional(),

  max_rent: z.coerce.number().optional(),

  page: z.coerce.number().default(1),
});

// ─── Workers ─────────────────────────────────────────────────────────────────

export const CreateWorkerProfileSchema = z.object({
  name: z.string().min(2).max(80),
  category: z.enum([
    "plumber", "electrician", "carpenter", "painter", "cleaner",
    "packers-movers", "interior-designer", "appliance-repair", "pest-control", "security",
  ]),
  skills: z.array(z.string()).min(1),
  bio: z.string().min(20).max(500),
  city: z.string().min(2).max(80),
  locality: z.string().min(2).max(80),
  ratePerDay: z.number().int().positive().optional(),
  availability: z.array(z.boolean()).length(7),
  photoUrl: z.string().url().optional().or(z.literal("")),
});

export const UpdateWorkerProfileSchema = CreateWorkerProfileSchema.partial();

export const WorkerFiltersSchema = z.object({
  city: z.string().optional(),
  category: z.string().optional(),
  isVerified: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

// ─── Unlock ───────────────────────────────────────────────────────────────────

export const UnlockSchema = z.object({
  targetType: z.enum(["listing", "worker"]),
  targetId: z.string().min(1),
});

// ─── Credits / Payment ────────────────────────────────────────────────────────

export const CreateOrderSchema = z.object({
  amount: z.number().int().min(1000),    // in paise (₹10 minimum)
  couponCode: z.string().optional(),
});

export const VerifyPaymentSchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

// ─── Coupon ───────────────────────────────────────────────────────────────────

export const ValidateCouponSchema = z.object({
  code: z.string().min(1),
  amount: z.number().int().min(1),       // purchase amount in paise
});

export const CreateCouponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  type: z.enum(["flat", "percent", "bonus_credits"]),
  value: z.number().positive(),
  minAmount: z.number().int().optional(),
  maxDiscount: z.number().int().optional(),
  usageLimit: z.number().int().min(1),
  perUserLimit: z.number().int().min(1).default(1),
  applicableTo: z.enum(["all", "tenant", "owner", "worker"]).default("all"),
  blockedForBrokers: z.boolean().default(false),
  expiresAt: z.string(),
});

// ─── Review ───────────────────────────────────────────────────────────────────

export const CreateReviewSchema = z.object({
  targetType: z.enum(["listing", "worker"]),
  targetId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(500),
});

// ─── Message ─────────────────────────────────────────────────────────────────

export const SendMessageSchema = z.object({
  conversationId: z.string().optional(),
  recipientId: z.string().optional(),
  listingId: z.string().optional(),
  workerId: z.string().optional(),
  text: z.string().min(1).max(2000),
});

// ─── Furniture Enquiry ────────────────────────────────────────────────────────

export const FurnitureEnquirySchema = z.object({
  items: z.array(z.object({ itemId: z.string(), quantity: z.number().int().min(1) })).min(1),
  city: z.string().min(2).max(80),
  address: z.string().min(10).max(300),
  moveInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  durationMonths: z.number().int().min(1).max(60),
});

// ─── Admin ────────────────────────────────────────────────────────────────────

export const AdminListingActionSchema = z.object({
  action: z.enum(["approve", "reject", "feature", "unfeature"]),
  reason: z.string().optional(),
});

export const AdminUserActionSchema = z.object({
  action: z.enum(["block", "unblock", "grant_credits", "verify_aadhaar", "reject_aadhaar", "flag_broker"]),
  amount: z.number().int().optional(),   // for grant_credits
});

export const AdminWorkerActionSchema = z.object({
  action: z.enum(["verify", "reject", "deactivate"]),
});
