import { NextRequest } from "next/server";
import { ok } from "@/lib/api/response";
import { requireRole } from "@/lib/auth";
import { listAllListings } from "@/lib/services/admin.service";

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "admin");
  if ("status" in auth) return auth;

  const listings = listAllListings();
  return ok(listings);
}
