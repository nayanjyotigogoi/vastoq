import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

const API = process.env.NEXT_PUBLIC_API_URL

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ success: false }, { status: 401 })

  const res = await fetch(`${API}/notifications/read-all`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: session.userId }),
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
