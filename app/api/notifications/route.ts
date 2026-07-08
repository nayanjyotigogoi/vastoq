import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

const API = process.env.NEXT_PUBLIC_API_URL

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ success: false }, { status: 401 })

  const res = await fetch(`${API}/notifications?user_id=${session.userId}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
