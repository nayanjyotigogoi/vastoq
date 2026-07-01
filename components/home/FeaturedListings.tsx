'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Zap, Loader2 } from 'lucide-react'
import ListingCarouselCard from '@/components/listing/ListingCarouselCard'
import type { Listing } from '@/components/listing/ListingCard'

function normalise(l: any): Listing {
  return {
    id: String(l.id),
    title: l.title,
    locality: `${l.locality}, ${l.city}`,
    rent: l.rent_per_month,
    deposit: l.deposit,
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
    photos: l.photos ?? [],
    isVerified: l.owner?.is_verified ?? false,
    isPopular:  (l.view_count ?? 0) > 100,
    isBoosted:  l.is_featured ?? false,
    isSaved:    l.is_saved ?? false,
    owner: { name: l.owner?.name ?? 'Owner', verified: l.owner?.is_verified ?? false },
    isLocked: !(l.is_unlocked ?? false),
    latitude:  l.latitude  != null ? Number(l.latitude)  : undefined,
    longitude: l.longitude != null ? Number(l.longitude) : undefined,
    bhkRaw: l.bhk_type ?? undefined,
  }
}

export default function FeaturedListings() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading,  setLoading]  = useState(true)

  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft,  setCanLeft]  = useState(false)
  const [canRight, setCanRight] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        // Prefer real boosted listings first.
        const res  = await fetch('/api/listings?is_featured=1&per_page=20&sort=newest', { credentials: 'include' })
        const json = await res.json()
        let items: any[] = json?.data?.data?.data ?? []

        // Fallback: no boosted listings yet — show the most popular ones
        // instead, so the homepage never looks empty pre-launch.
        if (items.length === 0) {
          const fallbackRes  = await fetch('/api/listings?per_page=20&sort=popular', { credentials: 'include' })
          const fallbackJson = await fallbackRes.json()
          items = fallbackJson?.data?.data?.data ?? []
        }

        if (!cancelled) setListings(items.map(normalise))
      } catch {
        if (!cancelled) setListings([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const updateArrows = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    const ro = new ResizeObserver(updateArrows)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', updateArrows); ro.disconnect() }
  }, [updateArrows, listings])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -el.clientWidth * 0.9 : el.clientWidth * 0.9, behavior: 'smooth' })
  }

  if (!loading && listings.length === 0) return null

  // Fill the top row first, then the bottom row — both rows scroll together.
  const topRow    = listings.slice(0, Math.ceil(listings.length / 2))
  const bottomRow = listings.slice(Math.ceil(listings.length / 2))

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14" aria-labelledby="featured-heading">
      {/* Row header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[10px] bg-[#FEF3DC] flex items-center justify-center flex-shrink-0">
            <Zap size={16} className="text-[#E8A020]" />
          </div>
          <div>
            <p className="label-uppercase text-[#E8A020] mb-0.5">Guwahati · Featured</p>
            <h2 id="featured-heading" className="text-[18px] font-bold text-[#1A1814] leading-none">
              Featured Rentals
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Nav arrows — desktop only, hidden while loading/empty */}
          {!loading && listings.length > 0 && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                disabled={!canLeft}
                className="w-8 h-8 rounded-full border border-[#E5E0D5] bg-white flex items-center justify-center
                           transition-all hover:border-[#1B2B6B] hover:bg-[#E8ECF8]
                           disabled:opacity-30 disabled:pointer-events-none shadow-sm"
                aria-label="Scroll left"
              >
                <ChevronLeft size={15} className="text-[#1B2B6B]" />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canRight}
                className="w-8 h-8 rounded-full border border-[#E5E0D5] bg-white flex items-center justify-center
                           transition-all hover:border-[#1B2B6B] hover:bg-[#E8ECF8]
                           disabled:opacity-30 disabled:pointer-events-none shadow-sm"
                aria-label="Scroll right"
              >
                <ChevronRight size={15} className="text-[#1B2B6B]" />
              </button>
            </div>
          )}

          <Link
            href="/rentals"
            className="flex items-center gap-1 text-[12px] font-semibold text-[#1B2B6B] hover:underline ml-1 whitespace-nowrap"
          >
            View all <ChevronRight size={12} />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-[#1B2B6B]" />
        </div>
      ) : (
        <div className="relative">
          {/* Left fade */}
          <div
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 z-10 transition-opacity duration-200"
            style={{
              background: 'linear-gradient(to right, rgba(250,250,248,0.95), transparent)',
              opacity: canLeft ? 1 : 0,
            }}
          />
          {/* Right fade */}
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10 transition-opacity duration-200"
            style={{
              background: 'linear-gradient(to left, rgba(250,250,248,0.95), transparent)',
              opacity: canRight ? 1 : 0,
            }}
          />

          <div
            ref={scrollRef}
            className="overflow-x-auto pb-3"
            style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex flex-col gap-4" style={{ width: 'max-content' }}>
              <div className="flex gap-4">
                {topRow.map((listing) => (
                  <div key={listing.id} style={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
                    <ListingCarouselCard listing={listing} />
                  </div>
                ))}
              </div>
              {bottomRow.length > 0 && (
                <div className="flex gap-4">
                  {bottomRow.map((listing) => (
                    <div key={listing.id} style={{ flexShrink: 0 }}>
                      <ListingCarouselCard listing={listing} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
