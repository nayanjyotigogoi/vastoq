'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, IndianRupee, ChevronDown } from 'lucide-react'
import PlaceAutocomplete from '@/components/ui/PlaceAutocomplete'

const PROPERTY_TYPES = [
  'Any',
  'Flat',
  'PG',
  'Room',
  'Shared Room',
  'House',
]

export default function HeroSection() {
  const router = useRouter()
  const [locality, setLocality] = useState('')
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [budget, setBudget] = useState('')
  const [type, setType] = useState('Any')
  const [isTypeOpen, setIsTypeOpen] = useState(false)
  const typeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setIsTypeOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams()

    if (locality.trim()) {
      params.set('search', locality)
      if (coordinates) {
        params.set('lat', String(coordinates.lat))
        params.set('lng', String(coordinates.lng))
      }
    }

    if (budget) {
      params.set('max_rent', budget)
    }

    if (type !== 'Any') {
      const typeMap: Record<string, string> = {
        Flat: 'flat',
        PG: 'pg',
        Room: 'room',
        'Shared Room': 'shared_room',
        House: 'house',
      }

      if (typeMap[type]) {
        params.set('property_type', typeMap[type])
      }
    }

    router.push(`/rentals?${params.toString()}`)
  }

  return (
    <section
      className="relative bg-[#1B2B6B]"
      aria-labelledby="hero-heading"
    >
      {/* Background decorations clipped container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* City watermark */}
        <span className="city-watermark">VASTOQ</span>

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
        {/* Live pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-8">
          <span className="w-2 h-2 rounded-full bg-[#1D9E75] animate-pulse" aria-hidden="true" />
          <span className="text-[13px] font-semibold text-white/90">Now live across Assam</span>
        </div>

        {/* Headline */}
        <h1
          id="hero-heading"
          className="text-white font-extrabold leading-tight tracking-tight mb-4 text-pretty"
          style={{ fontSize: 'clamp(32px, 6vw, 52px)', letterSpacing: '-1.5px', fontWeight: 800 }}
        >
          Find your home.{' '}
          <span className="text-[#1D9E75]">Skip the broker.</span>
        </h1>

        <p className="text-white/70 text-[16px] leading-relaxed mb-10 max-w-2xl mx-auto text-pretty">
          Find verified rental properties, PGs, shared rooms, and trusted local services across Assam — all in one place.
        </p>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-[18px] shadow-vastoq-lg p-2 flex flex-col sm:flex-row gap-2 max-w-3xl mx-auto"
          aria-label="Search rentals"
        >
          {/* Locality */}
          <PlaceAutocomplete
            value={locality}
            onChange={(val) => {
              setLocality(val)
              setCoordinates(null)
            }}
            onSelect={(val, latLng) => {
              setLocality(val)
              setCoordinates(latLng || null)
            }}
            placeholder="Search city, locality, landmark..."
            containerClassName="hover:bg-[#F5F0E8] rounded-[12px] px-3 py-2.5 transition-colors"
            icon={<MapPin size={16} className="text-[#1B2B6B] flex-shrink-0" />}
          />

          <div className="hidden sm:block w-px bg-[#E5E0D5]" aria-hidden="true" />

          {/* Budget */}
          <div className="flex items-center gap-2 flex-1 px-3 py-2.5 rounded-[12px] hover:bg-[#F5F0E8] transition-colors">
            <IndianRupee size={16} className="text-[#1B2B6B] flex-shrink-0" />
            <input
              type="number"
              placeholder="Max budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              min={0}
              className="w-full bg-transparent text-[14px] text-[#1A1814] placeholder:text-[#8A8480] focus:outline-none"
              aria-label="Max budget"
            />
          </div>

          <div className="hidden sm:block w-px bg-[#E5E0D5]" aria-hidden="true" />

          {/* Property type */}
          <div ref={typeRef} className="relative flex items-center px-3 py-2.5 rounded-[12px] hover:bg-[#F5F0E8] transition-colors">
            <button
              type="button"
              onClick={() => setIsTypeOpen(!isTypeOpen)}
              className="flex items-center gap-1.5 text-[14px] font-medium text-[#1A1814] focus:outline-none cursor-pointer w-full h-full text-left"
              style={{ minWidth: 90 }}
            >
              <span className="flex-1 truncate">{type === 'Any' ? 'Property type' : type}</span>
              <ChevronDown size={14} className="text-[#8A8480] flex-shrink-0" aria-hidden="true" />
            </button>

            {isTypeOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-[#E5E0D5] rounded-[12px] shadow-vastoq-lg z-50 py-1.5 min-w-[140px] text-left">
                <ul className="max-h-[240px] overflow-y-auto">
                  {PROPERTY_TYPES.map((t) => {
                    const isSelected = t === type
                    return (
                      <li
                        key={t}
                        onClick={() => {
                          setType(t)
                          setIsTypeOpen(false)
                        }}
                        className={`px-4 py-2 cursor-pointer transition-colors text-[13px] font-semibold ${
                          isSelected
                            ? 'bg-[#F5F0E8] text-[#1a1814]'
                            : 'text-[#4A4640] hover:bg-[#F5F0E8] hover:text-[#1A1814]'
                        }`}
                      >
                        {t}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Search button */}
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1B2B6B] text-white text-[14px] font-bold rounded-[12px] hover:bg-[#2D3E8C] transition-colors min-h-[48px] whitespace-nowrap"
          >
            <Search size={16} />
            Search rentals
          </button>
        </form>

        {/* Stats row */}
        <div className="flex items-center justify-center flex-wrap gap-6 mt-10">
          {[
            { value: '240+', label: 'Verified listings' },
            { value: '180+', label: 'Trusted workers' },
            { value: '4.7★', label: 'Average rating' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-[22px] font-extrabold text-white leading-none">{stat.value}</div>
              <div className="text-[12px] text-white/50 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
