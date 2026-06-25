import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export interface WorkerFilters {
  search?         : string
  category?       : string
  city?           : string
  available_today?: boolean | string
  verified_only?  : boolean | string
  page?           : number
  per_page?       : number
  limit?          : number  // alias used by admin panel
}

export async function listWorkers(filters: WorkerFilters = {}) {
  const params: Record<string, any> = { ...filters }
  if (params.limit && !params.per_page) {
    params.per_page = params.limit
    delete params.limit
  }
  const res = await axios.get(`${API_URL}/workers`, { params })
  return res.data
}

export async function getWorker(id: string) {
  const res = await axios.get(`${API_URL}/workers/${id}`)
  return res.data
}

export async function createWorkerProfile(token: string, payload: Record<string, any>) {
  const res = await axios.post(`${API_URL}/worker/profile`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function updateWorkerProfile(token: string, payload: Record<string, any>) {
  const res = await axios.put(`${API_URL}/worker/profile`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function adminUpdateWorker(token: string, id: string, action: string) {
  const res = await axios.patch(
    `${API_URL}/workers/${id}`,
    { action },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return res.data
}

export async function getWorkerProfile(token: string, userId: string) {
  const res = await axios.get(`${API_URL}/worker/profile`, {
    params: { user_id: userId },
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}


// Stubs kept for compatibility with other routes
export function unlockWorker(..._args: any[]): any { return { error: 'Use backend unlock endpoint', code: 'NOT_IMPLEMENTED' } }
export function recalculateWorkerRating(_workerId: string) { /* no-op — backend handles this */ }
