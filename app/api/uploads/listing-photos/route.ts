import { NextRequest, NextResponse } from "next/server";
import { ok, error } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// POST /api/uploads/listing-photos — multipart passthrough to Laravel
export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  try {
    const formData = await req.formData();

    // Re-wrap into a fresh FormData for axios (Node's fetch FormData works fine here)
    const upstream = new FormData();
    for (const file of formData.getAll("photos")) {
      upstream.append("photos[]", file as Blob);
    }

    const res = await axios.post(`${API_URL}/uploads/listing-photos`, upstream, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return ok(res.data?.data ?? {}, 201);
  } catch (e: any) {
    const status = e?.response?.status ?? 500;
    const message =
      e?.response?.data?.message ??
      e?.response?.data?.errors?.["photos.0"]?.[0] ??
      "Failed to upload photos";
    return error(message, status);
  }
}
