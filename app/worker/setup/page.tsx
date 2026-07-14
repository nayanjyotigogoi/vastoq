'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/nav/TopNav'
import Footer from '@/components/nav/Footer'
import MobileNav from '@/components/nav/MobileNav'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Loader2, Plus, X, CheckCircle, Camera, Trash2 } from 'lucide-react'
import { resolveImageUrl } from '@/lib/utils'

const CATEGORIES = [
  'Electrician', 'Plumber', 'Carpenter', 'Painter', 'Cleaner',
  'AC Technician', 'Driver', 'Mason', 'Cook', 'Security Guard',
  'Gardener', 'Welder', 'Mechanic',
  'Photographer', 'Videographer', 'Makeup Artist', 'Mehendi Artist',
  'Artist / Illustrator', 'Musician', 'Event Decorator', 'Catering Staff',
  'Tutor / Teacher', 'Yoga Instructor', 'Fitness Trainer', 'Tailor',
  'Other',
]

const COMMON_SKILLS: Record<string, string[]> = {
  Electrician       : ['Wiring', 'MCB Installation', 'Fan Fitting', 'AC Wiring', 'Inverter Setup'],
  Plumber           : ['Pipe Fitting', 'Leak Repair', 'Bathroom Fitting', 'Motor Fitting', 'Drain Cleaning'],
  Carpenter         : ['Furniture Making', 'Door Fitting', 'Modular Kitchen', 'Wood Polish', 'Plywood Work'],
  Painter           : ['Interior Paint', 'Exterior Paint', 'Texture Paint', 'Waterproofing', 'Wall Putty'],
  Cleaner           : ['Deep Cleaning', 'Kitchen Cleaning', 'Bathroom Scrubbing', 'Sofa Cleaning', 'Office Cleaning'],
  'AC Technician'   : ['AC Installation', 'Gas Refilling', 'AC Service', 'Split AC Repair'],
  Driver            : ['Car Driving', 'LMV License', 'City Routes', 'Long Distance'],
  Mason             : ['Brick Work', 'Tile Fixing', 'Plastering', 'Waterproofing'],
  Cook              : ['Assamese Cuisine', 'Bengali Cuisine', 'Tiffin Service', 'Party Catering'],
  'Security Guard'  : ['Night Duty', 'CCTV Monitoring', 'Gate Management', 'First Aid'],
  Photographer      : ['Wedding Photography', 'Portrait', 'Product Photography', 'Event Coverage', 'Photo Editing'],
  Videographer      : ['Wedding Videography', 'Reels & Shorts', 'Event Coverage', 'Video Editing', 'Drone Shots'],
  'Makeup Artist'   : ['Bridal Makeup', 'Party Makeup', 'Airbrush Makeup', 'Hair Styling', 'Saree Draping'],
  'Mehendi Artist'  : ['Bridal Mehendi', 'Arabic Mehendi', 'Back Hand Designs', 'Feet Mehendi'],
  'Artist / Illustrator': ['Portrait Drawing', 'Wall Art', 'Logo Design', 'Digital Art', 'Rangoli'],
  Musician          : ['Singing', 'Guitar', 'Tabla', 'Keyboard', 'Live Performance'],
  'Event Decorator' : ['Balloon Decoration', 'Floral Decoration', 'Stage Setup', 'Theme Decoration'],
  'Catering Staff'  : ['Food Service', 'Buffet Setup', 'Wedding Catering', 'Corporate Events'],
  'Tutor / Teacher' : ['Maths', 'Science', 'English', 'Competitive Exams', 'Music Lessons'],
  'Yoga Instructor' : ['Hatha Yoga', 'Power Yoga', 'Meditation', 'Pranayama', 'Online Sessions'],
  'Fitness Trainer' : ['Weight Training', 'Cardio', 'Home Workouts', 'Diet Planning', 'Zumba'],
  Tailor            : ['Dress Stitching', 'Blouse Stitching', 'Alteration', 'Embroidery', 'Lehenga Work'],
}

