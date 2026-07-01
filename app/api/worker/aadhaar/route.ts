import { NextRequest, NextResponse } from "next/server";
import { ok, error } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// POST /api/worker/aadhaar — submit Aadhaar documents for verification
export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => ({}));

  try {
    const res = await axios.post(`${API_URL}/worker/aadhaar`, {
      user_id: guard.session.userId,
      aadhaar_number: body.aadhaar_number || undefined,
      front_url: body.front_url,
      back_url: body.back_url,
    });

    return ok(res.data?.data ?? {});
  } catch (e: any) {
    const status = e?.response?.status ?? 500;
    const message = e?.response?.data?.error?.message ?? e?.response?.data?.message ?? "Failed to submit documents";
    return error(message, status);
  }
}
