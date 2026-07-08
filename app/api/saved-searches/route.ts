import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('user_id')
  const res = await fetch(`${BACKEND}/saved-searches?user_id=${userId}`)
  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const res = await fetch(`${BACKEND}/saved-searches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}
