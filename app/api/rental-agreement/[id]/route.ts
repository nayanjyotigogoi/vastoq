import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const res = await fetch(`${BACKEND}/rental-agreement/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    return NextResponse.json(json, { status: res.status })
  }

  const pdfBuffer = await res.arrayBuffer()
  const filename = res.headers.get('Content-Disposition') ?? 'attachment; filename="agreement.pdf"'

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': filename,
    },
  })
}
