export interface FurnitureItem {
  id: number
  name: string
  category: string
  description: string | null
  price_per_month: number
  image_url: string | null
  is_available: boolean
  created_at?: string
  updated_at?: string
}

export interface FurnitureEnquiryPayload {
  furniture_id: number
  name: string
  phone: string
  locality: string
  message?: string | null
}

export async function getFurnitureItems(
  category?: string
): Promise<FurnitureItem[]> {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/furniture`

  if (category) {
    url += `?category=${encodeURIComponent(category)}`
  }

  const res = await fetch(url, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error('Failed to fetch furniture')
  }

  const json = await res.json()

  return json?.data?.data ?? []
}

export async function getFurnitureItem(
  id: number | string
): Promise<FurnitureItem> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/furniture/${id}`,
    {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    }
  )

  if (!res.ok) {
    throw new Error('Failed to fetch furniture item')
  }

  const json = await res.json()

  return json.data
}

export const listFurnitureItems = getFurnitureItems;

export interface FurnitureEnquiry {
  id: string
  userId: string
  furnitureId: number
  name: string
  phone: string
  locality: string
  message?: string | null
  status: 'open' | 'contacted' | 'converted' | 'cancelled'
  adminNotes?: string | null
  createdAt: string
}

const _enquiries: FurnitureEnquiry[] = [];

export function createEnquiry(userId: string, payload: FurnitureEnquiryPayload): FurnitureEnquiry {
  const enquiry: FurnitureEnquiry = {
    id: Math.random().toString(36).slice(2),
    userId,
    furnitureId: payload.furniture_id,
    name: payload.name,
    phone: payload.phone,
    locality: payload.locality,
    message: payload.message ?? null,
    status: 'open',
    adminNotes: null,
    createdAt: new Date().toISOString(),
  };
  _enquiries.push(enquiry);
  return enquiry;
}

export function getUserEnquiries(userId: string): FurnitureEnquiry[] {
  return _enquiries.filter((e) => e.userId === userId);
}

export function listAllEnquiries(): FurnitureEnquiry[] {
  return [..._enquiries].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function updateEnquiryStatus(
  id: string,
  status: FurnitureEnquiry['status'],
  adminNotes?: string
): FurnitureEnquiry | null {
  const enquiry = _enquiries.find((e) => e.id === id);
  if (!enquiry) return null;
  enquiry.status = status;
  if (adminNotes !== undefined) enquiry.adminNotes = adminNotes;
  return enquiry;
}

export async function createFurnitureEnquiry(
  payload: FurnitureEnquiryPayload
) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/furniture-enquiries`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    }
  )

  const json = await res.json()

  if (!res.ok) {
    throw new Error(
      json.message || 'Failed to submit enquiry'
    )
  }

  return json
}