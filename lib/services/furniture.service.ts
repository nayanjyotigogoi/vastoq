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