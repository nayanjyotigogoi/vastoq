'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Search, SlidersHorizontal, X, Map, List, Loader2, MapPin, Navigation } from 'lucide-react'
import LocalityCarousel from './LocalityCarousel'
import { useUserLocation } from '@/hooks/useUserLocation'
import type { Listing } from './ListingCard'
import type { Listing as ApiListing } from '@/lib/types'

const RentalsMapView = dynamic(() => import('./RentalsMapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-[14px] border border-[#E5E0D5] bg-[#E8ECF8] animate-pulse shadow-vastoq-sm"
         style={{ height: 'calc(100vh - 260px)', minHeight: 420 }} />
  ),
})

// Normalise API listing → UI listing shape
function normalise(l: any): Listing {
  return {
    id: l.id,

    title: l.title,

    locality: `${l.locality}, ${l.city}`,

    rent: l.rent_per_month,

    deposit: l.deposit,

    bhk:
      l.bhk_type === '1rk'
        ? 1
        : parseInt(
            l.bhk_type.replace('bhk', '')
          ) || undefined,

    furnishing:
      l.furnishing === 'fully_furnished'
        ? 'Furnished'
        : l.furnishing === 'semi_furnished'
        ? 'Semi-furnished'
        : 'Unfurnished',

    propertyType:
      l.property_type === 'pg'
        ? 'PG'
        : l.property_type === 'room'
        ? 'Room'
        : l.property_type === 'shared_room'
        ? 'Shared Room'
        : l.property_type === 'house'
        ? 'House'
        : 'Flat',

    photos: l.photos ?? [],

    isVerified: l.owner?.is_verified ?? false,

    isPopular: l.view_count > 100,

    isBoosted: l.is_featured,

    owner: {
      name: l.owner?.name ?? 'Owner',
      verified: l.owner?.is_verified ?? false,
    },

    isLocked:    true,
    description: l.description ?? undefined,

    latitude:  l.latitude  != null ? Number(l.latitude)  : undefined,
    longitude: l.longitude != null ? Number(l.longitude) : undefined,
    bhkRaw:    l.bhk_type ?? undefined,
  }
}

const PROPERTY_TYPES = [
  'Flat',
  'PG',
  'Room',
  'Shared Room',
  'House',
]
const BHK_OPTIONS = [
  '1RK',
  '1BHK',
  '2BHK',
  '3BHK',
  '4BHK',
  '5BHK',
]
const FURNISHING_OPTIONS = ['Furnished', 'Semi-furnished', 'Unfurnished']
const SORT_OPTIONS = [
  { value: 'relevant', label: 'Most relevant' },
  { value: 'price_asc', label: 'Price: Low to high' },
  { value: 'price_desc', label: 'Price: High to low' },
  { value: 'newest', label: 'Newest' },
]


