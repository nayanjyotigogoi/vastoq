'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowRight, Loader2, MapPin, Navigation } from 'lucide-react'
import { useUserLocation } from '@/hooks/useUserLocation'
import type { Listing } from '@/components/listing/ListingCard'

// Haversine distance in km between two lat/lng points
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function filterNearby(listings: Listing[], lat: number, lng: number): Listing[] {
  const withCoords = listings.filter((l) => l.latitude != null && l.longitude != null)
  // Try 15 km, then 30 km, then all with coords, then all
  for (const radius of [15, 30]) {
    const nearby = withCoords.filter(
      (l) => haversineKm(lat, lng, l.latitude!, l.longitude!) <= radius
    )
    if (nearby.length >= 3) return nearby
  }
  return withCoords.length > 0 ? withCoords : listings
}

const RentalsMapView = dynamic(() => import('@/components/listing/RentalsMapView'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full rounded-[18px] bg-[#E8ECF8] animate-pulse border border-[#E5E0D5]"
      style={{ height: 500 }}
    />
  ),
})

function normalise(l: any): Listing {
  return {
    id:       l.id,
    title:    l.title,
    locality: `${l.locality}, ${l.city}`,
    rent:     l.rent_per_month,
    deposit:  l.deposit,
    bhk:
      l.bhk_type === '1rk'
        ? 1
        : parseInt(l.bhk_type?.replace('bhk', '') ?? '') || undefined,
    furnishing:
      l.furnishing === 'fully_furnished' ? 'Furnished'
      : l.furnishing === 'semi_furnished' ? 'Semi-furnished'
      : 'Unfurnished',
    propertyType:
      l.property_type === 'pg'            ? 'PG'
      : l.property_type === 'room'        ? 'Room'
      : l.property_type === 'shared_room' ? 'Shared Room'
      : l.property_type === 'house'       ? 'House'
      : 'Flat',
    photos:     l.photos ?? [],
    isVerified: l.owner?.is_verified ?? false,
    isPopular:  (l.view_count ?? 0) > 100,
    isBoosted:  l.is_featured ?? false,
    owner: { name: l.owner?.name ?? 'Owner', verified: l.owner?.is_verified ?? false },
    isLocked:  true,
    latitude:  l.latitude  != null ? Number(l.latitude)  : undefined,
    longitude: l.longitude != null ? Number(l.longitude) : undefined,
    bhkRaw:    l.bhk_type ?? undefined,
  }
}

const BHK_FILTERS = [
  { label: 'All types', value: null,   color: null },
  { label: '1RK',       value: '1rk',  color: '#F59E0B' },
  { label: '1BHK',      value: '1bhk', color: '#EC4899' },
  { label: '2BHK',      value: '2bhk', color: '#8B5CF6' },
  { label: '3BHK',      value: '3bhk', color: '#10B981' },
  { label: 'PG',        value: 'pg',   color: '#06B6D4' },
  { label: 'House',     value: 'house',color: '#84CC16' },
]

