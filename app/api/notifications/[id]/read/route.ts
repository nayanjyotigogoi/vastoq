import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

const API = process.env.NEXT_PUBLIC_API_URL

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ success: false }, { status: 401 })

  const { id } = await params
  const res = await fetch(`${API}/notifications/${id}/read`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: session.userId }),
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