export default function RentalsClient() {
  const [locality, setLocality] = useState('')
  const [budget, setBudget] = useState<number | null>(null)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedBhk, setSelectedBhk] = useState<string[]>([])
  const [selectedFurnishing, setSelectedFurnishing] = useState<string[]>([])
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [sort, setSort] = useState('relevant')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [allListings, setAllListings] = useState<Listing[]>([])
  const [totalListings, setTotalListings] = useState(0)
  const [loading, setLoading] = useState(true)
  // Track whether location was auto-applied (so user can dismiss the pill)
  const [locationApplied, setLocationApplied] = useState(false)
  const [locationDisplay, setLocationDisplay] = useState('') // suburb-level label for the pill
  const [userLatLng, setUserLatLng] = useState<{ lat: number; lng: number } | undefined>()
  const locationInitialized = useRef(false)
  const initialFetched = useRef(false)         // true once the very first fetch fires
  const fallbackTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchParams = useSearchParams()
  const locationState = useUserLocation()

  // searchOverride lets us pass the city directly without waiting for state to update
  const fetchListings = async (searchOverride?: string) => {
    try {
      setLoading(true)

      const params = new URLSearchParams()

      const searchTerm = searchOverride !== undefined ? searchOverride : locality.trim()
      // (search is handled inside fetchWithFallback below)

      if (budget !== null) {
        params.append('max_rent', String(budget))
      }

      if (verifiedOnly) {
        params.append('verified_only', '1')
      }

      if (sort !== 'relevant') {
        params.append('sort', sort)
      }

      // Always fetch up to 500 — carousel groups all localities at once
      params.append('per_page', '500')

      if (selectedTypes.length === 1) {
        const typeMap: Record<string, string> = {
          Flat: 'flat',
          PG: 'pg',
          Room: 'room',
          'Shared Room': 'shared_room',
          House: 'house',
        }

        params.append(
          'property_type',
          typeMap[selectedTypes[0]]
        )
      }

      if (selectedFurnishing.length === 1) {
        const furnishingMap: Record<string, string> = {
          Furnished: 'fully_furnished',
          'Semi-furnished': 'semi_furnished',
          Unfurnished: 'unfurnished',
        }

        params.append(
          'furnishing',
          furnishingMap[selectedFurnishing[0]]
        )
      }

      if (selectedBhk.length === 1) {
        const bhkMap: Record<string, string> = {
          '1RK': '1rk',
          '1BHK': '1bhk',
          '2BHK': '2bhk',
          '3BHK': '3bhk',
          '4BHK': '4bhk',
          '5BHK': '5bhk',
        }

        if (bhkMap[selectedBhk[0]]) {
          params.append(
            'bhk_type',
            bhkMap[selectedBhk[0]]
          )
        }
      }

      // Progressive search: if the full term returns 0, retry with each
      // shorter prefix (word by word) until we get results.
      // e.g. "Dibrugarh West" → "Dibrugarh" → no search term
      async function fetchWithFallback(searchTerm: string): Promise<any> {
        const p = new URLSearchParams(params)
        if (searchTerm) p.set('search', searchTerm)
        else p.delete('search')
        const res  = await fetch(`/api/listings?${p.toString()}`)
        const data = await res.json()
        const total: number = data?.data?.data?.total ?? 0
        if (total > 0 || !searchTerm) return data
        // Try dropping the last word and retry
        const words = searchTerm.trim().split(/\s+/)
        if (words.length <= 1) return data           // single word, no more fallback
        return fetchWithFallback(words.slice(0, -1).join(' '))
      }

      const json = await fetchWithFallback(searchTerm)

      setTotalListings(
        json?.data?.data?.total ?? 0
      )

      const items: ApiListing[] =
        json?.data?.data?.data ?? []


      // console.log('LISTINGS RESPONSE', json)
      // console.log('ITEMS', items)


      setAllListings(
        items.map(normalise)
      )
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // ── Effect 1: apply URL search params on mount ──────────────────────────────
  useEffect(() => {
    const search      = searchParams.get('search')
    const maxRent     = searchParams.get('max_rent')
    const propertyType = searchParams.get('property_type')
    if (search)      setLocality(search)
    if (maxRent)     setBudget(Number(maxRent))
    if (propertyType) {
      const map: Record<string, string> = { flat:'Flat', pg:'PG', room:'Room', shared_room:'Shared Room', house:'House' }
      if (map[propertyType]) setSelectedTypes([map[propertyType]])
    }
  }, [searchParams])

  // ── Effect 2: location resolves → first fetch ────────────────────────────────
  // We never fire the initial fetch until we know the user's location (or it fails).
  // If the URL already has ?search= we skip location and fetch straight away.
  useEffect(() => {
    if (locationInitialized.current) return

    const urlSearch = searchParams.get('search')

    // URL has an explicit search → fetch immediately, don't wait for location
    if (urlSearch) {
      locationInitialized.current = true
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current)
      if (!initialFetched.current) {
        initialFetched.current = true
        fetchListings(urlSearch)
      }
      return
    }

    if (locationState.status === 'requesting' || locationState.status === 'idle') return

    // Location resolved (ready / denied / error)
    locationInitialized.current = true
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current)

    if (locationState.status === 'ready') {
      const { city, displayName, lat, lng } = locationState.location
      setLocality(city)
      setLocationDisplay(displayName)
      setLocationApplied(true)
      setUserLatLng({ lat, lng })
      initialFetched.current = true
      fetchListings(city)   // pass city directly — state update is async
    } else {
      // denied / error — load everything
      initialFetched.current = true
      fetchListings('')
    }
  }, [locationState.status, searchParams])

  // ── Effect 3: 5-second hard timeout ─────────────────────────────────────────
  // If location permission dialog is ignored or browser is slow, don't leave the
  // page blank forever — load all listings as fallback.
  useEffect(() => {
    if (searchParams.get('search')) return   // URL search → no need for timer
    fallbackTimer.current = setTimeout(() => {
      if (!initialFetched.current) {
        initialFetched.current = true
        locationInitialized.current = true
        fetchListings('')
      }
    }, 5000)
    return () => { if (fallbackTimer.current) clearTimeout(fallbackTimer.current) }
  }, [])

  // ── Effect 4: debounced re-fetch when filters change ────────────────────────
  // Only fires after the initial fetch has already happened.
  useEffect(() => {
    if (!initialFetched.current) return
    const timeout = setTimeout(() => fetchListings(), 800)
    return () => clearTimeout(timeout)
  }, [
    locality,
    budget,
    selectedTypes,
    selectedBhk,
    selectedFurnishing,
    verifiedOnly,
    sort,
    viewMode,
  ])

  const filtered = allListings

  // Group by locality name (part before first comma), sorted by count desc
  const localityGroups: Array<[string, Listing[]]> = (() => {
    const rec: Record<string, Listing[]> = {}
    for (const l of filtered) {
      const key = l.locality.split(',')[0].trim()
      if (rec[key]) rec[key].push(l)
      else rec[key] = [l]
    }
    return Object.entries(rec).sort((a, b) => b[1].length - a[1].length)
  })()

  const toggleFilter = <T,>(arr: T[], val: T, set: (a: T[]) => void) =>
    set(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val])

  const activeFilterCount =
  selectedTypes.length +
  selectedBhk.length +
  selectedFurnishing.length +
  (verifiedOnly ? 1 : 0) +
  (budget !== null ? 1 : 0)

  

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 flex-wrap mb-1">
          <h1 className="text-[28px] font-bold text-[#1A1814]">
            {locality.trim() ? `Properties in ${locality}` : 'Rental Properties'}
          </h1>

          {/* Location requesting spinner */}
          {locationState.status === 'requesting' && !locality && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8ECF8] text-[#1B2B6B] text-[12px] font-semibold">
              <Navigation size={12} className="animate-pulse" />
              Detecting location…
            </span>
          )}

          {/* "Near [City]" pill — shown when location was auto-applied */}
          {locationApplied && locality && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E1F5EE] text-[#1D9E75] text-[12px] font-semibold border border-[#1D9E75]/20">
              <MapPin size={11} />
              Near {locationDisplay || locality}
              <button
                onClick={() => { setLocality(''); setLocationDisplay(''); setLocationApplied(false) }}
                aria-label="Clear location"
                className="ml-0.5 hover:text-[#D84040] transition-colors"
              >
                <X size={11} />
              </button>
            </span>
          )}
        </div>

        <p className="text-[14px] text-[#4A4640]">
          {loading ? 'Loading…' : `${totalListings} listings found`}
        </p>
      </div>

      {/* Search + Sort bar */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-white border border-[#E5E0D5] rounded-[10px] px-3 py-2.5 shadow-vastoq-sm">
          <Search size={15} className="text-[#8A8480] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search city, locality or area..."
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
            className="flex-1 bg-transparent text-[14px] text-[#1A1814] placeholder:text-[#8A8480] focus:outline-none"
            aria-label="Search city, locality or area..."
          />
          {locality && (
            <button onClick={() => setLocality('')} aria-label="Clear search">
              <X size={14} className="text-[#8A8480]" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-[10px] border text-[14px] font-medium transition-colors min-h-[44px] ${
            showFilters || activeFilterCount > 0
              ? 'border-[#1B2B6B] bg-[#E8ECF8] text-[#1B2B6B]'
              : 'border-[#E5E0D5] bg-white text-[#4A4640]'
          }`}
          aria-expanded={showFilters}
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#1B2B6B] text-white text-[11px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-white border border-[#E5E0D5] rounded-[10px] px-3 py-2.5 text-[14px] text-[#1A1814] focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30 min-h-[44px] shadow-vastoq-sm"
          aria-label="Sort listings"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <div className="flex rounded-[10px] border border-[#E5E0D5] overflow-hidden shadow-vastoq-sm">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2.5 flex items-center gap-1.5 text-[13px] font-medium transition-colors ${viewMode === 'list' ? 'bg-[#1B2B6B] text-white' : 'bg-white text-[#4A4640] hover:bg-[#F5F0E8]'}`}
            aria-pressed={viewMode === 'list' ? 'true' : 'false'}
          >
            <List size={14} /> List
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-2.5 flex items-center gap-1.5 text-[13px] font-medium transition-colors ${viewMode === 'map' ? 'bg-[#1B2B6B] text-white' : 'bg-white text-[#4A4640] hover:bg-[#F5F0E8]'}`}
            aria-pressed={viewMode === 'map' ? 'true' : 'false'}
          >
            <Map size={14} /> Map
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border border-[#E5E0D5] rounded-[14px] p-5 mb-6 shadow-vastoq-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Property type */}
            <div>
              <p className="label-uppercase text-[#8A8480] mb-3">Property type</p>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleFilter(selectedTypes, t, setSelectedTypes)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${
                      selectedTypes.includes(t)
                        ? 'bg-[#1B2B6B] text-white border-[#1B2B6B]'
                        : 'bg-white text-[#4A4640] border-[#E5E0D5] hover:border-[#1B2B6B]'
                    }`}
                    aria-pressed={selectedTypes.includes(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* BHK */}
            <div>
              <p className="label-uppercase text-[#8A8480] mb-3">BHK</p>
              <div className="flex flex-wrap gap-2">
                {BHK_OPTIONS.map((b) => (
                  <button
                    key={b}
                    onClick={() => toggleFilter(selectedBhk, b, setSelectedBhk)}
                    className={`px-3 h-9 rounded-full text-[12px] font-semibold border transition-colors ${
                      selectedBhk.includes(b)
                        ? 'bg-[#1B2B6B] text-white border-[#1B2B6B]'
                        : 'bg-white text-[#4A4640] border-[#E5E0D5] hover:border-[#1B2B6B]'
                    }`}
                    aria-pressed={selectedBhk.includes(b)}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Furnishing */}
            <div>
              <p className="label-uppercase text-[#8A8480] mb-3">Furnishing</p>
              <div className="flex flex-wrap gap-2">
                {FURNISHING_OPTIONS.map((f) => (
                  <button
                    key={f}
                    onClick={() => toggleFilter(selectedFurnishing, f, setSelectedFurnishing)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${
                      selectedFurnishing.includes(f)
                        ? 'bg-[#1B2B6B] text-white border-[#1B2B6B]'
                        : 'bg-white text-[#4A4640] border-[#E5E0D5] hover:border-[#1B2B6B]'
                    }`}
                    aria-pressed={selectedFurnishing.includes(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Owner type */}
            <div>
              <p className="label-uppercase text-[#8A8480] mb-3">Owner type</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#1B2B6B]"
                />
                <span className="text-[13px] text-[#1A1814] font-medium">Verified only</span>
              </label>

              {/* Budget */}
              <div className="mt-4">
                <p className="text-[12px] text-[#4A4640] mb-2">
                  Max budget:
                  <span className="font-bold text-[#1B2B6B]">
                    {budget === null
                      ? ' Any'
                      : ` ₹${budget.toLocaleString('en-IN')}/mo`}
                  </span>
                </p>
                <input
                  type="range"
                  min={2000}
                  max={50000}
                  step={500}
                  value={budget ?? 50000}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-[#1B2B6B]"
                  aria-label="Max budget"
                />
                <div className="flex justify-between text-[11px] text-[#8A8480] mt-0.5">
                  <span>₹2,000</span><span>₹50,000</span>
                </div>
              </div>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="mt-4 pt-4 border-t border-[#F5F0E8] flex justify-end">
              <button
                onClick={() => {
                  setSelectedTypes([])
                  setSelectedBhk([])
                  setSelectedFurnishing([])
                  setVerifiedOnly(false)
                  setBudget(null)
                  setLocality('')
                }}
                className="text-[13px] font-semibold text-[#D84040] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Map view */}
      {viewMode === 'map' && (
        <div className="mb-8">
          {loading ? (
            <div
              className="w-full rounded-[14px] border border-[#E5E0D5] bg-[#E8ECF8] animate-pulse shadow-vastoq-sm flex items-center justify-center"
              style={{ height: 'calc(100vh - 260px)', minHeight: 420 }}
            >
              <Loader2 size={28} className="animate-spin text-[#1B2B6B]" />
            </div>
          ) : (
            <RentalsMapView listings={filtered} userLocation={userLatLng} />
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#1B2B6B]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-[18px] bg-[#E8ECF8] flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-[#1B2B6B]" />
          </div>
          <h3 className="text-[18px] font-bold text-[#1A1814] mb-2">No listings found</h3>
          <p className="text-[13px] text-[#4A4640] mb-4">Try adjusting your filters or search a different locality.</p>
          <button
            onClick={() => { setSelectedTypes([]); setSelectedBhk([]); setSelectedFurnishing([]); setVerifiedOnly(false); setBudget(null); setLocality('') }}
            className="px-5 py-2.5 bg-[#1B2B6B] text-white text-[14px] font-semibold rounded-[10px] hover:bg-[#2D3E8C] transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div>
          {localityGroups.map(([loc, listings]) => (
            <LocalityCarousel key={loc} locality={loc} listings={listings} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
