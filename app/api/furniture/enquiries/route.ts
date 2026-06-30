import { NextRequest } from "next/server";
import { created, error } from "@/lib/api/response";
import { createFurnitureEnquiry, type FurnitureEnquiryPayload } from "@/lib/services/furniture.service";

// POST /api/furniture/enquiries — new enquiry (guest, no auth required)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as Partial<FurnitureEnquiryPayload>;

  if (!body.furniture_id || !body.name || !body.phone || !body.locality) {
    return error("furniture_id, name, phone and locality are required", 422);
  }

  try {
    const result = await createFurnitureEnquiry(body as FurnitureEnquiryPayload);
    return created(result);
  } catch (e: any) {
    return error(e?.message ?? "Failed to submit enquiry", 400);
  }
}
