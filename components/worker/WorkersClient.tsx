'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, X, Loader2, MapPin } from 'lucide-react'
import WorkerCard from './WorkerCard'
import type { Worker } from './WorkerCard'
import { useUserLocation } from '@/hooks/useUserLocation'

const CATEGORIES = [
  'All', 'Electrician', 'Plumber', 'Carpenter', 'Painter',
  'Cleaner', 'AC Technician', 'Driver', 'Mason', 'Cook', 'Security Guard',
]

function normalise(w: any): Worker {
  return {
    id              : String(w.id),
    name            : w.name ?? '',
    avatar          : w.photo_url ?? undefined,
    category        : w.category ?? '',
    skills          : Array.isArray(w.skills) ? w.skills : [],
    localities      : Array.isArray(w.service_areas) && w.service_areas.length
                        ? w.service_areas
                        : w.locality ? [w.locality] : [],
    hourlyRate      : w.rate_per_day ?? 0,
    ratingAvg       : parseFloat(w.rating ?? 0),
    ratingCount     : w.review_count ?? 0,
    jobsCompleted   : w.jobs_completed ?? 0,
    isVerified      : w.is_verified ?? false,
    isAvailableToday: w.available_today ?? false,
    isUnlocked      : false,
    phone           : undefined,
  }
}

