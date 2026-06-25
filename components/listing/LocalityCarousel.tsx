'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import ListingCarouselCard from './ListingCarouselCard'
import type { Listing } from './ListingCard'

interface LocalityCarouselProps {
  locality: string
  listings: Listing[]
}

export default function LocalityCarousel({ locality, listings }: LocalityCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft,  setCanLeft]  = useState(false)
  const [canRight, setCanRight] = useState(false)

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
  }, [updateArrows])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -el.clientWidth : el.clientWidth, behavior: 'smooth' })
  }

  // Encode locality for search URL
  const searchHref = `/rentals?search=${encodeURIComponent(locality.split(',')[0].trim())}`

  return (
    <section className="mb-10">
      {/* Row header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-[#E8ECF8] flex items-center justify-center flex-shrink-0">
            <MapPin size={14} className="text-[#1B2B6B]" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-[#1A1814] leading-none">{locality}</h2>
            <p className="text-[12px] text-[#8A8480] mt-0.5">{listings.length} listing{listings.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Nav arrows */}
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

          {/* View all link */}
          <Link
            href={searchHref}
            className="hidden sm:inline-flex items-center gap-1 text-[12px] font-semibold text-[#1B2B6B] hover:underline ml-1"
          >
            View all <ChevronRight size={12} />
          </Link>
        </div>
      </div>

      {/* Scroll track */}
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
          className="flex gap-4 overflow-x-auto pb-3"
          style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {listings.map((listing) => (
            <div key={listing.id} style={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
              <ListingCarouselCard listing={listing} />
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-b border-[#F0EBE3] mt-2" />
    </section>
  )
}
