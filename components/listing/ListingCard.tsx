'use client'

import Link from 'next/link'
import { Heart, MapPin, Camera, Lock, ShieldCheck, Zap, Star } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { VerifiedAvatar } from '@/components/ui/vastoq-badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export interface Listing {
  id: string
  title: string
  locality: string
  rent: number
  deposit: number
  bhk?: number
  areaSqft?: number
  floor?: number
  furnishing?: 'Furnished' | 'Semi-furnished' | 'Unfurnished'
  propertyType: 'Flat' | 'PG' | 'Room' | 'Shared Room' | 'House' | 'Office' | 'Shop' | 'Warehouse'
  photos: string[]
  isVerified?: boolean
  isPopular?: boolean
  isBoosted?: boolean
  isCommercial?: boolean
  isSaved?: boolean
  owner: {
    name: string
    phone?: string
    avatar?: string
    verified?: boolean
  }
  isLocked?: boolean
  description?: string
  amenities?: string[]
  latitude?: number
  longitude?: number
  bhkRaw?: string
  phone?: string
}

// BHK → colour that matches the map markers
const BHK_COLOR: Record<string, { bg: string; text: string; glow: string }> = {
  '1rk':  { bg: '#F59E0B', text: '#fff', glow: '#F59E0B33' },
  '1bhk': { bg: '#EC4899', text: '#fff', glow: '#EC489933' },
  '2bhk': { bg: '#8B5CF6', text: '#fff', glow: '#8B5CF633' },
  '3bhk': { bg: '#10B981', text: '#fff', glow: '#10B98133' },
  '4bhk': { bg: '#3B82F6', text: '#fff', glow: '#3B82F633' },
  '5bhk': { bg: '#EF4444', text: '#fff', glow: '#EF444433' },
  'pg':   { bg: '#06B6D4', text: '#fff', glow: '#06B6D433' },
  'house':{ bg: '#84CC16', text: '#fff', glow: '#84CC1633' },
}
const DEFAULT_COLOR = { bg: '#1B2B6B', text: '#fff', glow: '#1B2B6B33' }

function getBhkLabel(bhkRaw?: string, bhk?: number, propertyType?: string): string {
  if (bhkRaw === '1rk') return '1 RK'
  if (bhkRaw?.endsWith('bhk')) return `${bhkRaw.replace('bhk', '')} BHK`
  if (bhkRaw === 'pg') return 'PG'
  if (bhkRaw === 'house') return 'House'
  if (bhk) return `${bhk} BHK`
  return propertyType ?? ''
}

interface ListingCardProps {
  listing: Listing
  photoHeight?: number
  className?: string
}

