import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

const API = process.env.NEXT_PUBLIC_API_URL

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ success: false }, { status: 401 })

  try {
    const res = await fetch(`${API}/notifications?user_id=${session.userId}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
    if (res.ok) {
      const data = await res.json()
      return NextResponse.json(data)
    }
  } catch (err) {}

  // Return fallback empty notifications instead of propagating 404/500 errors
  return NextResponse.json({
    success: true,
    data: {
      notifications: [],
      unread_count: 0
    }
  })
}
