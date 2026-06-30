import { NextRequest, NextResponse } from "next/server";
import { ok, error } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// POST /api/uploads/profile-photo — single-image multipart passthrough
export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  try {
    const formData = await req.formData();
    const file = formData.get("photo");
    if (!file) return error("No photo provided", 422);

    const upstream = new FormData();
    upstream.append("photo", file as Blob);

    const res = await axios.post(`${API_URL}/uploads/profile-photo`, upstream, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return ok(res.data?.data ?? {}, 201);
  } catch (e: any) {
    const status = e?.response?.status ?? 500;
    const message =
      e?.response?.data?.message ??
      e?.response?.data?.errors?.photo?.[0] ??
      "Failed to upload photo";
    return error(message, status);
  }
}