export default function ListingCard({ listing, photoHeight = 220, className }: ListingCardProps) {
  const { user, loading } = useCurrentUser()
  const [saved,  setSaved]  = useState((listing as any).isSaved ?? false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { setSaved((listing as any).isSaved ?? false) }, [listing])

  const coverPhoto = listing.photos[0]
  const color      = BHK_COLOR[listing.bhkRaw ?? ''] ?? DEFAULT_COLOR
  const bhkLabel   = getBhkLabel(listing.bhkRaw, listing.bhk, listing.propertyType)
  const rentStr    = `₹${(listing.rent ?? 0).toLocaleString('en-IN')}`
  const depositStr = listing.deposit ? `₹${listing.deposit.toLocaleString('en-IN')} dep.` : null

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (loading || saving) return
    if (!user?.userId) { window.location.href = '/login'; return }
    const next = !saved
    setSaved(next)
    try {
      setSaving(true)
      const res  = await fetch('/api/saved-listings/toggle', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listing.id }),
      })
      const json = await res.json()
      if (res.ok) {
        setSaved(json.data.saved)
        toast.success(json.data.saved ? 'Added to saved listings' : 'Removed from saved listings', {
          duration: 2500,
        })
      } else {
        setSaved(!next)
      }
    } catch {
      setSaved(!next)
    } finally { setSaving(false) }
  }

  return (
    <Link
      href={`/rentals/${listing.id}`}
      className={cn(
        'group block bg-white rounded-[18px] overflow-hidden border border-[#E5E0D5]',
        'shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.13)]',
        'transition-all duration-300 hover:-translate-y-1',
        className
      )}
    >
      {/* ── Photo ── */}
      <div className="relative overflow-hidden" style={{ height: photoHeight }}>
        {coverPhoto ? (
          <img
            src={coverPhoto}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#E8ECF8] to-[#D0D8F0] flex items-center justify-center">
            <MapPin size={28} className="text-[#1B2B6B]/30" />
          </div>
        )}

        {/* Bottom gradient for overlay legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

        {/* Top-left: status badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {listing.isVerified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1D9E75] text-white text-[10px] font-bold uppercase tracking-wide shadow-sm">
              <ShieldCheck size={9} strokeWidth={2.5} /> Verified
            </span>
          )}
          {listing.isPopular && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E8A020] text-white text-[10px] font-bold uppercase tracking-wide shadow-sm">
              <Star size={9} strokeWidth={2.5} /> Popular
            </span>
          )}
          {listing.isBoosted && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/90 text-[#1B2B6B] text-[10px] font-bold uppercase tracking-wide shadow-sm">
              <Zap size={9} strokeWidth={2.5} /> Featured
            </span>
          )}
        </div>

        {/* Top-right: save button */}
        <button
          className={cn(
            'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center',
            'bg-white/90 backdrop-blur-sm shadow-sm',
            'hover:bg-white hover:scale-110 transition-all duration-150',
            saving && 'opacity-60'
          )}
          onClick={handleToggleSave}
          disabled={saving || loading}
          aria-label={saved ? 'Remove from saved' : 'Save listing'}
        >
          <Heart
            size={15}
            className={cn(
              'transition-colors',
              saved ? 'fill-[#D84040] stroke-[#D84040]' : 'stroke-[#4A4640]'
            )}
          />
        </button>

        {/* Bottom-left: BHK type badge (colour-coded) */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          {bhkLabel && (
            <span
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-sm"
              style={{ background: color.bg, color: color.text }}
            >
              {bhkLabel}
            </span>
          )}
          {listing.furnishing && (
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/90 text-[#1A1814] shadow-sm">
              {listing.furnishing === 'Semi-furnished' ? 'Semi-furn.' : listing.furnishing}
            </span>
          )}
        </div>

        {/* Bottom-right: photo count */}
        {listing.photos.length > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
            <Camera size={10} className="text-white" />
            <span className="text-white text-[10px] font-medium">{listing.photos.length}</span>
          </div>
        )}
      </div>

      {/* ── Card body ── */}
      <div className="p-4">

        {/* Price row */}
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[22px] font-extrabold text-[#1B2B6B] leading-none" style={{ letterSpacing: '-0.5px' }}>
              {rentStr}
            </span>
            <span className="text-[12px] text-[#8A8480] font-medium">/mo</span>
          </div>
          {depositStr && (
            <span className="text-[11px] text-[#8A8480] bg-[#F5F0E8] px-2 py-0.5 rounded-full">
              {depositStr}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-[14px] font-semibold text-[#1A1814] line-clamp-1 mb-1.5 leading-snug">
          {listing.title}
        </h3>

        {/* Description snippet — only on taller cards */}
        {photoHeight >= 265 && listing.description && (
          <p className="text-[12px] text-[#8A8480] line-clamp-2 mb-2 leading-relaxed">
            {listing.description}
          </p>
        )}

        {/* Locality */}
        <div className="flex items-center gap-1.5 mb-3">
          <MapPin size={12} className="text-[#8A8480] flex-shrink-0" />
          <span className="text-[12px] text-[#4A4640] truncate">{listing.locality}</span>
        </div>

        {/* Spec chips */}
        {(listing.areaSqft || listing.floor !== undefined) && (
          <div className="flex items-center flex-wrap gap-1.5 mb-3">
            {listing.areaSqft && (
              <span className="px-2.5 py-1 rounded-lg bg-[#F5F0E8] text-[11px] font-medium text-[#4A4640]">
                {listing.areaSqft} sqft
              </span>
            )}
            {listing.floor !== undefined && (
              <span className="px-2.5 py-1 rounded-lg bg-[#F5F0E8] text-[11px] font-medium text-[#4A4640]">
                Floor {listing.floor}
              </span>
            )}
          </div>
        )}

        {/* Owner + unlock row */}
        <div className="flex items-center justify-between pt-3 border-t border-[#F5F0E8]">
          <div className="flex items-center gap-2">
            <VerifiedAvatar
              name={listing.owner.name}
              src={listing.owner.avatar}
              size={26}
              verified={listing.owner.verified}
            />
            <div>
              <p className="text-[12px] font-semibold text-[#1A1814] leading-none">{listing.owner.name}</p>
              {listing.owner.verified && (
                <p className="text-[10px] text-[#1D9E75] font-medium mt-0.5">Verified owner</p>
              )}
            </div>
          </div>

          {listing.isLocked ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1B2B6B]/6 border border-[#1B2B6B]/12">
              <Lock size={11} className="text-[#1B2B6B]" />
              <span className="text-[11px] font-semibold text-[#1B2B6B]">Unlock</span>
            </div>
          ) : (
            <span className="text-[11px] font-semibold text-[#1D9E75] flex items-center gap-1">
              <ShieldCheck size={12} /> Unlocked
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
