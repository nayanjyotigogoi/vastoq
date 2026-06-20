import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth";
import type { SessionPayload, Role } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const payload: SessionPayload = {
      userId: String(body.userId),
      phone: body.phone,
      role: body.role as Role,
    };

    await setSessionCookie(payload);

    return NextResponse.json({
      success: true,
    });

  } catch (error) {

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create session",
      },
      {
        status: 500,
      }
    );
  }
}