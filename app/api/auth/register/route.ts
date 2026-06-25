import { NextRequest } from 'next/server'
import { ok, error } from '@/lib/api/response'
import { setSessionCookie } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL

/** Turn Laravel's validation errors object into one readable sentence. */
function extractLaravelError(json: any): string {
  // Laravel validation: { message: "...", errors: { field: ["msg", ...] } }
  if (json?.errors && typeof json.errors === 'object') {
    const fieldErrors: string[] = Object.values(json.errors).flat() as string[]
    if (fieldErrors.length > 0) return fieldErrors.join(' ')
  }
  // Custom error shape: { error: { message: "..." } }
  if (json?.error?.message) return json.error.message
  // Laravel simple message
  if (json?.message) return json.message
  return 'Registration failed. Please try again.'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const res  = await fetch(`${API_URL}/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body:    JSON.stringify(body),
    })

    const json = await res.json()

    if (!res.ok) {
      return error(extractLaravelError(json), res.status)
    }

    const user = json.data.user

    await setSessionCookie({
      userId: String(user.id),
      phone:  user.phone,
      name:   user.name,
      role:   user.role,
    })

    return ok({ user, redirect_to: json.data.redirect_to })
  } catch {
    return error('Unable to connect to server. Please try again.', 500)
  }
}
