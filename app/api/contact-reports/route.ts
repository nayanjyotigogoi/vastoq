import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const session = await getSession()
    
    // Ensure user_id is populated from session if missing
    if (!body.user_id && session?.userId) {
      body.user_id = session.userId
    }

    const cookieStore = await cookies()
    const token = cookieStore.get('vastoq_token')?.value

    const res = await fetch(`${API_BASE}/contact-reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    })

    const text = await res.text()
    let data: any = {}
    try {
      const jsonStart = text.indexOf('{')
      data = JSON.parse(jsonStart !== -1 ? text.slice(jsonStart) : text)
    } catch {
      console.error('[contact-reports POST] Non-JSON response from backend:', text.slice(0, 300))
      return NextResponse.json(
        { success: false, message: 'Invalid response from backend server.' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    console.error('[contact-reports POST] fetch error:', err)
    return NextResponse.json(
      { success: false, message: err?.message || 'Could not reach the server. Please try again.' },
      { status: 503 }
    )
  }
}
