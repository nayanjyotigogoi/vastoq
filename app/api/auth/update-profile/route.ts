import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, refreshSession } from '@/lib/auth'
import { ok, error } from '@/lib/api/response'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function POST(req: NextRequest) {
  const guard = await requireAuth(req)

  if (guard instanceof NextResponse) {
    return guard
  }

  try {
    const body = await req.json()

    const response = await fetch(
      `${API_URL}/auth/update-profile`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          user_id: guard.session.userId,
          name: body.name,
          email: body.email,
          phone: body.phone,
        }),
      }
    )

    const json = await response.json()

    if (!response.ok) {
      return error(
        json.error?.message ?? 'Failed to update profile',
        response.status
      )
    }

    const updatedUser = json.data.user

    // Keep the local session cookie synchronized with updated user data
    await refreshSession({
      name: updatedUser.name,
      phone: updatedUser.phone ?? '',
    })

    return ok(updatedUser)

  } catch (err) {

    return error(
      'Unable to connect to backend',
      500
    )

  }
}