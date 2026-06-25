import { NextRequest, NextResponse } from 'next/server'
import { ok, error } from '@/lib/api/response'
import { requireAuth } from '@/lib/auth'
import { getWorker, updateWorkerProfile } from '@/lib/services/workers.service'

// GET /api/workers/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await getWorker(id)
    return ok(data)
  } catch (e: any) {
    const status = e?.response?.status === 404 ? 404 : 500
    return error(e?.response?.data?.message ?? e?.message ?? 'Worker not found', status)
  }
}

// PATCH /api/workers/:id — worker updates their own profile
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAuth(req)
  if (guard instanceof NextResponse) return guard

  try {
    const { id } = await params
    const body  = await req.json()
    const token = req.cookies.get('token')?.value ?? ''
    const data  = await updateWorkerProfile(token, { ...body, user_id: guard.session.userId })
    return ok(data)
  } catch (e: any) {
    return error(e?.response?.data?.error?.message ?? e?.message ?? 'Failed to update profile', 400)
  }
}
