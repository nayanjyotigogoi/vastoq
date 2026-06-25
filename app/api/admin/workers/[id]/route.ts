import { NextRequest, NextResponse } from 'next/server'
import { ok, error } from '@/lib/api/response'
import { requireRole } from '@/lib/auth'
import { adminUpdateWorker } from '@/lib/services/workers.service'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(req, 'admin')
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const body   = await req.json().catch(() => ({}))

  if (!body.action) return error('action is required', 422)

  try {
    const token = req.cookies.get('token')?.value ?? ''
    const data  = await adminUpdateWorker(token, id, body.action)
    return ok(data)
  } catch (e: any) {
    return error(e?.response?.data?.message ?? e?.message ?? 'Failed to update worker', 500)
  }
}
