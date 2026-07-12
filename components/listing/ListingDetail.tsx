'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { MapPin, Heart, Share2, Lock, Phone, MessageSquare, Copy, Check, Wifi, Wind, Zap, Car, Droplets, UtensilsCrossed, ShieldCheck, Layers, FileText, Loader2, X, Send, User } from 'lucide-react'
import { toast } from 'sonner'
import { VastoqBadge, VerifiedAvatar, Chip } from '@/components/ui/vastoq-badge'
import { resolveImageUrl } from '@/lib/utils'
import UnlockGate from './UnlockGate'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import type { Listing } from './ListingCard'
import { usePrices } from '@/hooks/usePrices'

// Leaflet must not be server-side rendered
const ListingMap = dynamic(() => import('./ListingMap'), {
  ssr: false,
  loading: () => (
    <div className="h-56 rounded-[14px] bg-[#E8ECF8] animate-pulse border border-[#E5E0D5]" />
  ),
})

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi size={14} />,
  AC: <Wind size={14} />,
  Generator: <Zap size={14} />,
  Parking: <Car size={14} />,
  'Water 24hr': <Droplets size={14} />,
  'Meals included': <UtensilsCrossed size={14} />,
  Security: <ShieldCheck size={14} />,
  Elevator: <Layers size={14} />,
  CCTV: <ShieldCheck size={14} />,
  Geyser: <Droplets size={14} />,
}

// const MOCK_AMENITIES = ['WiFi', 'AC', 'Parking', 'Water 24hr', 'Security']

interface ListingDetailProps {
  listing: Listing
}

