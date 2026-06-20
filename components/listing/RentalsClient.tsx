'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, MapPin, X, Map, List, Loader2 } from 'lucide-react'
import ListingCard from './ListingCard'
import type { Listing } from './ListingCard'
import type { Listing as ApiListing } from '@/lib/types'

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

    isLocked: true,
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

// Group listings by locality
function groupByLocality(listings: Listing[]) {
  const groups: Record<string, Listing[]> = {}
  for (const l of listings) {
    const loc = l.locality.split(',')[0].trim()
    if (!groups[loc]) groups[loc] = []
    groups[loc].push(l)
  }
  return groups
}

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
  const searchParams = useSearchParams()

    const fetchListings = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()

      if (locality.trim()) {
        params.append('search', locality)
      }

      if (budget !== null) {
        params.append('max_rent', String(budget))
      }

      if (verifiedOnly) {
        params.append('verified_only', '1')
      }

      if (sort !== 'relevant') {
        params.append('sort', sort)
      }

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

      const response = await fetch(
        `/api/listings?${params.toString()}`
      )

      const json = await response.json()

      

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

  useEffect(() => {
  const search = searchParams.get('search')
  const maxRent = searchParams.get('max_rent')
  const propertyType = searchParams.get('property_type')

  if (search) {
    setLocality(search)
  }

  if (maxRent) {
    setBudget(Number(maxRent))
  }

  if (propertyType) {
    const reverseTypeMap: Record<string, string> = {
      flat: 'Flat',
      pg: 'PG',
      room: 'Room',
      shared_room: 'Shared Room',
      house: 'House',
    }

    if (reverseTypeMap[propertyType]) {
      setSelectedTypes([
        reverseTypeMap[propertyType]
      ])
    }
  }
  }, [searchParams])

  useEffect(() => {
    fetchListings()
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchListings()
    }, 1000)

    return () => clearTimeout(timeout)
  }, [
    locality,
    budget,
    selectedTypes,
    selectedBhk,
    selectedFurnishing,
    verifiedOnly,
    sort,
  ])

  const filtered = allListings

  const groups = groupByLocality(filtered)

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
        <h1 className="text-[28px] font-bold text-[#1A1814] mb-1">
          {locality.trim()
            ? `Properties in ${locality}`
            : 'Rental Properties'}
        </h1>
       <p className="text-[14px] text-[#4A4640]">
        {totalListings} listings found
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

      {/* Map view placeholder */}
      {viewMode === 'map' && (
        <div className="w-full h-96 rounded-[14px] border border-[#E5E0D5] bg-[#E8ECF8] flex items-center justify-center mb-8 shadow-vastoq-sm">
          <div className="text-center">
            <MapPin size={32} className="text-[#1B2B6B] mx-auto mb-2" />
            <p className="text-[14px] font-semibold text-[#1B2B6B]">Map view</p>
            <p className="text-[12px] text-[#4A4640]">Google Maps integration coming soon</p>
            <p className="text-[11px] text-[#8A8480] mt-1">Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable</p>
          </div>
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
      ) : (
        <div className="space-y-8">
          {Object.entries(groups).map(([loc, items]) => (
            <div key={loc}>
              {/* Locality stamp */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-[#E5E0D5]" aria-hidden="true" />
                <div className="flex items-center gap-2 text-[12px] font-bold text-[#4A4640] uppercase tracking-wider">
                  <MapPin size={12} className="text-[#8A8480]" />
                  {loc.toUpperCase()}
                  <span className="text-[#8A8480] font-normal normal-case tracking-normal">
                    · {items.length} listing{items.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="h-px flex-1 bg-[#E5E0D5]" aria-hidden="true" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
