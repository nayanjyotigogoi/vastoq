import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T) {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function error(message: string, status = 400, code?: string) {
  return NextResponse.json(
    { success: false, error: { message, ...(code ? { code } : {}) } },
    { status }
  );
}

export function paginated<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
) {
  return NextResponse.json({
    success: true,
    data: items,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}
