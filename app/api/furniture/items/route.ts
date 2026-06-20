import { NextRequest } from "next/server";
import { ok } from "@/lib/api/response";
import { listFurnitureItems } from "@/lib/services/furniture.service";

// GET /api/furniture/items?category=sofa
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") ?? undefined;
  const items = listFurnitureItems(category);
  return ok(items);
}