export default function WorkersClient() {
  const locationState = useUserLocation()

  const [workers,        setWorkers]        = useState<Worker[]>([])
  const [loading,        setLoading]        = useState(true)
  const [total,          setTotal]          = useState(0)
  const [search,         setSearch]         = useState('')
  const [category,       setCategory]       = useState('All')
  const [availOnly,      setAvailOnly]      = useState(false)
  const [verifiedOnly,   setVerifiedOnly]   = useState(false)

  // Location-derived state
  const [cityFilter,     setCityFilter]     = useState('')      // sent to API
  const [locationLabel,  setLocationLabel]  = useState('')      // shown in pill
  const [locationPinned, setLocationPinned] = useState(false)  // true = city filter active

  // Gate: don't fetch until location resolves or timeout fires
  const initialFetched = useRef(false)
  const locationInited = useRef(false)
  const fallbackTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Core fetch ────────────────────────────────────────────────────────────
  const fetchWorkers = useCallback(async (cityOverride?: string) => {
    setLoading(true)
    try {
      const city = cityOverride !== undefined ? cityOverride : cityFilter
      const params = new URLSearchParams({ per_page: '50' })
      if (search.trim())      params.set('search',         search.trim())
      if (category !== 'All') params.set('category',       category)
      if (city)               params.set('city',           city)
      if (availOnly)          params.set('available_today','1')
      if (verifiedOnly)       params.set('verified_only',  '1')

      const res  = await fetch(`/api/workers?${params}`)
      const json = await res.json()
      const items: any[] = json?.data?.data?.data ?? json?.data?.data ?? []
      setTotal(json?.data?.data?.total ?? items.length)
      setWorkers(items.map(normalise))
    } catch {
      setWorkers([])
    } finally {
      setLoading(false)
    }
  }, [search, category, cityFilter, availOnly, verifiedOnly])

  // ── Effect 1: location resolves → first fetch ─────────────────────────────
  useEffect(() => {
    if (locationInited.current) return
    if (locationState.status === 'idle' || locationState.status === 'requesting') return

    locationInited.current = true
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current)

    if (locationState.status === 'ready') {
      const { city, displayName } = locationState.location
      setCityFilter(city)
      setLocationLabel(displayName)
      setLocationPinned(true)
      initialFetched.current = true
      fetchWorkers(city)
    } else {
      // denied / error — fetch all
      initialFetched.current = true
      fetchWorkers('')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationState.status])

  // ── Effect 2: 5s fallback if location never resolves ─────────────────────
  useEffect(() => {
    fallbackTimer.current = setTimeout(() => {
      if (!initialFetched.current) {
        initialFetched.current = true
        locationInited.current = true
        fetchWorkers('')
      }
    }, 5000)
    return () => { if (fallbackTimer.current) clearTimeout(fallbackTimer.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Effect 3: re-fetch on filter changes (after initial) ─────────────────
  useEffect(() => {
    if (!initialFetched.current) return
    const t = setTimeout(() => fetchWorkers(), search ? 500 : 0)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, availOnly, verifiedOnly, cityFilter])

  // ── Dismiss location pill → show all cities ───────────────────────────────
  const dismissLocation = () => {
    setCityFilter('')
    setLocationLabel('')
    setLocationPinned(false)
  }

  const clearAll = () => {
    setSearch('')
    setCategory('All')
    setAvailOnly(false)
    setVerifiedOnly(false)
    setCityFilter('')
    setLocationLabel('')
    setLocationPinned(false)
  }

  const isDetecting = locationState.status === 'idle' || locationState.status === 'requesting'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-[28px] font-bold text-[#1A1814] mb-1">Local Workers</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {isDetecting && !initialFetched.current ? (
            <span className="flex items-center gap-1.5 text-[13px] text-[#8A8480]">
              <Loader2 size={12} className="animate-spin" />
              Detecting your location…
            </span>
          ) : loading ? (
            <span className="text-[13px] text-[#8A8480]">Loading…</span>
          ) : (
            <span className="text-[13px] text-[#4A4640]">{total} workers available</span>
          )}

          {/* Location pill */}
          {locationPinned && locationLabel && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E1F5EE] border border-[#1D9E75]/30 text-[12px] font-semibold text-[#1D9E75]">
              <MapPin size={11} />
              Near {locationLabel}
              <button
                onClick={dismissLocation}
                aria-label="Show all cities"
                className="ml-0.5 opacity-70 hover:opacity-100"
              >
                <X size={11} />
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-[#E5E0D5] rounded-[10px] px-3 py-2.5 mb-4 shadow-vastoq-sm">
        <Search size={15} className="text-[#8A8480] flex-shrink-0" />
        <input
          type="text"
          placeholder="Search by name, skill or area…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-[14px] text-[#1A1814] placeholder:text-[#8A8480] focus:outline-none"
          aria-label="Search workers"
        />
        {search && (
          <button onClick={() => setSearch('')} aria-label="Clear search">
            <X size={14} className="text-[#8A8480]" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${
                category === cat
                  ? 'bg-[#1B2B6B] text-white border-[#1B2B6B]'
                  : 'bg-white text-[#4A4640] border-[#E5E0D5] hover:border-[#1B2B6B]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAvailOnly((v) => !v)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${
              availOnly ? 'bg-[#1D9E75] text-white border-[#1D9E75]' : 'bg-white text-[#4A4640] border-[#E5E0D5]'
            }`}
          >
            ● Available today
          </button>
          <button
            onClick={() => setVerifiedOnly((v) => !v)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${
              verifiedOnly ? 'bg-[#1D9E75] text-white border-[#1D9E75]' : 'bg-white text-[#4A4640] border-[#E5E0D5]'
            }`}
          >
            ✓ Verified only
          </button>
        </div>
      </div>

      {/* Results */}
      {loading && !initialFetched.current ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#1B2B6B]" />
        </div>
      ) : loading ? (
        // Soft re-fetch shimmer — don't blank the list
        <div className="opacity-50 pointer-events-none space-y-3">
          {workers.map((worker) => <WorkerCard key={worker.id} worker={worker} />)}
        </div>
      ) : workers.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-[18px] bg-[#E8ECF8] flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-[#1B2B6B]" />
          </div>
          <h3 className="text-[18px] font-bold text-[#1A1814] mb-2">
            {locationPinned ? `No workers found near ${locationLabel}` : 'No workers found'}
          </h3>
          <p className="text-[13px] text-[#4A4640] mb-4">
            {locationPinned
              ? 'Try clearing the location filter to see workers in other cities.'
              : 'Try a different category or clear your filters.'}
          </p>
          <button onClick={clearAll} className="px-5 py-2.5 bg-[#1B2B6B] text-white text-[13px] font-semibold rounded-[10px]">
            {locationPinned ? 'Show all cities' : 'Clear filters'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {workers.map((worker) => <WorkerCard key={worker.id} worker={worker} />)}
        </div>
      )}

      {/* Register CTA */}
      <div className="mt-10 p-5 bg-[#E8ECF8] rounded-[16px] border border-[#1B2B6B]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-[15px] font-bold text-[#1B2B6B] mb-0.5">Are you a skilled worker?</p>
          <p className="text-[13px] text-[#4A4640]">Register your profile and get hired directly by tenants.</p>
        </div>
        <a
          href="/worker/register"
          className="flex-shrink-0 px-5 py-2.5 bg-[#1B2B6B] text-white text-[13px] font-bold rounded-[10px] hover:bg-[#2D3E8C] transition-colors"
        >
          Register as worker →
        </a>
      </div>
    </div>
  )
}
