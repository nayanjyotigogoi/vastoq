import { NextRequest, NextResponse } from 'next/server'
import { ok, error } from '@/lib/api/response'
import { requireAuth } from '@/lib/auth'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL

// GET /api/workers/:id/unlock — check if current user already unlocked this worker
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAuth(req)
  if (guard instanceof NextResponse) return guard

  const { id } = await params
  try {
    const res = await axios.get(`${API_URL}/workers/${id}/unlock-status`, {
      params: { user_id: guard.session.userId },
    })
    return ok(res.data?.data ?? { unlocked: false })
  } catch (e: any) {
    return ok({ unlocked: false })
  }
}

// POST /api/workers/:id/unlock
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAuth(req)
  if (guard instanceof NextResponse) return guard

  const { id }      = await params
  const body        = await req.json().catch(() => ({}))
  const token       = req.cookies.get('token')?.value ?? ''
  const couponCode  = body.coupon_code ?? null

  try {
    const res = await axios.post(
      `${API_URL}/workers/${id}/unlock`,
      { user_id: guard.session.userId, coupon_code: couponCode },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    // Return phone + service_areas so the UI can reveal them immediately
    return ok(res.data?.data ?? {})
  } catch (e: any) {
    const status  = e?.response?.status ?? 500
    const message = e?.response?.data?.message ?? e?.message ?? 'Unlock failed.'
    return error(message, status)
  }
}
