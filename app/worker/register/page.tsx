'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/nav/TopNav'
import Footer from '@/components/nav/Footer'
import MobileNav from '@/components/nav/MobileNav'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Loader2, Plus, X, CheckCircle } from 'lucide-react'

const CATEGORIES = [
  'Electrician', 'Plumber', 'Carpenter', 'Painter', 'Cleaner',
  'AC Technician', 'Driver', 'Mason', 'Cook', 'Security Guard',
  'Gardener', 'Welder', 'Mechanic', 'Other',
]

const COMMON_SKILLS: Record<string, string[]> = {
  Electrician  : ['Wiring', 'MCB Installation', 'Fan Fitting', 'AC Wiring', 'Inverter Setup'],
  Plumber      : ['Pipe Fitting', 'Leak Repair', 'Bathroom Fitting', 'Motor Fitting', 'Drain Cleaning'],
  Carpenter    : ['Furniture Making', 'Door Fitting', 'Modular Kitchen', 'Wood Polish', 'Plywood Work'],
  Painter      : ['Interior Paint', 'Exterior Paint', 'Texture Paint', 'Waterproofing', 'Wall Putty'],
  Cleaner      : ['Deep Cleaning', 'Kitchen Cleaning', 'Bathroom Scrubbing', 'Sofa Cleaning', 'Office Cleaning'],
  'AC Technician': ['AC Installation', 'Gas Refilling', 'AC Service', 'Split AC Repair'],
  Driver       : ['Car Driving', 'LMV License', 'City Routes', 'Long Distance'],
  Mason        : ['Brick Work', 'Tile Fixing', 'Plastering', 'Waterproofing'],
  Cook         : ['Assamese Cuisine', 'Bengali Cuisine', 'Tiffin Service', 'Party Catering'],
  'Security Guard': ['Night Duty', 'CCTV Monitoring', 'Gate Management', 'First Aid'],
}

