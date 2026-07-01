'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Heart, MapPin, Lock, ShieldCheck, Camera, Zap } from 'lucide-react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Listing } from './ListingCard'

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
  if (raw === '1rk')        return '1 RK'
  if (raw?.endsWith('bhk')) return `${raw.replace('bhk', '')} BHK`
  if (raw === 'pg')         return 'PG'
  if (raw === 'house')      return 'House'
  if (bhk)                  return `${bhk} BHK`
  return type ?? ''
}

export default function ListingCarouselCard({ listing }: { listing: Listing }) {
  const { user, loading } = useCurrentUser()
  const [saved,  setSaved]  = useState((listing as any).isSaved ?? false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { setSaved((listing as any).isSaved ?? false) }, [listing])

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

  const color    = BHK_COLOR[listing.bhkRaw ?? ''] ?? DEFAULT_COLOR
  const bhkLabel = getBhkLabel(listing.bhkRaw, listing.bhk, listing.propertyType)
  const photo    = listing.photos[0]

  return (
    <Link
      href={`/rentals/${listing.id}`}
      className={cn(
        'group flex-shrink-0 w-[230px] block bg-white rounded-[16px] overflow-hidden',
        'shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
        'hover:shadow-[0_8px_28px_rgba(0,0,0,0.13)]',
        'hover:-translate-y-1 transition-all duration-250',
        listing.isBoosted ? 'border-2 border-[#E8A020]/60' : 'border border-[#E5E0D5]'
      )}
    >
      {/* Photo */}
      <div className="relative overflow-hidden" style={{ height: 160 }}>
        {photo ? (
          <img
            src={photo}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#E8ECF8] to-[#D0D8F0] flex items-center justify-center">
            <MapPin size={22} className="text-[#1B2B6B]/25" />
          </div>
        )}

        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />

        {/* BHK badge — bottom left */}
        <div className="absolute bottom-2.5 left-2.5">
          <span
            className="px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm"
            style={{ background: color.bg, color: color.text }}
          >
            {bhkLabel}
          </span>
        </div>

        {/* Save — top right */}
        <button
          onClick={handleToggleSave}
          disabled={saving || loading}
          className={cn(
            'absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center',
            'bg-white/90 backdrop-blur-sm shadow-sm',
            'hover:scale-110 transition-all duration-150',
            saving && 'opacity-50'
          )}
          aria-label={saved ? 'Remove' : 'Save'}
        >
          <Heart size={12} className={saved ? 'fill-[#D84040] stroke-[#D84040]' : 'stroke-[#4A4640]'} />
        </button>

        {/* Boosted + Verified badges — top left, stacked */}
        {(listing.isBoosted || listing.isVerified) && (
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
            {listing.isBoosted && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#E8A020] text-white text-[9px] font-bold shadow-sm">
                <Zap size={8} strokeWidth={2.5} /> Boosted
              </span>
            )}
            {listing.isVerified && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#1D9E75] text-white text-[9px] font-bold shadow-sm">
                <ShieldCheck size={8} strokeWidth={2.5} /> Verified
              </span>
            )}
          </div>
        )}

        {/* Photo count — bottom right */}
        {listing.photos.length > 1 && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-0.5 bg-black/50 rounded-full px-1.5 py-0.5">
            <Camera size={8} className="text-white" />
            <span className="text-white text-[9px]">{listing.photos.length}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        {/* Price */}
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-[17px] font-extrabold text-[#1B2B6B] leading-none" style={{ letterSpacing: '-0.4px' }}>
            ₹{(listing.rent ?? 0).toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-[#8A8480]">/mo</span>
        </div>

        {/* Title */}
        <p className="text-[12px] font-semibold text-[#1A1814] line-clamp-1 mb-1">
          {listing.title}
        </p>

        {/* Specs row */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          {listing.furnishing && (
            <span className="text-[10px] font-medium text-[#4A4640] bg-[#F5F0E8] px-1.5 py-0.5 rounded-md">
              {listing.furnishing === 'Semi-furnished' ? 'Semi-furn.' : listing.furnishing}
            </span>
          )}
          {listing.areaSqft && (
            <span className="text-[10px] text-[#8A8480]">{listing.areaSqft} sqft</span>
          )}
        </div>

        {/* Owner + lock */}
        <div className="flex items-center justify-between pt-2 border-t border-[#F5F0E8]">
          <span className="text-[11px] text-[#4A4640] font-medium truncate max-w-[110px]">
            {listing.owner.name}
          </span>
          {listing.isLocked ? (
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-[#1B2B6B]">
              <Lock size={9} /> Unlock
            </span>
          ) : (
            <ShieldCheck size={12} className="text-[#1D9E75]" />
          )}
        </div>
      </div>
    </Link>
  )
}
