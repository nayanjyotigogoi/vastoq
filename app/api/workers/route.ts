import { NextRequest, NextResponse } from 'next/server'
import { ok, error } from '@/lib/api/response'
import { requireAuth } from '@/lib/auth'
import { listWorkers, createWorkerProfile } from '@/lib/services/workers.service'

// GET /api/workers — public list, proxied to backend
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const filters = {
      search         : sp.get('search')          || undefined,
      category       : sp.get('category')        || undefined,
      city           : sp.get('city')             || undefined,
      available_today: sp.get('available_today')  || undefined,
      verified_only  : sp.get('verified_only')    || undefined,
      page    : sp.get('page')     ? Number(sp.get('page'))     : undefined,
      per_page: sp.get('per_page') ? Number(sp.get('per_page')) : undefined,
      limit   : sp.get('limit')    ? Number(sp.get('limit'))    : undefined,
    }
    const data = await listWorkers(filters)
    return ok(data)
  } catch (e: any) {
    return error(e?.response?.data?.message ?? e?.message ?? 'Failed to fetch workers', 500)
  }
}

// POST /api/workers — register a worker profile (must be logged in)
export async function POST(req: NextRequest) {
  const guard = await requireAuth(req)
  if (guard instanceof NextResponse) return guard

  try {
    const body = await req.json()
    const token = req.cookies.get('token')?.value ?? ''
    const data  = await createWorkerProfile(token, { ...body, user_id: guard.session.userId })
    return ok(data, 201)
  } catch (e: any) {
    return error(e?.response?.data?.error?.message ?? e?.message ?? 'Failed to create profile', 400)
  }
}
