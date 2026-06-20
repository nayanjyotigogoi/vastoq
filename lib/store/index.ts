/**
 * Vastoq — In-Memory Store
 *
 * All maps are module-level singletons.  In Next.js dev mode the module is
 * hot-reloaded, so we attach the store to `globalThis` to survive HMR without
 * losing data between requests.
 *
 * In production (single-process serverless) the maps live for the lifetime of
 * the warm Lambda/Edge function instance — exactly the right behaviour for a
 * "no-database" backend.
 */

import { v4 as uuidv4 } from "uuid";
import type {
  User,
  Listing,
  WorkerProfile,
  Unlock,
  CreditTransaction,
  Payment,
  Coupon,
  CouponUsage,
  Review,
  Conversation,
  Message,
  FurnitureItem,
  FurnitureEnquiry,
  OtpRecord,
} from "@/lib/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function now(): string {
  return new Date().toISOString();
}

export { uuidv4 as newId, now };

// ─── Singleton initialiser ───────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __vastoq_store: VastoqStore | undefined;
}

interface VastoqStore {
  users: Map<string, User>;
  listings: Map<string, Listing>;
  workers: Map<string, WorkerProfile>;
  unlocks: Map<string, Unlock>;
  creditTxs: Map<string, CreditTransaction>;
  payments: Map<string, Payment>;
  coupons: Map<string, Coupon>;
  couponUsages: Map<string, CouponUsage>;   // key: `${couponId}:${userId}`
  reviews: Map<string, Review>;
  conversations: Map<string, Conversation>;
  messages: Map<string, Message>;
  furnitureItems: Map<string, FurnitureItem>;
  furnitureEnquiries: Map<string, FurnitureEnquiry>;
  otps: Map<string, OtpRecord>;             // key: phone
}

function createStore(): VastoqStore {
  const store: VastoqStore = {
    users: new Map(),
    listings: new Map(),
    workers: new Map(),
    unlocks: new Map(),
    creditTxs: new Map(),
    payments: new Map(),
    coupons: new Map(),
    couponUsages: new Map(),
    reviews: new Map(),
    conversations: new Map(),
    messages: new Map(),
    furnitureItems: new Map(),
    furnitureEnquiries: new Map(),
    otps: new Map(),
  };
  seed(store);
  return store;
}

function getStore(): VastoqStore {
  if (!global.__vastoq_store) {
    global.__vastoq_store = createStore();
  }
  return global.__vastoq_store;
}

export const db = new Proxy({} as VastoqStore, {
  get(_target, prop) {
    return getStore()[prop as keyof VastoqStore];
  },
});

// ─── Seed data ────────────────────────────────────────────────────────────────

