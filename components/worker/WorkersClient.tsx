'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2, MapPin, ChevronDown, Check } from 'lucide-react'
import WorkerCard from './WorkerCard'
import type { Worker } from './WorkerCard'
import UnlockGate from '@/components/listing/UnlockGate'
import { resolveImageUrl } from '@/lib/utils'
import { useUserLocation } from '@/hooks/useUserLocation'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import PlaceAutocomplete from '@/components/ui/PlaceAutocomplete'

const CATEGORY_GROUPS: { label: string; items: string[] }[] = [
  { label: 'Home Services',   items: ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Cleaner', 'AC Technician', 'Mason', 'Gardener', 'Welder', 'Mechanic'] },
  { label: 'Events & Beauty', items: ['Photographer', 'Videographer', 'Makeup Artist', 'Mehendi Artist', 'Musician', 'Event Decorator', 'Catering Staff'] },
  { label: 'Creative',        items: ['Artist / Illustrator', 'Tailor'] },
  { label: 'Wellness & Education', items: ['Tutor / Teacher', 'Yoga Instructor', 'Fitness Trainer'] },
  { label: 'Other',           items: ['Cook', 'Driver', 'Security Guard', 'Other'] },
]

const POPULAR_CATEGORIES = ['Electrician', 'Plumber', 'Photographer', 'Makeup Artist', 'Cook']
const POPULAR_CATEGORIES_MOBILE = ['Electrician', 'Plumber', 'Cook']
const ALL_CATEGORIES = ['All', ...CATEGORY_GROUPS.flatMap(g => g.items)]

function normalise(w: any): Worker {
  return {
    id              : String(w.id),
    name            : w.name ?? '',
    avatar          : resolveImageUrl(w.photoUrl ?? w.photo_url) || undefined,
    category        : w.category ?? '',
    skills          : Array.isArray(w.skills) ? w.skills : [],
    localities      : Array.isArray(w.serviceAreas ?? w.service_areas) && (w.serviceAreas ?? w.service_areas).length
                        ? (w.serviceAreas ?? w.service_areas)
                        : w.locality ? [w.locality] : [],
    hourlyRate      : w.ratePerDay ?? w.rate_per_day ?? 0,
    ratingAvg       : parseFloat(w.rating ?? 0),
    ratingCount     : w.reviewCount ?? w.review_count ?? 0,
    jobsCompleted   : w.jobsCompleted ?? w.jobs_completed ?? 0,
    isVerified      : w.isVerified ?? w.is_verified ?? false,
    isAvailableToday: w.availableToday ?? w.available_today ?? false,
    isUnlocked      : false,
    phone           : undefined,
  }
}

export default function WorkersClient() {
  const locationState = useUserLocation()
  const { user } = useCurrentUser()
  const router = useRouter()

  const [workers,        setWorkers]        = useState<Worker[]>([])
  const [loading,        setLoading]        = useState(true)
  const [total,          setTotal]          = useState(0)
  const [search,         setSearch]         = useState('')
  const [category,       setCategory]       = useState('All')
  const [categorySheetOpen, setCategorySheetOpen] = useState(false)
  const [availOnly,      setAvailOnly]      = useState(false)
  const [verifiedOnly,   setVerifiedOnly]   = useState(false)

  // Location-derived state
  const [cityFilter,     setCityFilter]     = useState('')      // sent to API
  const [locationLabel,  setLocationLabel]  = useState('')      // shown in pill
  const [locationPinned, setLocationPinned] = useState(false)  // true = city filter active

  // Unlock gate state
  const [unlockingWorker, setUnlockingWorker] = useState<Worker | null>(null)

  const handleUnlock = (workerId: string) => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent('/workers')}`)
      return
    }
    const worker = workers.find((w) => w.id === workerId)
    if (worker) setUnlockingWorker(worker)
  }

  const handleUnlockSuccess = (workerId: string, data: any) => {
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === workerId ? { ...w, isUnlocked: true, phone: data?.phone } : w
      )
    )
    setUnlockingWorker(null)
  }

  // Gate: don't fetch until location resolves or timeout fires
  const initialFetched = useRef(false)
  const locationInited = useRef(false)
  const fallbackTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Core fetch ────────────────────────────────────────────────────────────
  const fetchWorkers = useCallback(async (cityOverride?: string, searchOverride?: string) => {
    setLoading(true)
    try {
      const city = cityOverride !== undefined ? cityOverride : cityFilter
      const searchTerm = searchOverride !== undefined ? searchOverride : search
      const params = new URLSearchParams({ per_page: '50' })
      if (searchTerm.trim())  params.set('search',         searchTerm.trim())
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
    fetchWorkers('')
  }

  const clearAll = () => {
    setSearch('')
    setCategory('All')
    setAvailOnly(false)
    setVerifiedOnly(false)
    setCityFilter('')
    setLocationLabel('')
    setLocationPinned(false)
    fetchWorkers('', '')
  }

  const isDetecting = locationState.status === 'idle' || locationState.status === 'requesting'
  const userLatLng = locationState.status === 'ready'
    ? { lat: locationState.location.lat, lng: locationState.location.lng }
    : undefined

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-28 lg:pb-8">
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
      <PlaceAutocomplete
        value={search}
        onChange={setSearch}
        onSelect={(val) => {
          setSearch(val)
          fetchWorkers(undefined, val)
        }}
        placeholder="Search by name, skill or area…"
        containerClassName="bg-white border border-[#E5E0D5] rounded-[10px] px-3 py-2.5 mb-4 shadow-vastoq-sm"
        icon={<Search size={15} className="text-[#8A8480] flex-shrink-0" />}
        userLatLng={userLatLng}
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex gap-2 items-center">
          {/* Scrollable chips — All + popular picks */}
          <div className="flex gap-2 overflow-x-auto pb-1 flex-1 min-w-0" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setCategory('All')}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${
                category === 'All'
                  ? 'bg-[#1B2B6B] text-white border-[#1B2B6B]'
                  : 'bg-white text-[#4A4640] border-[#E5E0D5] hover:border-[#1B2B6B]'
              }`}
            >All</button>

            {POPULAR_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${
                  POPULAR_CATEGORIES_MOBILE.includes(cat) ? '' : 'hidden sm:inline-flex'
                } ${
                  category === cat
                    ? 'bg-[#1B2B6B] text-white border-[#1B2B6B]'
                    : 'bg-white text-[#4A4640] border-[#E5E0D5] hover:border-[#1B2B6B]'
                }`}
              >{cat}</button>
            ))}
          </div>

          {/* More button — always pinned on the right, never scrolls away */}
          <button
            onClick={() => setCategorySheetOpen(true)}
            className={`flex-shrink-0 flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${
              category !== 'All' && !POPULAR_CATEGORIES.includes(category)
                ? 'bg-[#1B2B6B] text-white border-[#1B2B6B]'
                : 'bg-white text-[#4A4640] border-[#E5E0D5] hover:border-[#1B2B6B]'
            }`}
          >
            {category !== 'All' && !POPULAR_CATEGORIES.includes(category) ? category : 'More'}
            <ChevronDown size={12} />
          </button>
        </div>

        {/* Category picker modal */}
        {categorySheetOpen && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setCategorySheetOpen(false)}
          >
            <div
              className="bg-white w-full max-w-md rounded-[20px] max-h-[80vh] flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#F5F0E8] flex-shrink-0">
                <h3 className="text-[15px] font-bold text-[#1A1814]">Select Category</h3>
                <button
                  onClick={() => setCategorySheetOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[#F5F0E8] transition-colors"
                >
                  <X size={17} className="text-[#4A4640]" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5 pb-6">
                <button
                  onClick={() => { setCategory('All'); setCategorySheetOpen(false) }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-[10px] text-[13px] font-semibold border transition-colors ${
                    category === 'All' ? 'bg-[#1B2B6B] text-white border-[#1B2B6B]' : 'border-[#E5E0D5] text-[#1A1814] hover:bg-[#F5F0E8]'
                  }`}
                >
                  All Categories
                  {category === 'All' && <Check size={14} />}
                </button>
                {CATEGORY_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A8480] mb-2">{group.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => { setCategory(cat); setCategorySheetOpen(false) }}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${
                            category === cat
                              ? 'bg-[#1B2B6B] text-white border-[#1B2B6B]'
                              : 'bg-[#F5F0E8] text-[#4A4640] border-transparent hover:border-[#1B2B6B]'
                          }`}
                        >
                          {cat}
                          {category === cat && <Check size={11} />}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 items-center flex-wrap">
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
          {(category !== 'All' || availOnly || verifiedOnly || search) && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-semibold text-[#D84040] border border-[#D84040]/30 bg-red-50 hover:bg-red-100 transition-colors"
            >
              <X size={11} /> Clear filters
            </button>
          )}
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
          {workers.map((worker) => <WorkerCard key={worker.id} worker={worker} onUnlock={handleUnlock} />)}
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
          {workers.map((worker, index) => (
            <div
              key={worker.id}
              style={{
                animationDelay: `${Math.min(index * 60, 400)}ms`
              }}
              className="animate-fade-in-up"
            >
              <WorkerCard worker={worker} onUnlock={handleUnlock} />
            </div>
          ))}
        </div>
      )}

      {/* Unlock Gate modal */}
      {unlockingWorker && (
        <UnlockGate
          type="worker"
          targetId={unlockingWorker.id}
          subjectName={unlockingWorker.name}
          subjectLocality={unlockingWorker.localities?.[0]}
          onClose={() => setUnlockingWorker(null)}
          onSuccess={(data) => handleUnlockSuccess(unlockingWorker.id, data)}
        />
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
