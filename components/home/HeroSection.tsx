'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, IndianRupee, ChevronDown } from 'lucide-react'

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
  const [budget, setBudget] = useState('')
  const [type, setType] = useState('Any')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams()

    if (locality.trim()) {
      params.set('search', locality)
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
      className="relative bg-[#1B2B6B] overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* City watermark */}
      <span className="city-watermark" aria-hidden="true">VASTOQ</span>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        aria-hidden="true"
      />

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
          <div className="flex items-center gap-2 flex-1 px-3 py-2.5 rounded-[12px] hover:bg-[#F5F0E8] transition-colors">
            <MapPin size={16} className="text-[#1B2B6B] flex-shrink-0" />
            <input
              type="text"
              placeholder="Search city, locality, landmark..."
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="w-full bg-transparent text-[14px] text-[#1A1814] placeholder:text-[#8A8480] focus:outline-none"
              aria-label="Search location"
            />
          </div>

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
          <div className="flex items-center gap-1 px-3 py-2.5 rounded-[12px] hover:bg-[#F5F0E8] transition-colors">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-transparent text-[14px] text-[#1A1814] focus:outline-none cursor-pointer appearance-none pr-5"
              aria-label="Property type"
              style={{ minWidth: 80 }}
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <ChevronDown size={14} className="text-[#8A8480] -ml-4 pointer-events-none" aria-hidden="true" />
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