function seed(s: VastoqStore) {
  // ── Users ──────────────────────────────────────────────────────────────────
  const users: User[] = [
    {
      id: "u1",
      phone: "9800000001",
      name: "Arjun Mehta",
      email: "arjun@example.com",
      role: "tenant",
      aadhaarStatus: "verified",
      isBlocked: false,
      creditBalance: 450,
      createdAt: "2024-01-10T08:00:00Z",
      updatedAt: "2024-06-01T10:00:00Z",
    },
    {
      id: "u2",
      phone: "9800000002",
      name: "Priya Sharma",
      email: "priya@example.com",
      role: "owner",
      aadhaarStatus: "verified",
      isBlocked: false,
      creditBalance: 200,
      createdAt: "2024-02-15T09:00:00Z",
      updatedAt: "2024-06-05T11:00:00Z",
    },
    {
      id: "u3",
      phone: "9800000003",
      name: "Ravi Kumar",
      email: "ravi@example.com",
      role: "worker",
      aadhaarStatus: "verified",
      isBlocked: false,
      creditBalance: 0,
      createdAt: "2024-03-20T07:30:00Z",
      updatedAt: "2024-06-08T09:00:00Z",
    },
    {
      id: "u4",
      phone: "9800000004",
      name: "Admin Vastoq",
      role: "admin",
      aadhaarStatus: "verified",
      isBlocked: false,
      creditBalance: 0,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "u5",
      phone: "9800000005",
      name: "Sneha Reddy",
      email: "sneha@example.com",
      role: "owner",
      aadhaarStatus: "pending",
      isBlocked: false,
      creditBalance: 0,
      createdAt: "2024-05-01T08:00:00Z",
      updatedAt: "2024-05-15T10:00:00Z",
    },
    {
      id: "u6",
      phone: "9800000006",
      name: "Deepak Singh",
      email: "deepak@example.com",
      role: "tenant",
      aadhaarStatus: "unverified",
      isBlocked: false,
      creditBalance: 0,
      createdAt: "2024-04-12T10:00:00Z",
      updatedAt: "2024-04-12T10:00:00Z",
    },
  ];
  users.forEach((u) => s.users.set(u.id, u));

  // ── Listings ────────────────────────────────────────────────────────────────
  const listings: Listing[] = [
    {
      id: "l1",
      ownerId: "u2",
      title: "Spacious 2BHK in Koramangala",
      description:
        "Well-lit 2BHK apartment on 4th floor. Near to Koramangala 6th Block. Easy access to cafes, gyms and metro.",
      bhkType: "2BHK",
      furnishing: "semi-furnished",
      rentPerMonth: 2500000,
      deposit: 7500000,
      locality: "Koramangala",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560034",
      latitude: 12.9352,
      longitude: 77.6245,
      amenities: ["wifi", "parking", "security", "lift", "power-backup"],
      photos: [
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
        "https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=800",
      ],
      genderPreference: "any",
      availableFrom: "2024-07-01",
      status: "active",
      isBroker: false,
      isFeatured: true,
      viewCount: 142,
      unlockCount: 18,
      createdAt: "2024-05-20T10:00:00Z",
      updatedAt: "2024-06-01T10:00:00Z",
    },
    {
      id: "l2",
      ownerId: "u2",
      title: "1BHK near Indiranagar Metro",
      description:
        "Cozy 1BHK just 200m from Indiranagar Metro. Perfect for working professionals.",
      bhkType: "1BHK",
      furnishing: "fully-furnished",
      rentPerMonth: 1800000,
      deposit: 5400000,
      locality: "Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
      latitude: 12.9784,
      longitude: 77.6408,
      amenities: ["wifi", "ac", "fridge", "washing-machine"],
      photos: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      ],
      genderPreference: "any",
      availableFrom: "2024-06-15",
      status: "active",
      isBroker: false,
      isFeatured: false,
      viewCount: 98,
      unlockCount: 12,
      createdAt: "2024-05-25T09:00:00Z",
      updatedAt: "2024-06-05T09:00:00Z",
    },
    {
      id: "l3",
      ownerId: "u5",
      title: "3BHK Villa in HSR Layout",
      description:
        "Independent 3BHK villa with private garden. Ideal for families. Gated community with 24x7 security.",
      bhkType: "3BHK",
      furnishing: "semi-furnished",
      rentPerMonth: 4500000,
      deposit: 13500000,
      locality: "HSR Layout",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560102",
      amenities: ["parking", "garden", "security", "power-backup", "cctv"],
      photos: [
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800",
        "https://images.unsplash.com/photo-1592595896616-c37162298647?w=800",
        "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800",
      ],
      genderPreference: "any",
      availableFrom: "2024-08-01",
      status: "pending",
      isBroker: false,
      isFeatured: false,
      viewCount: 34,
      unlockCount: 2,
      createdAt: "2024-06-01T10:00:00Z",
      updatedAt: "2024-06-01T10:00:00Z",
    },
    {
      id: "l4",
      ownerId: "u2",
      title: "PG for Women in BTM Layout",
      description:
        "Safe women-only PG with homely food, 24x7 CCTV, and walking distance to major IT parks.",
      bhkType: "pg",
      furnishing: "fully-furnished",
      rentPerMonth: 900000,
      deposit: 900000,
      locality: "BTM Layout",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560076",
      amenities: ["wifi", "food", "security", "laundry", "cctv"],
      photos: [
        "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
        "https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=800",
      ],
      genderPreference: "female",
      availableFrom: "2024-06-10",
      status: "active",
      isBroker: false,
      isFeatured: true,
      viewCount: 203,
      unlockCount: 31,
      createdAt: "2024-04-10T08:00:00Z",
      updatedAt: "2024-06-08T08:00:00Z",
    },
    {
      id: "l5",
      ownerId: "u5",
      title: "1RK Bachelor Flat in Whitefield",
      description:
        "Affordable 1RK studio for bachelors. Near Whitefield IT corridor and EPIP Zone.",
      bhkType: "1RK",
      furnishing: "unfurnished",
      rentPerMonth: 850000,
      deposit: 1700000,
      locality: "Whitefield",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560066",
      amenities: ["parking", "power-backup"],
      photos: [
        "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800",
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
        "https://images.unsplash.com/photo-1617098900591-3f90928e8c54?w=800",
      ],
      genderPreference: "male",
      availableFrom: "2024-07-15",
      status: "active",
      isBroker: false,
      isFeatured: false,
      viewCount: 67,
      unlockCount: 5,
      createdAt: "2024-06-01T07:00:00Z",
      updatedAt: "2024-06-09T07:00:00Z",
    },
  ];
  listings.forEach((l) => s.listings.set(l.id, l));

  // ── Workers ─────────────────────────────────────────────────────────────────
  const workers: WorkerProfile[] = [
    {
      id: "w1",
      userId: "u3",
      name: "Ravi Kumar",
      phone: "9800000003",
      category: "plumber",
      skills: ["pipe-fitting", "leak-repair", "bathroom-installation"],
      bio: "10+ years experience in residential plumbing. Available on weekends and holidays.",
      city: "Bengaluru",
      locality: "Koramangala",
      ratePerDay: 150000,
      availability: [true, true, false, true, true, false, true],
      photoUrl: "https://i.pravatar.cc/150?img=12",
      rating: 4.7,
      reviewCount: 43,
      isVerified: true,
      aadhaarStatus: "verified",
      isActive: true,
      createdAt: "2024-03-20T07:30:00Z",
      updatedAt: "2024-06-08T09:00:00Z",
    },
    {
      id: "w2",
      userId: "u3",
      name: "Suresh Babu",
      phone: "9800000007",
      category: "electrician",
      skills: ["wiring", "mcb-installation", "inverter-setup", "fan-fitting"],
      bio: "Licensed electrician with 8 years experience. Transparent pricing, no hidden charges.",
      city: "Bengaluru",
      locality: "Indiranagar",
      ratePerDay: 130000,
      availability: [false, true, true, true, true, true, false],
      photoUrl: "https://i.pravatar.cc/150?img=33",
      rating: 4.5,
      reviewCount: 38,
      isVerified: true,
      aadhaarStatus: "verified",
      isActive: true,
      createdAt: "2024-04-01T08:00:00Z",
      updatedAt: "2024-06-07T10:00:00Z",
    },
    {
      id: "w3",
      userId: "u3",
      name: "Meena Devi",
      phone: "9800000008",
      category: "cleaner",
      skills: ["deep-cleaning", "sofa-cleaning", "carpet-cleaning", "bathroom-sanitization"],
      bio: "Professional home cleaning with eco-friendly products. Trusted by 200+ families.",
      city: "Bengaluru",
      locality: "HSR Layout",
      ratePerDay: 80000,
      availability: [true, true, true, true, true, false, false],
      photoUrl: "https://i.pravatar.cc/150?img=47",
      rating: 4.9,
      reviewCount: 89,
      isVerified: true,
      aadhaarStatus: "verified",
      isActive: true,
      createdAt: "2024-02-10T09:00:00Z",
      updatedAt: "2024-06-09T08:00:00Z",
    },
    {
      id: "w4",
      userId: "u3",
      name: "Vikram Pandit",
      phone: "9800000009",
      category: "carpenter",
      skills: ["furniture-assembly", "door-fitting", "wardrobe-repair", "false-ceiling"],
      bio: "Skilled carpenter with expertise in modular furniture and civil carpentry work.",
      city: "Bengaluru",
      locality: "BTM Layout",
      ratePerDay: 160000,
      availability: [true, false, true, false, true, true, true],
      photoUrl: "https://i.pravatar.cc/150?img=56",
      rating: 4.3,
      reviewCount: 27,
      isVerified: false,
      aadhaarStatus: "pending",
      isActive: true,
      createdAt: "2024-05-15T10:00:00Z",
      updatedAt: "2024-06-05T10:00:00Z",
    },
    {
      id: "w5",
      userId: "u3",
      name: "Anand Murthy",
      phone: "9800000010",
      category: "packers-movers",
      skills: ["packing", "loading", "vehicle-arrangement", "fragile-handling"],
      bio: "Full-service home shifting with insurance coverage. 500+ successful moves.",
      city: "Bengaluru",
      locality: "Whitefield",
      ratePerDay: 500000,
      availability: [true, true, true, true, true, true, true],
      photoUrl: "https://i.pravatar.cc/150?img=68",
      rating: 4.6,
      reviewCount: 62,
      isVerified: true,
      aadhaarStatus: "verified",
      isActive: true,
      createdAt: "2024-01-25T06:00:00Z",
      updatedAt: "2024-06-08T06:00:00Z",
    },
  ];
  workers.forEach((w) => s.workers.set(w.id, w));

  // ── Coupons ─────────────────────────────────────────────────────────────────
  const coupons: Coupon[] = [
    {
      id: "c1",
      code: "VASTOQ100",
      type: "flat",
      value: 10000,
      usageLimit: 1000,
      usageCount: 47,
      perUserLimit: 1,
      applicableTo: "all",
      blockedForBrokers: false,
      isActive: true,
      expiresAt: "2025-12-31T23:59:59Z",
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "c2",
      code: "NOBRO20",
      type: "percent",
      value: 20,
      maxDiscount: 5000,
      usageLimit: 500,
      usageCount: 23,
      perUserLimit: 2,
      applicableTo: "tenant",
      blockedForBrokers: true,
      isActive: true,
      expiresAt: "2025-12-31T23:59:59Z",
      createdAt: "2024-03-01T00:00:00Z",
    },
    {
      id: "c3",
      code: "OWNER50",
      type: "bonus_credits",
      value: 50,
      minAmount: 50000,
      usageLimit: 200,
      usageCount: 11,
      perUserLimit: 1,
      applicableTo: "owner",
      blockedForBrokers: false,
      isActive: true,
      expiresAt: "2025-06-30T23:59:59Z",
      createdAt: "2024-04-01T00:00:00Z",
    },
  ];
  coupons.forEach((c) => s.coupons.set(c.id, c));

  // ── Furniture Items ─────────────────────────────────────────────────────────
  const furniture: FurnitureItem[] = [
    {
      id: "f1",
      name: "3-Seater L-Shape Sofa",
      category: "sofa",
      description: "Premium fabric sofa with metal legs. Fits perfectly in modern apartments.",
      rentPerMonth: 59900,
      depositAmount: 119900,
      imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
      isAvailable: true,
      minRentalMonths: 3,
      tags: ["living-room", "premium"],
    },
    {
      id: "f2",
      name: "Queen Size Bed with Storage",
      category: "bed",
      description: "Hydraulic storage bed with mattress and two side tables included.",
      rentPerMonth: 79900,
      depositAmount: 159900,
      imageUrl: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400",
      isAvailable: true,
      minRentalMonths: 6,
      tags: ["bedroom", "storage"],
    },
    {
      id: "f3",
      name: "4-Seater Dining Set",
      category: "dining",
      description: "Solid wood dining table with 4 cushioned chairs.",
      rentPerMonth: 44900,
      depositAmount: 89900,
      imageUrl: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400",
      isAvailable: true,
      minRentalMonths: 3,
      tags: ["dining", "solid-wood"],
    },
    {
      id: "f4",
      name: "250L Double-Door Refrigerator",
      category: "appliance",
      description: "5-star energy-rated refrigerator. Frost-free with vegetable crisper.",
      rentPerMonth: 64900,
      depositAmount: 129900,
      imageUrl: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400",
      isAvailable: true,
      minRentalMonths: 6,
      tags: ["kitchen", "energy-efficient"],
    },
    {
      id: "f5",
      name: "Fully Furnished Studio Pack",
      category: "combo-pack",
      description: "Complete studio bundle: bed, sofa, dining set, fridge, washing machine and microwave.",
      rentPerMonth: 299900,
      depositAmount: 599900,
      imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
      isAvailable: true,
      minRentalMonths: 6,
      tags: ["combo", "best-value"],
    },
    {
      id: "f6",
      name: "Study Table + Ergonomic Chair",
      category: "study",
      description: "Height-adjustable study desk with mesh-back ergonomic office chair.",
      rentPerMonth: 34900,
      depositAmount: 69900,
      imageUrl: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400",
      isAvailable: true,
      minRentalMonths: 3,
      tags: ["work-from-home", "ergonomic"],
    },
  ];
  furniture.forEach((f) => s.furnitureItems.set(f.id, f));

  // ── Seed one unlock so tenant dashboard has data ────────────────────────────
  const unlock: Unlock = {
    id: "unl1",
    userId: "u1",
    targetType: "listing",
    targetId: "l1",
    creditsSpent: 1,
    revealedPhone: "9800000002",
    revealedAddress: "4th Floor, 12th Cross, Koramangala 6th Block, Bengaluru – 560034",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: "2024-06-01T11:00:00Z",
  };
  s.unlocks.set(unlock.id, unlock);

  // ── Seed credit transactions ─────────────────────────────────────────────────
  const txns: CreditTransaction[] = [
    {
      id: "tx1",
      userId: "u1",
      type: "purchase",
      amount: 500,
      description: "Purchased 500 credits",
      balanceAfter: 500,
      createdAt: "2024-05-28T10:00:00Z",
    },
    {
      id: "tx2",
      userId: "u1",
      type: "unlock_listing",
      amount: -1,
      description: "Unlocked listing: Spacious 2BHK in Koramangala",
      referenceId: "unl1",
      balanceAfter: 499,
      createdAt: "2024-06-01T11:00:00Z",
    },
    {
      id: "tx3",
      userId: "u1",
      type: "admin_grant",
      amount: -48,
      description: "Adjustment (promo correction)",
      balanceAfter: 451,
      createdAt: "2024-06-05T09:00:00Z",
    },
  ];
  txns.forEach((t) => s.creditTxs.set(t.id, t));

  // ── Seed reviews ─────────────────────────────────────────────────────────────
  const reviews: Review[] = [
    {
      id: "r1",
      authorId: "u1",
      targetType: "listing",
      targetId: "l1",
      rating: 5,
      comment: "Excellent owner. Very transparent about the property.",
      isApproved: true,
      createdAt: "2024-06-03T12:00:00Z",
    },
    {
      id: "r2",
      authorId: "u6",
      targetType: "worker",
      targetId: "w1",
      rating: 4,
      comment: "Ravi fixed the leak quickly and professionally.",
      isApproved: true,
      createdAt: "2024-05-20T14:00:00Z",
    },
    {
      id: "r3",
      authorId: "u1",
      targetType: "worker",
      targetId: "w3",
      rating: 5,
      comment: "Meena did a thorough deep clean. Highly recommended.",
      isApproved: false,
      createdAt: "2024-06-09T09:00:00Z",
    },
  ];
  reviews.forEach((r) => s.reviews.set(r.id, r));
}
