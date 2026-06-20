import { NextRequest } from "next/server";
import { ok } from "@/lib/api/response";
import { clearSessionCookie } from "@/lib/auth";

export async function POST(_req: NextRequest) {
  await clearSessionCookie();
  return ok({ loggedOut: true });
}
