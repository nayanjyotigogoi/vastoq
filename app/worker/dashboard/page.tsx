'use client'

import TopNav from '@/components/nav/TopNav'
import MobileNav from '@/components/nav/MobileNav'
import Footer from '@/components/nav/Footer'
import Link from 'next/link'
import {
  Star,
  Eye,
  Phone,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  MapPin,
  Plus,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCurrentUser } from '@/hooks/useCurrentUser'

type WorkerProfile = {
  id: number
  name: string
  phone: string
  category: string
  skills: string[]
  bio: string | null
  locality: string | null
  city: string
  rate_per_day: number | null
  photo_url: string | null
  rating: number
  review_count: number
  view_count: number
  contact_unlocks: number
  jobs_completed: number
  is_verified: boolean
  aadhaar_status: string
  available_today: boolean
  service_areas: string[]
}

type DashboardStats = {
  profile_views: number
  contact_unlocks: number
  rating: number
  jobs_completed: number
  review_count: number
}

type Review = {
  id: number
  reviewer: string
  rating: number
  comment: string
  date: string
}

export default function WorkerDashboard() {
  const { user, loading: userLoading } = useCurrentUser()

  const [worker, setWorker] = useState<WorkerProfile | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [noProfile, setNoProfile] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newSkill, setNewSkill] = useState('')
  const [savingSkills, setSavingSkills] = useState(false)
  const [savingAvailability, setSavingAvailability] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/dashboard/worker', { credentials: 'include' })
        const json = await res.json()

        if (res.status === 404) {
          setNoProfile(true)
          return
        }

        if (!res.ok) {
          setError(json.error?.message ?? 'Failed to load dashboard')
          return
        }

        setWorker(json.data.worker)
        setStats(json.data.stats)
        setReviews(json.data.reviews ?? [])
      } catch {
        setError('Network error. Please refresh.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const toggleAvailability = async () => {
    if (!worker) return
    setSavingAvailability(true)
    const next = !worker.available_today
    setWorker({ ...worker, available_today: next })

    try {
      await fetch('/api/worker/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available_today: next }),
      })
    } catch {
      // revert on failure
      setWorker({ ...worker, available_today: !next })
    } finally {
      setSavingAvailability(false)
    }
  }

  const addSkill = async () => {
    if (!worker) return
    const s = newSkill.trim()
    if (!s || worker.skills.includes(s)) { setNewSkill(''); return }

    const updatedSkills = [...worker.skills, s]
    setWorker({ ...worker, skills: updatedSkills })
    setNewSkill('')
    setSavingSkills(true)

    try {
      await fetch('/api/worker/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: updatedSkills }),
      })
    } catch {
      setWorker({ ...worker, skills: worker.skills })
    } finally {
      setSavingSkills(false)
    }
  }

  const removeSkill = async (skill: string) => {
    if (!worker) return
    const updatedSkills = worker.skills.filter((s) => s !== skill)
    setWorker({ ...worker, skills: updatedSkills })
    setSavingSkills(true)

    try {
      await fetch('/api/worker/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: updatedSkills }),
      })
    } catch {
      setWorker({ ...worker, skills: worker.skills })
    } finally {
      setSavingSkills(false)
    }
  }

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#1B2B6B]" />
      </div>
    )
  }

  if (noProfile) {
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        <TopNav />
        <main className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[#E8ECF8] flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={28} className="text-[#1B2B6B]" />
          </div>
          <h1 className="text-[22px] font-bold text-[#1A1814] mb-2">Complete your profile</h1>
          <p className="text-[14px] text-[#4A4640] mb-6 leading-relaxed">
            You haven't set up your worker profile yet. Add your skills, category, and rate to start receiving work enquiries.
          </p>
          <Link
            href="/worker/setup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B2B6B] text-white text-[14px] font-bold rounded-[10px] hover:bg-[#2D3E8C] transition-colors"
          >
            Set up my profile
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !worker) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <p className="text-[14px] text-red-600">{error ?? 'Something went wrong.'}</p>
      </div>
    )
  }

  const initial = worker.name?.charAt(0)?.toUpperCase() ?? 'W'

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <TopNav />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Profile header */}
        <div className="bg-white rounded-[20px] border border-[#E5E0D5] shadow-vastoq-sm p-6 mb-6 flex items-start gap-5 flex-wrap">
          <div className="w-16 h-16 rounded-full bg-[#1D9E75] text-white text-[22px] font-extrabold flex items-center justify-center flex-shrink-0 overflow-hidden">
            {worker.photo_url
              ? <img src={worker.photo_url} alt={worker.name} className="w-full h-full object-cover" />
              : initial}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-[22px] font-bold text-[#1A1814]">{worker.name}</h1>
              {worker.is_verified && (
                <span className="px-2 py-0.5 bg-[#E1F5EE] text-[#1D9E75] text-[11px] font-bold rounded-full flex items-center gap-1">
                  <ShieldCheck size={10} /> Aadhaar Verified
                </span>
              )}
            </div>
            <p className="text-[13px] text-[#4A4640] mb-2 capitalize">
              {worker.category}{worker.rate_per_day ? ` · ₹${worker.rate_per_day}/day` : ''}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {worker.rating > 0 && (
                <>
                  <div className="flex items-center gap-1">
                    <Star size={13} className="fill-[#E8A020] stroke-[#E8A020]" />
                    <span className="text-[13px] font-bold text-[#1A1814]">{worker.rating.toFixed(1)}</span>
                    <span className="text-[12px] text-[#8A8480]">({worker.review_count} reviews)</span>
                  </div>
                  <span className="text-[#D0C9BC]">·</span>
                </>
              )}
              {worker.jobs_completed > 0 && (
                <>
                  <span className="text-[12px] text-[#4A4640]">{worker.jobs_completed} jobs completed</span>
                  <span className="text-[#D0C9BC]">·</span>
                </>
              )}
              {worker.locality && (
                <div className="flex items-center gap-1">
                  <MapPin size={11} className="text-[#8A8480]" />
                  <span className="text-[12px] text-[#4A4640]">{worker.locality}, {worker.city}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#4A4640] font-medium">
                {worker.available_today ? 'Available today' : 'Not available'}
              </span>
              <button
                onClick={toggleAvailability}
                disabled={savingAvailability}
                className={`relative inline-flex h-6 w-11 rounded-full transition-colors focus:outline-none disabled:opacity-60 ${worker.available_today ? 'bg-[#1D9E75]' : 'bg-[#D0C9BC]'}`}
                role="switch"
                aria-checked={worker.available_today}
                aria-label="Toggle availability"
              >
                <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform mt-1 ${worker.available_today ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <Link
              href={`/workers/${worker.id}`}
              className="text-[12px] text-[#1B2B6B] font-semibold hover:underline flex items-center gap-1"
            >
              View public profile <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Eye,          label: 'Profile views',    value: String(stats?.profile_views ?? 0),   sub: 'this month',  color: 'bg-[#E8ECF8] text-[#1B2B6B]' },
            { icon: Phone,        label: 'Contact unlocks',  value: String(stats?.contact_unlocks ?? 0), sub: 'total',       color: 'bg-[#E1F5EE] text-[#1D9E75]' },
            { icon: Star,         label: 'Rating',           value: worker.rating > 0 ? worker.rating.toFixed(1) : '–', sub: `${stats?.review_count ?? 0} reviews`, color: 'bg-[#FEF3DC] text-[#E8A020]' },
            { icon: CheckCircle2, label: 'Jobs done',        value: String(stats?.jobs_completed ?? 0),  sub: 'all time',    color: 'bg-[#E8ECF8] text-[#1B2B6B]' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-[14px] border border-[#E5E0D5] p-4 shadow-vastoq-sm">
              <div className={`w-8 h-8 rounded-[8px] ${s.color} flex items-center justify-center mb-2`}>
                <s.icon size={15} />
              </div>
              <p className="text-[22px] font-extrabold text-[#1A1814] leading-none">{s.value}</p>
              <p className="text-[11px] font-semibold text-[#1A1814] mt-1">{s.label}</p>
              <p className="text-[10px] text-[#8A8480]">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Left */}
          <div className="space-y-6">

            {/* Skills editor */}
            <div className="bg-white rounded-[16px] border border-[#E5E0D5] p-5 shadow-vastoq-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-bold text-[#1A1814]">Skills</h2>
                {savingSkills && <Loader2 size={13} className="animate-spin text-[#8A8480]" />}
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {worker.skills.map((s) => (
                  <div
                    key={s}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8ECF8] rounded-full text-[12px] font-semibold text-[#1B2B6B]"
                  >
                    {s}
                    <button
                      onClick={() => removeSkill(s)}
                      className="text-[#8A8480] hover:text-[#D84040] transition-colors"
                      aria-label={`Remove skill ${s}`}
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
                {worker.skills.length === 0 && (
                  <p className="text-[12px] text-[#8A8480]">No skills added yet.</p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  className="flex-1 px-3 py-2 border border-[#E5E0D5] rounded-[8px] text-[13px] text-[#1A1814] placeholder:text-[#8A8480] focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30 focus:border-[#1B2B6B]"
                />
                <button
                  onClick={addSkill}
                  className="p-2 bg-[#1B2B6B] text-white rounded-[8px] hover:bg-[#2D3E8C] transition-colors"
                  aria-label="Add skill"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-[16px] border border-[#E5E0D5] p-5 shadow-vastoq-sm">
              <h2 className="text-[15px] font-bold text-[#1A1814] mb-4">Recent reviews</h2>
              {reviews.length === 0 ? (
                <p className="text-[13px] text-[#8A8480] text-center py-4">
                  No reviews yet. Complete jobs to earn reviews.
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="pb-4 border-b border-[#F5F0E8] last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[13px] font-semibold text-[#1A1814]">{r.reviewer}</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} size={11} className="fill-[#E8A020] stroke-[#E8A020]" />
                          ))}
                          <span className="text-[11px] text-[#8A8480] ml-1">{r.date}</span>
                        </div>
                      </div>
                      <p className="text-[12px] text-[#4A4640] leading-relaxed">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="space-y-4">
            {/* Verification status */}
            <div className={`rounded-[16px] border p-5 ${worker.is_verified ? 'bg-[#E1F5EE] border-[#1D9E75]/20' : 'bg-[#FEF3DC] border-[#E8A020]/20'}`}>
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck size={22} className={worker.is_verified ? 'text-[#1D9E75]' : 'text-[#E8A020]'} />
                <div>
                  <p className="text-[14px] font-bold text-[#1A1814]">
                    {worker.is_verified ? 'Aadhaar Verified' : 'Verification Pending'}
                  </p>
                  <p className="text-[11px] text-[#4A4640]">
                    {worker.is_verified
                      ? 'Your profile shows a verified badge'
                      : `Status: ${worker.aadhaar_status}`}
                  </p>
                </div>
              </div>
              <p className="text-[12px] text-[#4A4640] leading-relaxed">
                {worker.is_verified
                  ? 'Verified workers receive 4x more contact unlocks than unverified profiles.'
                  : 'Complete Aadhaar verification to build trust with clients.'}
              </p>
            </div>

            {/* Profile snapshot */}
            <div className="bg-white rounded-[16px] border border-[#E5E0D5] p-5 shadow-vastoq-sm">
              <h3 className="text-[14px] font-bold text-[#1A1814] mb-3">Profile snapshot</h3>
              <div className="space-y-2.5 text-[12px] text-[#4A4640]">
                <div className="flex items-center justify-between">
                  <span>Category</span>
                  <span className="font-semibold text-[#1A1814] capitalize">{worker.category || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Daily rate</span>
                  <span className="font-semibold text-[#1A1814]">
                    {worker.rate_per_day ? `₹${worker.rate_per_day}/day` : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>City</span>
                  <span className="font-semibold text-[#1A1814]">{worker.city || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Locality</span>
                  <span className="font-semibold text-[#1A1814]">{worker.locality || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Service areas</span>
                  <span className="font-semibold text-[#1A1814]">
                    {worker.service_areas?.length > 0 ? `${worker.service_areas.length} area(s)` : '—'}
                  </span>
                </div>
              </div>
              <Link
                href="/worker/setup"
                className="mt-4 block w-full py-2.5 text-center border border-[#1B2B6B] text-[#1B2B6B] text-[13px] font-semibold rounded-[10px] hover:bg-[#E8ECF8] transition-colors"
              >
                Edit profile
              </Link>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-[16px] border border-[#E5E0D5] p-5 shadow-vastoq-sm">
              <h3 className="text-[14px] font-bold text-[#1A1814] mb-3">Tips to get more work</h3>
              <ul className="space-y-2.5">
                {[
                  'Add photos of completed work to build trust',
                  'Set your daily rate competitively',
                  'Keep your availability updated daily',
                  'Ask satisfied clients to leave a review',
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-[12px] text-[#4A4640]">
                    <CheckCircle2 size={13} className="text-[#1D9E75] mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <MobileNav />
      <div className="h-16 lg:hidden" aria-hidden="true" />
    </div>
  )
}
