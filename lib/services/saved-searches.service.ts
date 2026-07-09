const API_URL = process.env.NEXT_PUBLIC_API_URL

export interface SavedSearchFilters {
  city?: string
  listing_class?: string
  property_type?: string
  bhk_type?: string
  furnishing?: string
  max_rent?: number
  min_rent?: number
}

export interface SavedSearch {
  id: number
  name: string
  filters: SavedSearchFilters
  created_at: string
}

export async function listSavedSearches(userId: string): Promise<SavedSearch[]> {
  const res = await fetch(`${API_URL}/saved-searches?user_id=${userId}`)
  const json = await res.json()
  return json.data ?? []
}

export async function createSavedSearch(
  userId: string,
  name: string,
  filters: SavedSearchFilters
): Promise<SavedSearch> {
  const res = await fetch(`${API_URL}/saved-searches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, name, filters }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error?.message ?? 'Failed to save search')
  return json.data
}

export async function deleteSavedSearch(id: number): Promise<void> {
  await fetch(`${API_URL}/saved-searches/${id}`, { method: 'DELETE' })
}