export default function WorkerRegisterPage() {
  const { user, loading: userLoading } = useCurrentUser()
  const router = useRouter()

  const [form, setForm] = useState({
    category    : '',
    bio         : '',
    city        : '',
    locality    : '',
    rate_per_day: '',
  })
  const [skills,       setSkills]       = useState<string[]>([])
  const [skillInput,   setSkillInput]   = useState('')
  const [serviceAreas, setServiceAreas] = useState<string[]>([])
  const [areaInput,    setAreaInput]    = useState('')
  const [saving,       setSaving]       = useState(false)
  const [done,         setDone]         = useState(false)
  const [err,          setErr]          = useState('')

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#1B2B6B]" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-[16px] font-semibold text-[#1A1814] mb-3">You must be logged in to register as a worker.</p>
          <a href="/login" className="px-5 py-2.5 bg-[#1B2B6B] text-white text-[14px] font-bold rounded-[10px]">
            Login / Sign up
          </a>
        </div>
      </div>
    )
  }

  const addSkill = (s: string) => {
    const clean = s.trim()
    if (clean && !skills.includes(clean)) setSkills((p) => [...p, clean])
    setSkillInput('')
  }

  const addArea = (a: string) => {
    const clean = a.trim()
    if (clean && !serviceAreas.includes(clean)) setServiceAreas((p) => [...p, clean])
    setAreaInput('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    if (!form.category) { setErr('Please select a category.'); return }
    if (!form.city.trim()) { setErr('City is required.'); return }
    if (skills.length === 0) { setErr('Add at least one skill.'); return }

    setSaving(true)
    try {
      const res  = await fetch('/api/workers', {
        method : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          category    : form.category,
          bio         : form.bio || null,
          city        : form.city.trim(),
          locality    : form.locality.trim() || null,
          rate_per_day: form.rate_per_day ? Number(form.rate_per_day) : null,
          skills,
          service_areas: serviceAreas.length ? serviceAreas : [form.city.trim()],
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setErr(json?.error?.message ?? json?.message ?? 'Something went wrong.')
      } else {
        setDone(true)
        setTimeout(() => router.push('/workers'), 2500)
      }
    } catch {
      setErr('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center p-8">
          <CheckCircle size={48} className="text-[#1D9E75] mx-auto mb-4" />
          <h2 className="text-[22px] font-bold text-[#1A1814] mb-2">Profile created!</h2>
          <p className="text-[14px] text-[#4A4640]">You're now listed as a worker. Redirecting…</p>
        </div>
      </div>
    )
  }

  const suggestedSkills = (COMMON_SKILLS[form.category] ?? []).filter((s) => !skills.includes(s))

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <TopNav />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-[#1A1814] mb-1">Register as a Worker</h1>
          <p className="text-[14px] text-[#4A4640]">Fill in your details and start getting hire requests directly.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category */}
          <div>
            <label className="label-uppercase text-[#8A8480] block mb-2">Category *</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat} type="button"
                  onClick={() => { setForm((f) => ({ ...f, category: cat })); setSkills([]) }}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${
                    form.category === cat
                      ? 'bg-[#1B2B6B] text-white border-[#1B2B6B]'
                      : 'bg-white text-[#4A4640] border-[#E5E0D5] hover:border-[#1B2B6B]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="label-uppercase text-[#8A8480] block mb-2">Skills *</label>
            {suggestedSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {suggestedSkills.map((s) => (
                  <button key={s} type="button" onClick={() => addSkill(s)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium border border-dashed border-[#1B2B6B]/40 text-[#1B2B6B] hover:bg-[#E8ECF8]">
                    + {s}
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {skills.map((s) => (
                <span key={s} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E8ECF8] text-[#1B2B6B] text-[12px] font-semibold">
                  {s}
                  <button type="button" onClick={() => setSkills((p) => p.filter((x) => x !== s))}>
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput) } }}
                placeholder="Type a skill and press Enter"
                className="flex-1 border border-[#E5E0D5] rounded-[8px] px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30"
              />
              <button type="button" onClick={() => addSkill(skillInput)}
                className="px-3 py-2 bg-[#E8ECF8] text-[#1B2B6B] rounded-[8px] hover:bg-[#d0d8f0]">
                <Plus size={15} />
              </button>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="label-uppercase text-[#8A8480] block mb-2">About you</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="Briefly describe your experience and what makes you reliable…"
              rows={3}
              className="w-full border border-[#E5E0D5] rounded-[8px] px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30 resize-none"
            />
          </div>

          {/* City / Locality / Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-uppercase text-[#8A8480] block mb-2">City *</label>
              <input
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                placeholder="e.g. Guwahati"
                className="w-full border border-[#E5E0D5] rounded-[8px] px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30"
              />
            </div>
            <div>
              <label className="label-uppercase text-[#8A8480] block mb-2">Locality</label>
              <input
                value={form.locality}
                onChange={(e) => setForm((f) => ({ ...f, locality: e.target.value }))}
                placeholder="e.g. Beltola"
                className="w-full border border-[#E5E0D5] rounded-[8px] px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30"
              />
            </div>
            <div>
              <label className="label-uppercase text-[#8A8480] block mb-2">Rate per day (₹)</label>
              <input
                type="number" min={0}
                value={form.rate_per_day}
                onChange={(e) => setForm((f) => ({ ...f, rate_per_day: e.target.value }))}
                placeholder="e.g. 700"
                className="w-full border border-[#E5E0D5] rounded-[8px] px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30"
              />
            </div>
          </div>

          {/* Service areas */}
          <div>
            <label className="label-uppercase text-[#8A8480] block mb-2">Service areas</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {serviceAreas.map((a) => (
                <span key={a} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F5F0E8] text-[#4A4640] text-[12px]">
                  {a}
                  <button type="button" onClick={() => setServiceAreas((p) => p.filter((x) => x !== a))}>
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={areaInput}
                onChange={(e) => setAreaInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addArea(areaInput) } }}
                placeholder="Add locality or area name"
                className="flex-1 border border-[#E5E0D5] rounded-[8px] px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30"
              />
              <button type="button" onClick={() => addArea(areaInput)}
                className="px-3 py-2 bg-[#E8ECF8] text-[#1B2B6B] rounded-[8px] hover:bg-[#d0d8f0]">
                <Plus size={15} />
              </button>
            </div>
          </div>

          {err && (
            <p className="text-[13px] text-[#D84040] font-medium bg-red-50 border border-red-200 rounded-[8px] px-3 py-2">
              {err}
            </p>
          )}

          <button
            type="submit" disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1B2B6B] text-white text-[15px] font-bold rounded-[12px] hover:bg-[#2D3E8C] transition-colors disabled:opacity-60 min-h-[52px]"
          >
            {saving ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : 'Create my worker profile'}
          </button>

          <p className="text-[12px] text-[#8A8480] text-center">
            Your contact number is hidden until a tenant pays to unlock it.
            Complete Aadhaar verification from your dashboard to get the Verified badge.
          </p>
        </form>
      </main>
      <Footer />
      <MobileNav />
      <div className="h-16 lg:hidden" aria-hidden="true" />
    </div>
  )
}
