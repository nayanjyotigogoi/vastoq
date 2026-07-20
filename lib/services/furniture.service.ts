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

  const params = new URLSearchParams()
  if (category) {
    params.set('category', category)
  }
  params.set('is_available', '1')
  params.set('per_page', '100')

  url += `?${params.toString()}`

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

  return json?.data?.data ?? json?.data ?? []
}

export function formatCategoryName(catKey: string): string {
  const customMap: Record<string, string> = {
    bed: 'Beds',
    sofa: 'Sofas',
    refrigerator: 'Refrigerators',
    washing_machine: 'Washing Machines',
    dining_table: 'Dining Tables',
    study_table: 'Study Tables',
    television: 'Televisions',
    tv: 'Televisions',
    chair: 'Chairs',
    wardrobe: 'Wardrobes',
    mattress: 'Mattresses',
    air_conditioner: 'Air Conditioners',
  }

  if (customMap[catKey.toLowerCase()]) {
    return customMap[catKey.toLowerCase()]
  }

  return catKey
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
}

export interface DynamicCategorySummary {
  id: string
  name: string
  startingPrice: number
  itemCount: number
  image: string
  sampleItemName: string
}

export async function getDynamicCategorySummaries(): Promise<{
  categories: DynamicCategorySummary[]
  overallMinPrice: number
}> {
  try {
    const items = await getFurnitureItems()
    const availableItems = items.filter((item) => item.is_available)

    if (availableItems.length === 0) {
      return { categories: [], overallMinPrice: 0 }
    }

    const categoryMap = new Map<string, FurnitureItem[]>()

    for (const item of availableItems) {
      const cat = item.category || 'other'
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, [])
      }
      categoryMap.get(cat)!.push(item)
    }

    const categories: DynamicCategorySummary[] = []
    let overallMinPrice = Infinity

    categoryMap.forEach((catItems, catKey) => {
      const prices = catItems
        .map((i) => Number(i.price_per_month))
        .filter((p) => !isNaN(p) && p > 0)

      const minPrice = prices.length > 0 ? Math.min(...prices) : 0

      if (minPrice > 0 && minPrice < overallMinPrice) {
        overallMinPrice = minPrice
      }

      const firstImageItem = catItems.find((i) => i.image_url)
      const sampleImage =
        firstImageItem?.image_url ||
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80'

      categories.push({
        id: catKey,
        name: formatCategoryName(catKey),
        startingPrice: minPrice,
        itemCount: catItems.length,
        image: sampleImage,
        sampleItemName: catItems[0]?.name || '',
      })
    })

    // Sort categories by starting price ascending (lowest price first)
    categories.sort((a, b) => a.startingPrice - b.startingPrice)

    return {
      categories,
      overallMinPrice: overallMinPrice === Infinity ? 0 : overallMinPrice,
    }
  } catch (error) {
    console.error('Error fetching dynamic category summaries:', error)
    return { categories: [], overallMinPrice: 0 }
  }
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