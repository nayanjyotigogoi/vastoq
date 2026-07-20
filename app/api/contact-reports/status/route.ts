import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const cookieStore = await cookies()
    const token = cookieStore.get('vastoq_token')?.value

    const qs = searchParams.toString()
    const res = await fetch(`${API_BASE}/contact-reports/status?${qs}`, {
      headers: {
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    const text = await res.text()
    let data: any = { success: true, data: { reported: false } }
    try {
      const jsonStart = text.indexOf('{')
      if (jsonStart !== -1) {
        data = JSON.parse(text.slice(jsonStart))
      }
    } catch {
      /* fallback */
    }

    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    console.error('[contact-reports/status GET] fetch error:', err)
    return NextResponse.json({ success: true, data: { reported: false } })
  }
}
