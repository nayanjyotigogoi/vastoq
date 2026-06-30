import { NextRequest } from "next/server";
import { ok, error } from "@/lib/api/response";
import { getFurnitureItems } from "@/lib/services/furniture.service";

// GET /api/furniture/items?category=sofa
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") ?? undefined;
  try {
    const items = await getFurnitureItems(category);
    return ok(items);
  } catch (e: any) {
    return error(e?.message ?? "Failed to fetch furniture", 500);
  }
}