export default function WorkerSetupPage() {
  const { user, loading: userLoading } = useCurrentUser()
  const router = useRouter()

  const [isEditMode, setIsEditMode] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)

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
  const [photoUrl,     setPhotoUrl]     = useState<string>('')
  const [workPhotos,   setWorkPhotos]   = useState<string[]>([])
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [uploadingWork,    setUploadingWork]    = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [done,         setDone]         = useState(false)
  const [err,          setErr]          = useState('')
  const profilePhotoRef = useRef<HTMLInputElement>(null)
  const workPhotosRef   = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) {
      if (!userLoading) {
        setLoadingProfile(false)
      }
      return
    }

    async function checkExistingProfile() {
      try {
        const res = await fetch('/api/worker/profile', { credentials: 'include' })
        const json = await res.json()
        if (res.ok && json.data) {
          setIsEditMode(true)
          setForm({
            category: json.data.category ?? '',
            bio: json.data.bio ?? '',
            city: json.data.city ?? '',
            locality: json.data.locality ?? '',
            rate_per_day: json.data.rate_per_day ? String(json.data.rate_per_day) : '',
          })
          setSkills(json.data.skills ?? [])
          setServiceAreas(json.data.service_areas ?? [])
          setPhotoUrl(json.data.photo_url ?? '')
          setWorkPhotos(json.data.work_photos ?? [])
        }
      } catch (err) {
        console.error('Error fetching worker profile:', err)
      } finally {
        setLoadingProfile(false)
      }
    }

    checkExistingProfile()
  }, [user, userLoading])

  if (userLoading || loadingProfile) {
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

  if (user.role === 'tenant' || user.role === 'owner') {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-[#E5E0D5] rounded-[16px] p-8 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#FFF3CD] flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 className="text-[20px] font-bold text-[#1A1814] mb-3">Account already in use</h2>
          <p className="text-[14px] text-[#4A4640] leading-relaxed mb-2">
            Your email <span className="font-semibold text-[#1A1814]">{user.email}</span> and phone number are already registered as a <span className="font-semibold">{user.role === 'owner' ? 'Property Owner' : 'Tenant'}</span>.
          </p>
          <p className="text-[14px] text-[#4A4640] leading-relaxed mb-6">
            Each role requires a separate account. Please sign up with a different email and phone number to register as a worker.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href="/login?tab=signup"
              className="px-5 py-2.5 bg-[#1B2B6B] text-white text-[14px] font-bold rounded-[10px] hover:bg-[#2D3E8C] transition-colors"
            >
              Create a new worker account
            </a>
            <a
              href="/workers"
              className="px-5 py-2.5 bg-[#F5F0E8] text-[#4A4640] text-[14px] font-semibold rounded-[10px] hover:bg-[#EDE8E0] transition-colors"
            >
              Back to Workers
            </a>
          </div>
        </div>
      </div>
    )
  }

  const uploadProfilePhoto = async (file: File) => {
    setUploadingProfile(true)
    try {
      const fd = new FormData(); fd.append('photo', file)
      const res = await fetch('/api/uploads/profile-photo', { method: 'POST', credentials: 'include', body: fd })
      const json = await res.json()
      if (res.ok) setPhotoUrl(json.data.url)
      else setErr(json?.error?.message ?? 'Photo upload failed')
    } catch { setErr('Photo upload failed') }
    finally { setUploadingProfile(false) }
  }

  const uploadWorkPhotos = async (files: FileList) => {
    if (workPhotos.length + files.length > 6) { setErr('Maximum 6 work photos allowed.'); return }
    setUploadingWork(true)
    try {
      const fd = new FormData()
      Array.from(files).forEach(f => fd.append('photos', f))
      const res = await fetch('/api/uploads/listing-photos', { method: 'POST', credentials: 'include', body: fd })
      const json = await res.json()
      if (res.ok) setWorkPhotos(p => [...p, ...(json.data.urls ?? [])])
      else setErr(json?.error?.message ?? 'Work photo upload failed')
    } catch { setErr('Work photo upload failed') }
    finally { setUploadingWork(false) }
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
      const endpoint = isEditMode ? '/api/worker/profile' : '/api/workers'
      const method = isEditMode ? 'PUT' : 'POST'
      const res  = await fetch(endpoint, {
        method,
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
          photo_url: photoUrl || null,
          work_photos: workPhotos,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setErr(json?.error?.message ?? json?.message ?? 'Something went wrong.')
      } else {
        setDone(true)
        setTimeout(() => router.push('/worker/dashboard'), 2500)
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
          <h2 className="text-[22px] font-bold text-[#1A1814] mb-2">
            {isEditMode ? 'Profile updated!' : 'Profile created!'}
          </h2>
          <p className="text-[14px] text-[#4A4640]">
            {isEditMode 
              ? 'Your profile has been updated. Redirecting…' 
              : "You're now listed as a worker. Redirecting…"}
          </p>
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
          <h1 className="text-[28px] font-bold text-[#1A1814] mb-1">
            {isEditMode ? 'Edit Worker Profile' : 'Register as a Worker'}
          </h1>
          <p className="text-[14px] text-[#4A4640]">
            {isEditMode 
              ? 'Update your profile information to keep clients updated.' 
              : 'Fill in your details and start getting hire requests directly.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo */}
          <div>
            <label className="label-uppercase text-[#8A8480] block mb-3">Profile Photo</label>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                {photoUrl ? (
                  <img
                    src={resolveImageUrl(photoUrl)}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#E5E0D5]"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#E8ECF8] flex items-center justify-center border-2 border-dashed border-[#1B2B6B]/30">
                    <Camera size={22} className="text-[#1B2B6B]/50" />
                  </div>
                )}
                {uploadingProfile && (
                  <div className="absolute inset-0 rounded-full bg-white/70 flex items-center justify-center">
                    <Loader2 size={18} className="animate-spin text-[#1B2B6B]" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => profilePhotoRef.current?.click()}
                  disabled={uploadingProfile}
                  className="px-4 py-2 border border-[#1B2B6B] text-[#1B2B6B] text-[13px] font-semibold rounded-[8px] hover:bg-[#E8ECF8] transition-colors disabled:opacity-50"
                >
                  {photoUrl ? 'Change photo' : 'Upload photo'}
                </button>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="flex items-center gap-1 text-[12px] text-[#D84040] hover:underline"
                  >
                    <Trash2 size={11} /> Remove
                  </button>
                )}
              </div>
            </div>
            <input
              ref={profilePhotoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { if (e.target.files?.[0]) uploadProfilePhoto(e.target.files[0]) }}
            />
          </div>

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

          {/* Work Photos */}
          <div>
            <label className="label-uppercase text-[#8A8480] block mb-1">Work Photos</label>
            <p className="text-[12px] text-[#8A8480] mb-3">Show clients examples of your work. Up to 6 photos.</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {workPhotos.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-[8px] overflow-hidden bg-[#F5F0E8]">
                  <img src={resolveImageUrl(url)} alt={`Work ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setWorkPhotos(p => p.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              {workPhotos.length < 6 && (
                <button
                  type="button"
                  onClick={() => workPhotosRef.current?.click()}
                  disabled={uploadingWork}
                  className="aspect-square rounded-[8px] border-2 border-dashed border-[#1B2B6B]/30 flex flex-col items-center justify-center gap-1 hover:bg-[#E8ECF8] transition-colors disabled:opacity-50"
                >
                  {uploadingWork ? (
                    <Loader2 size={18} className="animate-spin text-[#1B2B6B]" />
                  ) : (
                    <>
                      <Plus size={18} className="text-[#1B2B6B]/50" />
                      <span className="text-[10px] text-[#8A8480]">Add photo</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <input
              ref={workPhotosRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => { if (e.target.files?.length) uploadWorkPhotos(e.target.files) }}
            />
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
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Submitting…</>
            ) : (
              isEditMode ? 'Update my worker profile' : 'Create my worker profile'
            )}
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