export default function HomeMapSection() {
  const [rawListings,  setRawListings]  = useState<Listing[]>([])
  const [allListings,  setAllListings]  = useState<Listing[]>([])
  const [loading,      setLoading]      = useState(true)
  const [activeBhk,   setActiveBhk]    = useState<string | null>(null)
  const [nearCity,     setNearCity]     = useState<string | null>(null) // display label
  const [searchCity,   setSearchCity]   = useState<string | null>(null) // API search term
  const [userLatLng,   setUserLatLng]   = useState<{ lat: number; lng: number } | undefined>()
  const locationState = useUserLocation()
  const fetched = useRef(false)

  // Fetch all listings once
  useEffect(() => {
    if (fetched.current) return
    fetched.current = true
    fetch('/api/listings?per_page=500')
      .then((r) => r.json())
      .then((json) => {
        const items = json?.data?.data?.data ?? []
        setRawListings(items.map(normalise))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // When location resolves, proximity-filter the listings
  useEffect(() => {
    if (locationState.status === 'requesting' || locationState.status === 'idle') return
    if (locationState.status === 'ready') {
      const { lat, lng, city, displayName } = locationState.location
      setNearCity(displayName)   // UI label e.g. "Dibrugarh West"
      setSearchCity(city)        // API search term e.g. "Dibrugarh"
      setUserLatLng({ lat, lng })
      if (rawListings.length > 0) {
        setAllListings(filterNearby(rawListings, lat, lng))
      }
    } else {
      // denied / error — show everything
      setAllListings(rawListings)
    }
  }, [locationState.status, rawListings])

  // Also apply proximity filter once raw listings arrive (if location already ready)
  useEffect(() => {
    if (rawListings.length === 0) return
    if (locationState.status === 'ready') {
      const { lat, lng, city, displayName } = locationState.location
      if (!nearCity) { setNearCity(displayName); setSearchCity(city) }
      setAllListings(filterNearby(rawListings, lat, lng))
    } else if (locationState.status !== 'requesting' && locationState.status !== 'idle') {
      setAllListings(rawListings)
    }
  }, [rawListings])

  const displayed = activeBhk
    ? allListings.filter((l) => (l as any).bhkRaw === activeBhk)
    : allListings

  const pinned = displayed.filter((l) => l.latitude != null && l.longitude != null)

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 py-14"
      aria-labelledby="home-map-heading"
    >
      {/* ── Section header — matches FeaturedListings pattern ── */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="label-uppercase text-[#1B2B6B]">
              {nearCity ? `Near ${nearCity}` : 'Live · Across Assam'}
            </p>
            {locationState.status === 'requesting' && (
              <span className="flex items-center gap-1 text-[11px] text-[#8A8480]">
                <Navigation size={10} className="animate-pulse text-[#1B2B6B]" />
                Detecting…
              </span>
            )}
            {nearCity && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-[#1D9E75]">
                <MapPin size={10} /> Your area
              </span>
            )}
          </div>
          <h2
            id="home-map-heading"
            className="text-[22px] font-bold text-[#1A1814]"
          >
            Browse properties on the map
          </h2>
          {!loading && (
            <p className="text-[13px] text-[#8A8480] mt-1">
              {pinned.length} listing{pinned.length !== 1 ? 's' : ''} mapped · approximate area shown
            </p>
          )}
        </div>

        <Link
          href={searchCity ? `/rentals?search=${encodeURIComponent(searchCity)}` : '/rentals'}
          className="hidden sm:flex items-center gap-1.5 text-[13px] font-semibold text-[#1B2B6B] hover:text-[#2D3E8C] transition-colors shrink-0 mt-1"
        >
          View all listings
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* ── BHK filter pills ── */}
      <div className="flex flex-wrap gap-2 mb-4">
        {BHK_FILTERS.map((f) => {
          const isActive = activeBhk === f.value
          return (
            <button
              key={f.label}
              onClick={() => setActiveBhk(f.value)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors"
              style={
                isActive
                  ? {
                      background: f.color ?? '#1B2B6B',
                      color: '#fff',
                      borderColor: f.color ?? '#1B2B6B',
                    }
                  : {
                      background: '#fff',
                      color: '#4A4640',
                      borderColor: '#E5E0D5',
                    }
              }
            >
              {f.color && (
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: isActive ? 'rgba(255,255,255,0.7)' : f.color }}
                />
              )}
              {f.label}
            </button>
          )
        })}
      </div>

      {/* ── Map card ── */}
      {loading ? (
        <div
          className="w-full rounded-[18px] bg-[#E8ECF8] border border-[#E5E0D5] shadow-vastoq-sm flex items-center justify-center"
          style={{ height: 500 }}
        >
          <div className="text-center">
            <Loader2 size={26} className="animate-spin text-[#1B2B6B] mx-auto mb-3" />
            <p className="text-[13px] text-[#8A8480]">Loading map…</p>
          </div>
        </div>
      ) : (
        <div className="rounded-[18px] overflow-hidden border border-[#E5E0D5] shadow-vastoq-md">
          <RentalsMapView listings={displayed} height={500} userLocation={userLatLng} />
        </div>
      )}

      {/* ── Mobile CTA ── */}
      <div className="mt-5 flex items-center justify-between">
        <p className="text-[11px] text-[#8A8480]">
          Exact address revealed only after unlocking
        </p>
        <Link
          href={searchCity ? `/rentals?search=${encodeURIComponent(searchCity)}` : '/rentals'}
          className="sm:hidden flex items-center gap-1 text-[13px] font-semibold text-[#1B2B6B]"
        >
          View all <ArrowRight size={13} />
        </Link>
      </div>
    </section>
  )
}
