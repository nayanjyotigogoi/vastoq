import { NextRequest } from 'next/server'
import { ok, error } from '@/lib/api/response'

const API_URL = process.env.NEXT_PUBLIC_API_URL

/** Turn Laravel's validation errors into a readable string. */
function extractLaravelError(json: any): string {
  if (json?.errors && typeof json.errors === 'object') {
    const msgs: string[] = Object.values(json.errors).flat() as string[]
    if (msgs.length > 0) return msgs.join(' ')
  }
  if (json?.error?.message) return json.error.message
  if (json?.message) return json.message
  return 'Failed to send OTP. Please try again.'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const res  = await fetch(`${API_URL}/auth/send-email-otp`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body:    JSON.stringify(body),
    })

    const json = await res.json()

    if (!res.ok) {
      return error(extractLaravelError(json), res.status)
    }

    return ok({ message: json.message })
  } catch {
    return error('Unable to connect to server. Please try again.', 500)
  }
}