export default function ListingDetail({ listing }: ListingDetailProps) {
  const { user } = useCurrentUser()
  const router = useRouter()
  const prices = usePrices()

  const [activePhoto, setActivePhoto] = useState(0)
  const [saved,       setSaved]       = useState(listing.isSaved ?? false)
  const [saving,      setSaving]      = useState(false)
  const [showUnlock,  setShowUnlock]  = useState(false)
  const [unlocked,    setUnlocked]    = useState(!listing.isLocked)
  const [copied,      setCopied]      = useState(false)
  const [showAgreementForm, setShowAgreementForm] = useState(false)
  const [agreementLoading, setAgreementLoading]   = useState(false)
  const [agreementForm, setAgreementForm] = useState({
    tenant_name: '', tenant_phone: '', tenant_address: '',
    tenant_aadhaar: '', start_date: '', duration_months: '11',
  })

  // Keep saved in sync if the listing prop changes (e.g. after navigation)
  useEffect(() => { setSaved(listing.isSaved ?? false) }, [listing.id])

  // Pre-fill enquiry form from logged-in user profile
  useEffect(() => {
    if (!user?.userId) return
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(json => {
        const u = json.data ?? {}
        if (u.name)  setEnquiryName(u.name)
        if (u.phone) setEnquiryPhone(u.phone)
      })
      .catch(() => {})
  }, [user?.userId])

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (saving) return
    if (!user?.userId) { router.push('/login'); return }
    const next = !saved
    setSaved(next)
    try {
      setSaving(true)
      const res  = await fetch('/api/saved-listings/toggle', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listing.id }),
      })
      const json = await res.json()
      if (res.ok) {
        setSaved(json.data.saved)
        toast.success(
          json.data.saved ? 'Added to saved listings' : 'Removed from saved listings',
          { duration: 2500 }
        )
      } else {
        setSaved(!next) // revert on error
      }
    } catch {
      setSaved(!next)
    } finally {
      setSaving(false)
    }
  }

  // Guard: redirect to login if not authenticated when trying to unlock
  const openUnlock = () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/rentals/${listing.id}`)}`)
      return
    }
    setShowUnlock(true)
  }

  const [unlockedData, setUnlockedData] = useState<{
    phone?: string
    email?: string
    name?: string
    verified?: boolean
    address?: string
    latitude?: string
    longitude?: string
  } | null>(null)


  const handleUnlockSuccess = (data: any) => {
    setUnlockedData(data)
    setUnlocked(true)
    setShowUnlock(false)
  }

  // Removed handleEnquiry — Get Contact Details now directly opens the UnlockGate modal

  // Check existing unlock on mount (so returning users see contact immediately)
  useEffect(() => {
    if (!user?.userId || listing.isLocked === false) return

    async function checkExistingUnlock() {
      try {
        const res  = await fetch(`/api/listings/${listing.id}/unlock-status`, {
          credentials: 'include',
        })
        if (!res.ok) return
        const json = await res.json()
        if (json.data?.unlocked) {
          setUnlockedData(json.data)
          setUnlocked(true)
        }
      } catch { /* silent */ }
    }

    checkExistingUnlock()
  }, [user, listing.id, listing.isLocked])

  // Fetch real saved status on mount — listing.isSaved is not auth-aware server-side
  useEffect(() => {
    if (!user?.userId) return

    async function checkSavedStatus() {
      try {
        const res = await fetch(
          `/api/saved-listings/status?listing_id=${listing.id}`,
          { credentials: 'include' }
        )
        if (!res.ok) return
        const json = await res.json()
        setSaved(json.data?.saved ?? false)
      } catch { /* silent — optimistic state stays as-is */ }
    }

    checkSavedStatus()
  }, [user?.userId, listing.id])


  const handleGenerateAgreement = async () => {
    if (!agreementForm.tenant_name || !agreementForm.tenant_phone || !agreementForm.start_date) return
    setAgreementLoading(true)
    try {
      const res = await fetch(`/api/rental-agreement/${listing.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...agreementForm, duration_months: Number(agreementForm.duration_months) }),
      })
      if (!res.ok) { toast.error('Failed to generate agreement. Please try again.'); return }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `vastoq-agreement-${listing.id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      setShowAgreementForm(false)
      toast.success('Agreement downloaded!')
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setAgreementLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[12px] text-[#8A8480] mb-6" aria-label="Breadcrumb">
        <a href="/rentals" className="hover:text-[#1B2B6B]">Rentals</a>
        <span>/</span>
        <span className="text-[#1A1814]">{listing.locality}</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
        {/* LEFT: Content */}
        <div>
          {/* Photo gallery */}
          <div className="rounded-[18px] overflow-hidden mb-6">
            <div className="relative bg-[#1A1814]">
              {listing.photos.length > 0 ? (
                <img
                  src={resolveImageUrl(listing.photos[activePhoto])}
                  alt={`${listing.title} — photo ${activePhoto + 1}`}
                  className="w-full object-contain max-h-[480px]"
                />
              ) : (
                <div className="w-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#E8ECF8] to-[#F5F0E8] py-20">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="opacity-30">
                    <rect x="3" y="5" width="18" height="14" rx="3" stroke="#1B2B6B" strokeWidth="1.5"/>
                    <circle cx="8.5" cy="10.5" r="1.5" stroke="#1B2B6B" strokeWidth="1.5"/>
                    <path d="M3 15l4-4 3 3 3-4 5 6" stroke="#1B2B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="text-[13px] font-semibold text-[#1B2B6B]/40">No photos uploaded yet</p>
                  <p className="text-[11px] text-[#8A8480]">Contact the owner for more details</p>
                </div>
              )}
              <div className="absolute top-3 left-3 flex gap-1.5">
                {listing.isVerified && <VastoqBadge variant="verified" />}
                {listing.isPopular && <VastoqBadge variant="popular" />}
                {listing.isBoosted && <VastoqBadge variant="boosted" />}
              </div>
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={handleToggleSave}
                  disabled={saving}
                  className={`w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 transition-all duration-150 ${saving ? 'opacity-60' : ''}`}
                  aria-label={saved ? 'Remove from saved' : 'Save listing'}
                >
                  <Heart size={16} className={saved ? 'fill-[#D84040] stroke-[#D84040]' : 'stroke-[#4A4640]'} />
                </button>
                <button
                  onClick={() => {
                    const url = `${process.env.NEXT_PUBLIC_APP_URL}/rentals/${listing.id}`
                    const text = `🏠 *${listing.title}* — Vastoq\n📍 ${listing.locality}, ${listing.city}\n💰 ₹${listing.rent.toLocaleString('en-IN')}/month\n\n🔗 ${url}\n\n_Verified rental listing on Vastoq_`
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
                  }}
                  className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 transition-all duration-150"
                  aria-label="Share on WhatsApp"
                >
                  <Send size={15} className="stroke-[#25D366]" />
                </button>
                <button
                  onClick={() => {
                    const url = `${process.env.NEXT_PUBLIC_APP_URL}/rentals/${listing.id}`
                    navigator.clipboard.writeText(url)
                    toast.success('Link copied!', { duration: 2000 })
                  }}
                  className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 transition-all duration-150"
                  aria-label="Copy link"
                >
                  <Share2 size={15} className="stroke-[#4A4640]" />
                </button>
              </div>
            </div>
            {/* Thumbnails */}
            {listing.photos.length > 1 && (
              <div className="flex gap-2 mt-2">
                {listing.photos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(i)}
                    className={`w-16 h-12 rounded-[8px] overflow-hidden border-2 transition-colors flex-shrink-0 ${i === activePhoto ? 'border-[#1B2B6B]' : 'border-transparent'}`}
                    aria-label={`View photo ${i + 1}`}
                    aria-pressed={i === activePhoto}
                  >
                    <img src={resolveImageUrl(photo)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title + chips */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="text-[22px] font-bold text-[#1A1814] leading-snug">{listing.title}</h1>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <MapPin size={14} className="text-[#8A8480]" />
            <span className="text-[13px] text-[#4A4640]">{listing.locality}</span>
            <Chip variant="indigo">{listing.propertyType}</Chip>
            {listing.furnishing && <Chip variant="default">{listing.furnishing}</Chip>}
          </div>

          {/* Key specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Rent', value: `₹${listing.rent.toLocaleString('en-IN')}/mo` },
              { label: 'Deposit', value: `₹${listing.deposit.toLocaleString('en-IN')}` },
              ...(listing.areaSqft ? [{ label: 'Size', value: `${listing.areaSqft} sqft` }] : []),
              ...(listing.floor !== undefined ? [{ label: 'Floor', value: String(listing.floor) }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#F5F0E8] rounded-[12px] p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A8480] mb-1">{label}</p>
                <p className="text-[15px] font-bold text-[#1B2B6B]">{value}</p>
              </div>
            ))}
          </div>

          {/* Amenities */}
          <div className="mb-6">
            <h2 className="text-[16px] font-bold text-[#1A1814] mb-3">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {(listing.amenities ?? []).map((a) => (
                <div
                  key={a}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E0D5] text-[12px] text-[#4A4640]"
                >
                  <span className="text-[#1B2B6B]">{AMENITY_ICONS[a] ?? null}</span>
                  {String(a)}
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-[16px] font-bold text-[#1A1814] mb-2">Description</h2>
            <p className="text-[13px] text-[#4A4640] leading-relaxed whitespace-pre-wrap">
              {listing.description || 'No description available.'}
            </p>
          </div>

          {/* Map section */}
          <div className="mb-6">
            <h2 className="text-[16px] font-bold text-[#1A1814] mb-3">Location</h2>

            {/* Resolve coordinates: prefer unlocked data, fall back to listing coords */}
            {(() => {
              const lat = parseFloat(String(unlockedData?.latitude  ?? listing.latitude  ?? ''))
              const lng = parseFloat(String(unlockedData?.longitude ?? listing.longitude ?? ''))

              if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
                // No coordinates at all — show text-only fallback
                return (
                  <div className="h-56 rounded-[14px] border border-[#E5E0D5] bg-[#E8ECF8] flex items-center justify-center">
                    <div className="text-center">
                      <MapPin size={22} className="text-[#1B2B6B] mx-auto mb-2" />
                      <p className="text-[13px] font-semibold text-[#1A1814]">{listing.locality}</p>
                      {!unlocked && (
                        <button
                          onClick={openUnlock}
                          className="mt-3 px-4 py-2 bg-[#1B2B6B] text-white text-[13px] font-semibold rounded-[8px] hover:bg-[#2D3E8C] transition-colors"
                        >
                          Unlock location
                        </button>
                      )}
                    </div>
                  </div>
                )
              }

              return (
                <>
                  <ListingMap
                    lat={lat}
                    lng={lng}
                    unlocked={unlocked}
                    locality={listing.locality}
                  />
                  {!unlocked && (
                    <button
                      onClick={openUnlock}
                      className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 border border-[#1B2B6B] text-[#1B2B6B] text-[13px] font-semibold rounded-[10px] hover:bg-[#E8ECF8] transition-colors"
                    >
                      <Lock size={14} />
                      Unlock to narrow down location
                    </button>
                  )}
                </>
              )
            })()}
          </div>

          {/* Reviews */}
          <div>
            <h2 className="text-[16px] font-bold text-[#1A1814] mb-3">Reviews</h2>
            <div className="bg-[#F5F0E8] rounded-[14px] p-5 text-center">
              <p className="text-[13px] text-[#8A8480]">
                Reviews are visible only after unlocking this listing.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: Sticky contact card */}
        <div className="lg:sticky lg:top-20">
          <div className="bg-white rounded-[18px] border border-[#E5E0D5] shadow-vastoq-md p-5">
            {/* Price */}
            <div className="mb-5 pb-5 border-b border-[#F5F0E8]">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[26px] font-extrabold text-[#1B2B6B]">₹{listing.rent.toLocaleString('en-IN')}</span>
                <span className="text-[14px] text-[#8A8480]">/month</span>
              </div>
              <div className="text-[12px] text-[#4A4640] mt-0.5">
                Security deposit: ₹{listing.deposit.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Owner */}
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-[#F5F0E8]">
              <VerifiedAvatar name={listing.owner.name} src={listing.owner.avatar} size={44} verified={listing.owner.verified} />
              <div>
                <p className="text-[14px] font-semibold text-[#1A1814]">{listing.owner.name}</p>
                {listing.owner.verified && (
                  <p className="text-[11px] text-[#1D9E75] font-medium">ID Verified owner</p>
                )}
              </div>
            </div>

            {/* Trust signals */}
            <div className="space-y-2 mb-5 text-[12px] text-[#4A4640]">
              {listing.owner.verified && (
                <div className="flex items-center gap-2"><ShieldCheck size={13} className="text-[#1D9E75]" /> Identity verified</div>
              )}
              <div className="flex items-center gap-2"><MessageSquare size={13} className="text-[#1B2B6B]" /> Usually responds within 2 hours</div>
            </div>

            {/* CTA buttons */}
            {unlocked ? (
              <div className="space-y-2.5">
                {/* Owner contact */}
                <div className="flex items-center gap-2 p-3 bg-[#E1F5EE] rounded-[10px]">
                  <Phone size={15} className="text-[#1D9E75]" />
                  <span className="text-[14px] font-bold text-[#1A1814] flex-1">
                    {unlockedData?.phone ? `+91 ${unlockedData.phone}` : 'Phone unavailable'}
                  </span>
                  <button
                    onClick={() => {
                      if (unlockedData?.phone) navigator.clipboard.writeText(unlockedData.phone)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="p-1.5 rounded-[6px] hover:bg-[#1D9E75]/10 transition-colors"
                    aria-label="Copy phone number"
                  >
                    {copied ? <Check size={13} className="text-[#1D9E75]" /> : <Copy size={13} className="text-[#4A4640]" />}
                  </button>
                </div>

                {unlockedData?.phone && (
                  <a
                    href={`https://wa.me/91${unlockedData.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white text-[14px] font-bold rounded-[10px] hover:bg-[#1ebe5c] transition-colors min-h-[48px]"
                  >
                    <MessageSquare size={16} />
                    WhatsApp owner
                  </a>
                )}

                {/* Vastoq support */}
                <div className="rounded-[10px] border border-[#E5E0D5] p-3 space-y-2">
                  <p className="text-[11px] font-bold text-[#4A4640] uppercase tracking-wide">Also contact Vastoq support</p>
                  {process.env.NEXT_PUBLIC_SUPPORT_PHONE && (
                    <a
                      href={`https://wa.me/91${process.env.NEXT_PUBLIC_SUPPORT_PHONE.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[13px] text-[#1B2B6B] font-semibold hover:underline"
                    >
                      <Phone size={13} className="text-[#1B2B6B]" /> +91 {process.env.NEXT_PUBLIC_SUPPORT_PHONE}
                    </a>
                  )}
                  <a
                    href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@vastoq.in'}`}
                    className="flex items-center gap-2 text-[13px] text-[#1B2B6B] font-semibold hover:underline"
                  >
                    <MessageSquare size={13} className="text-[#1B2B6B]" /> {process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@vastoq.in'}
                  </a>
                </div>

                {/* Rental agreement — only for the listing's own owner */}
                {user?.userId && listing.ownerId && user.userId === listing.ownerId && (
                  <button
                    onClick={() => setShowAgreementForm(!showAgreementForm)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#E5E0D5] text-[#4A4640] text-[13px] font-semibold rounded-[10px] hover:border-[#1B2B6B] hover:text-[#1B2B6B] transition-colors"
                  >
                    <FileText size={15} />
                    Generate rental agreement PDF
                  </button>
                )}

                {/* Rental agreement form */}
                {showAgreementForm && (
                  <div className="mt-2 p-4 bg-[#FAFAF8] border border-[#E5E0D5] rounded-[12px] space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[13px] font-bold text-[#1A1814]">Tenant details</p>
                      <button onClick={() => setShowAgreementForm(false)} className="text-[#8A8480] hover:text-[#D84040]"><X size={14} /></button>
                    </div>
                    {[
                      { key: 'tenant_name',    label: 'Full name *',          type: 'text',  placeholder: 'Tenant full name' },
                      { key: 'tenant_phone',   label: 'Phone *',              type: 'tel',   placeholder: '10-digit number' },
                      { key: 'tenant_address', label: 'Current address *',    type: 'text',  placeholder: 'Current residential address' },
                      { key: 'tenant_aadhaar', label: 'Aadhaar (optional)',   type: 'text',  placeholder: '12-digit Aadhaar number' },
                      { key: 'start_date',     label: 'Lease start date *',   type: 'date',  placeholder: '' },
                    ].map(({ key, label, type, placeholder }) => (
                      <div key={key}>
                        <label className="block text-[11px] font-semibold text-[#4A4640] mb-1">{label}</label>
                        <input
                          type={type}
                          placeholder={placeholder}
                          value={agreementForm[key as keyof typeof agreementForm]}
                          onChange={(e) => setAgreementForm((p) => ({ ...p, [key]: e.target.value }))}
                          className="w-full px-3 py-2 border border-[#E5E0D5] rounded-[8px] text-[13px] text-[#1A1814] placeholder:text-[#8A8480] focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#4A4640] mb-1">Duration (months) *</label>
                      <select
                        value={agreementForm.duration_months}
                        onChange={(e) => setAgreementForm((p) => ({ ...p, duration_months: e.target.value }))}
                        className="w-full px-3 py-2 border border-[#E5E0D5] rounded-[8px] text-[13px] text-[#1A1814] focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30"
                      >
                        {[6,11,12,24,36].map((m) => <option key={m} value={m}>{m} months</option>)}
                      </select>
                    </div>
                    <button
                      onClick={handleGenerateAgreement}
                      disabled={agreementLoading || !agreementForm.tenant_name || !agreementForm.tenant_phone || !agreementForm.start_date}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1B2B6B] text-white text-[13px] font-bold rounded-[8px] hover:bg-[#2D3E8C] disabled:opacity-60 transition-colors"
                    >
                      {agreementLoading ? <><Loader2 size={14} className="animate-spin" /> Generating…</> : <><FileText size={14} /> Download PDF</>}
                    </button>
                    <p className="text-[10px] text-[#8A8480]">A draft agreement is generated. Print on stamp paper as per Assam Stamp Act before signing.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[13px] text-[#4A4640] leading-relaxed">
                  Unlock to view the owner's phone number and exact address instantly.
                </p>

                <button
                  onClick={openUnlock}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#1B2B6B] text-white text-[14px] font-bold rounded-[10px] hover:bg-[#2D3E8C] transition-colors min-h-[48px]"
                >
                  <Phone size={16} /> Get Contact Details
                </button>

                <button
                  onClick={() => {
                    const url = `${process.env.NEXT_PUBLIC_APP_URL}/rentals/${listing.id}`
                    const text = `🏠 *${listing.title}* — Vastoq\n📍 ${listing.locality}, ${listing.city}\n💰 ₹${listing.rent.toLocaleString('en-IN')}/month\n\n🔗 ${url}\n\n_Verified rental listing on Vastoq_`
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#25D366] text-[#25D366] text-[13px] font-semibold rounded-[10px] hover:bg-[#25D366]/10 transition-colors"
                >
                  <Send size={14} />
                  Share on WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unlock modal */}
      {showUnlock && (
        <UnlockGate
          type="listing"
          targetId={listing.id}
          subjectName={listing.title}
          subjectLocality={listing.locality}
          onClose={() => setShowUnlock(false)}
          onSuccess={handleUnlockSuccess}
        />
      )}
    </div>
  )
}
