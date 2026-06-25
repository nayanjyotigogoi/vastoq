'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Heart, MapPin, Lock, ShieldCheck, Star, Zap,
  BedDouble, Maximize2, Layers, Sofa, ArrowRight, Camera
} from 'lucide-react'
import { VerifiedAvatar } from '@/components/ui/vastoq-badge'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { cn } from '@/lib/utils'
import type { Listing } from './ListingCard'

// Colour-coded BHK — same palette as map markers
const BHK_COLOR: Record<string, { bg: string; text: string }> = {
  '1rk':  { bg: '#F59E0B', text: '#fff' },
  '1bhk': { bg: '#EC4899', text: '#fff' },
  '2bhk': { bg: '#8B5CF6', text: '#fff' },
  '3bhk': { bg: '#10B981', text: '#fff' },
  '4bhk': { bg: '#3B82F6', text: '#fff' },
  '5bhk': { bg: '#EF4444', text: '#fff' },
  'pg':   { bg: '#06B6D4', text: '#fff' },
  'house':{ bg: '#84CC16', text: '#1A1814' },
}
const DEFAULT_COLOR = { bg: '#1B2B6B', text: '#fff' }

function getBhkLabel(raw?: string, bhk?: number, type?: string) {
  if (raw === '1rk')         return '1 RK'
  if (raw?.endsWith('bhk'))  return `${raw.replace('bhk', '')} BHK`
  if (raw === 'pg')          return 'PG'
  if (raw === 'house')       return 'House'
  if (bhk)                   return `${bhk} BHK`
  return type ?? ''
}

interface ListingRowProps {
  listing: Listing
  index: number
}

export default function ListingRow({ listing, index }: ListingRowProps) {
  const { user, loading } = useCurrentUser()
  const [saved,  setSaved]  = useState((listing as any).isSaved ?? false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { setSaved((listing as any).isSaved ?? false) }, [listing])

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (loading || saving) return
    if (!user?.userId) { window.location.href = '/login'; return }
    try {
      setSaving(true)
      const res  = await fetch('/api/saved-listings/toggle', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listing.id }),
      })
      const json = await res.json()
      if (res.ok) setSaved(json.saved)
    } catch { /* silent */ } finally { setSaving(false) }
  }

  const color    = BHK_COLOR[listing.bhkRaw ?? ''] ?? DEFAULT_COLOR
  const bhkLabel = getBhkLabel(listing.bhkRaw, listing.bhk, listing.propertyType)
  const photo    = listing.photos[0]

  const specs = [
    listing.areaSqft  && { icon: Maximize2,  label: `${listing.areaSqft} sqft` },
    listing.floor !== undefined && { icon: Layers,    label: `Floor ${listing.floor}` },
    listing.furnishing && { icon: Sofa, label: listing.furnishing === 'Semi-furnished' ? 'Semi-furn.' : listing.furnishing },
  ].filter(Boolean) as { icon: React.ElementType; label: string }[]

  return (
    <Link
      href={`/rentals/${listing.id}`}
      className="group block bg-white border border-[#E5E0D5] rounded-[16px] overflow-hidden
                 shadow-[0_1px_6px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.10)]
                 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex flex-col sm:flex-row">

        {/* ── Photo ── */}
        <div className="relative flex-shrink-0 overflow-hidden sm:w-56 md:w-64" style={{ minHeight: 180 }}>
          {photo ? (
            <img
              src={photo}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-400"
              style={{ minHeight: 180 }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#E8ECF8] to-[#D0D8F0] flex items-center justify-center" style={{ minHeight: 180 }}>
              <MapPin size={24} className="text-[#1B2B6B]/25" />
            </div>
          )}

          {/* BHK pill overlaid on photo */}
          <div className="absolute top-2.5 left-2.5">
            <span
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-sm"
              style={{ background: color.bg, color: color.text }}
            >
              {bhkLabel}
            </span>
          </div>

          {/* Photo count */}
          {listing.photos.length > 1 && (
            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
              <Camera size={9} className="text-white" />
              <span className="text-white text-[10px] font-medium">{listing.photos.length}</span>
            </div>
          )}

          {/* Status badges stacked bottom-right on photo */}
          <div className="absolute bottom-2.5 right-2.5 flex flex-col items-end gap-1">
            {listing.isVerified && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#1D9E75] text-white text-[9px] font-bold uppercase tracking-wide">
                <ShieldCheck size={8} strokeWidth={2.5} /> Verified
              </span>
            )}
            {listing.isPopular && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#E8A020] text-white text-[9px] font-bold uppercase tracking-wide">
                <Star size={8} strokeWidth={2.5} /> Popular
              </span>
            )}
          </div>
        </div>

        {/* ── Details ── */}
        <div className="flex flex-col flex-1 p-4 min-w-0">

          {/* Top row: price + save */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[20px] font-extrabold text-[#1B2B6B] leading-none" style={{ letterSpacing: '-0.5px' }}>
                  ₹{(listing.rent ?? 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[12px] text-[#8A8480]">/mo</span>
              </div>
              {listing.deposit > 0 && (
                <p className="text-[11px] text-[#8A8480] mt-0.5">
                  Deposit ₹{listing.deposit.toLocaleString('en-IN')}
                </p>
              )}
            </div>

            <button
              onClick={handleToggleSave}
              disabled={saving || loading}
              className={cn(
                'flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all',
                saved
                  ? 'border-[#D84040] bg-red-50'
                  : 'border-[#E5E0D5] bg-white hover:border-[#D84040] hover:bg-red-50',
                saving && 'opacity-50'
              )}
              aria-label={saved ? 'Remove from saved' : 'Save listing'}
            >
              <Heart size={14} className={saved ? 'fill-[#D84040] stroke-[#D84040]' : 'stroke-[#8A8480]'} />
            </button>
          </div>

          {/* Title */}
          <h3 className="text-[15px] font-semibold text-[#1A1814] line-clamp-1 mb-1 leading-snug">
            {listing.title}
          </h3>

          {/* Locality */}
          <div className="flex items-center gap-1.5 mb-3">
            <MapPin size={12} className="text-[#8A8480] flex-shrink-0" />
            <span className="text-[12px] text-[#4A4640] truncate">{listing.locality}</span>
          </div>

          {/* Spec chips */}
          {specs.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {specs.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F5F0E8] text-[11px] font-medium text-[#4A4640]"
                >
                  <Icon size={10} className="text-[#8A8480]" />
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Description snippet */}
          {listing.description && (
            <p className="text-[12px] text-[#8A8480] line-clamp-2 leading-relaxed mb-3 flex-1">
              {listing.description}
            </p>
          )}

          {/* Bottom row: owner + CTA */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#F5F0E8] mt-auto">
            <div className="flex items-center gap-2 min-w-0">
              <VerifiedAvatar
                name={listing.owner.name}
                src={listing.owner.avatar}
                size={26}
                verified={listing.owner.verified}
              />
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-[#1A1814] truncate leading-none">
                  {listing.owner.name}
                </p>
                {listing.owner.verified && (
                  <p className="text-[10px] text-[#1D9E75] font-medium mt-0.5">Verified owner</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {listing.isLocked ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B2B6B] text-white text-[11px] font-bold">
                  <Lock size={10} /> Unlock contact
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E1F5EE] text-[#1D9E75] text-[11px] font-bold">
                  <ShieldCheck size={10} /> Contact available
                </span>
              )}
              <ArrowRight
                size={14}
                className="text-[#8A8480] group-hover:text-[#1B2B6B] group-hover:translate-x-0.5 transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
