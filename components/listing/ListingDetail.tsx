'use client'

import { useEffect, useState } from 'react'
import { MapPin, Heart, Share2, Lock, Phone, MessageSquare, Copy, Check, Wifi, Wind, Zap, Car, Droplets, UtensilsCrossed, ShieldCheck, Layers } from 'lucide-react'
import { VastoqBadge, VerifiedAvatar, Chip } from '@/components/ui/vastoq-badge'
import UnlockGate from './UnlockGate'
import type { Listing } from './ListingCard'

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
  const [activePhoto, setActivePhoto] = useState(0)
  const [saved, setSaved] = useState(false)
  const [showUnlock, setShowUnlock] = useState(false)
  const [unlocked, setUnlocked] = useState(!listing.isLocked)
  const [copied, setCopied] = useState(false)

  const [userId, setUserId] = useState<number | null>(null)

  const [unlockedData, setUnlockedData] = useState<{
    phone?: string
    address?: string
    latitude?: string
    longitude?: string
  } | null>(null)

  const handleUnlockSuccess = (data: any) => {
    setUnlockedData(data)

    setUnlocked(true)

    setShowUnlock(false)
  }

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
        })

        const json = await res.json()

        if (res.ok) {
          setUserId(json.data.id)
        }
      } catch (err) {
        console.error(err)
      }
    }

    loadUser()
  }, [])

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
            <div className="relative" style={{ height: 320 }}>
              {listing.photos.length > 0 ? (
                <img
                  src={listing.photos[activePhoto]}
                  alt={`${listing.title} — photo ${activePhoto + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#E8ECF8] flex items-center justify-center">
                  <span className="text-[#8A8480]">No photos</span>
                </div>
              )}
              <div className="absolute top-3 left-3 flex gap-1.5">
                {listing.isVerified && <VastoqBadge variant="verified" />}
                {listing.isPopular && <VastoqBadge variant="popular" />}
                {listing.isBoosted && <VastoqBadge variant="boosted" />}
              </div>
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => setSaved(!saved)}
                  className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
                  aria-label={saved ? 'Remove from saved' : 'Save listing'}
                >
                  <Heart size={16} className={saved ? 'fill-[#D84040] stroke-[#D84040]' : 'stroke-[#4A4640]'} />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                  }}
                  className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
                  aria-label="Share listing"
                >
                  <Share2 size={16} className="stroke-[#4A4640]" />
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
                    <img src={photo} alt="" className="w-full h-full object-cover" />
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
            <div className="relative rounded-[14px] overflow-hidden border border-[#E5E0D5] h-56 bg-[#E8ECF8] flex items-center justify-center">
              {unlocked ? (
                <div className="text-center">
                  <MapPin size={28} className="text-[#1B2B6B] mx-auto mb-2" />
                  <p className="text-[13px] font-semibold text-[#1B2B6B]">Exact location visible</p>
                 <p className="text-[11px] text-[#4A4640]">
                  {listing.locality}
                </p>

                {(
                  unlockedData?.latitude ||
                  listing.latitude
                ) &&
                (
                  unlockedData?.longitude ||
                  listing.longitude
                ) && (
                  <p className="text-[11px] text-[#8A8480] mt-1">
                    {unlockedData?.latitude || listing.latitude},
                    {' '}
                    {unlockedData?.longitude || listing.longitude}
                  </p>
                )}
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full border-4 border-[#1B2B6B]/30 bg-[#1B2B6B]/10 flex items-center justify-center mx-auto mb-3">
                    <Lock size={20} className="text-[#1B2B6B]" />
                  </div>
                  <p className="text-[13px] font-semibold text-[#1A1814] mb-1">Approximate area shown</p>
                  <p className="text-[12px] text-[#4A4640] mb-3">Unlock to see exact location — ₹20</p>
                  <button
                    onClick={() => setShowUnlock(true)}
                    className="px-4 py-2 bg-[#1B2B6B] text-white text-[13px] font-semibold rounded-[8px] hover:bg-[#2D3E8C] transition-colors"
                  >
                    Unlock location
                  </button>
                </div>
              )}
            </div>
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
                <div className="flex items-center gap-2 p-3 bg-[#E1F5EE] rounded-[10px]">
                  <Phone size={15} className="text-[#1D9E75]" />
                  <span className="text-[14px] font-bold text-[#1A1814] flex-1">
                    {unlockedData?.phone
  ? `+91 ${unlockedData.phone}`
  : 'Phone unavailable'}
                  </span>
                  <button
                    onClick={() => {
const phone =
  unlockedData?.phone

  if (phone) {
    navigator.clipboard.writeText(phone)
  }

  setCopied(true)

  setTimeout(() => {
    setCopied(false)
  }, 2000)
}}
                    className="p-1.5 rounded-[6px] hover:bg-[#1D9E75]/10 transition-colors"
                    aria-label="Copy phone number"
                  >
                    {copied ? <Check size={13} className="text-[#1D9E75]" /> : <Copy size={13} className="text-[#4A4640]" />}
                  </button>
                </div>
                <button className="w-full flex items-center justify-center gap-2 py-3 bg-[#1B2B6B] text-white text-[14px] font-bold rounded-[10px] hover:bg-[#2D3E8C] transition-colors min-h-[48px]">
                  <MessageSquare size={16} />
                  Message owner
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <button
                  onClick={() => setShowUnlock(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#1B2B6B] text-white text-[14px] font-bold rounded-[10px] hover:bg-[#2D3E8C] transition-colors min-h-[48px]"
                >
                  <Lock size={16} />
                  Message owner — ₹20
                </button>
                <button
                  onClick={() => setShowUnlock(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-[#1B2B6B] text-[#1B2B6B] text-[14px] font-bold rounded-[10px] hover:bg-[#E8ECF8] transition-colors min-h-[48px]"
                >
                  <Phone size={16} />
                  Call owner — ₹20
                </button>
                <p className="text-[11px] text-[#8A8480] text-center">
                  Unlock once to get contact + exact location
                </p>
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
          userId={userId || 0}
          subjectName={listing.title}
          subjectLocality={listing.locality}
          onClose={() => setShowUnlock(false)}
          onSuccess={handleUnlockSuccess}
        />
      )}
    </div>
  )
}
