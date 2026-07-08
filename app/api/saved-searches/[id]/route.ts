import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const res = await fetch(`${BACKEND}/saved-searches/${id}`, {
    method: 'DELETE',
  })
  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}
