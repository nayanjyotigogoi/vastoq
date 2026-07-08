import { NextRequest, NextResponse } from 'next/server'
import { ok, error } from '@/lib/api/response'

const API = process.env.NEXT_PUBLIC_API_URL

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id }   = await params
  const body     = await req.json().catch(() => ({}))

  try {
    const res  = await fetch(`${API}/listings/${id}/enquire`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body:    JSON.stringify(body),
    })
    const json = await res.json()
    if (!res.ok) return error(json?.message ?? 'Failed to submit enquiry', res.status)
    return ok(json.data)
  } catch {
    return error('Could not reach backend', 500)
  }
}
