'use client'

import Link from 'next/link'
import { Heart, MapPin, Camera, Lock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { VastoqBadge, VerifiedAvatar } from '@/components/ui/vastoq-badge'
import { cn } from '@/lib/utils'

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
    propertyType: 'Flat' | 'PG' | 'Room' | 'House' | 'Office' | 'Shop' | 'Warehouse'
    photos: string[]
    isVerified?: boolean
    isPopular?: boolean
    isBoosted?: boolean
    isCommercial?: boolean
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

    phone?: string
  }

interface ListingCardProps {
  listing: Listing
  className?: string
}

export default function ListingCard({ listing, className }: ListingCardProps) {

  const { user, loading } = useCurrentUser()
console.log('LISTING CARD DATA', listing)
  const [saved, setSaved] = useState(
    (listing as any).isSaved ?? false
  )

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setSaved((listing as any).isSaved ?? false)
  }, [listing])

  const coverPhoto = listing.photos[0]

  const handleToggleSave = async (
    e: React.MouseEvent
  ) => {

    e.preventDefault()

    if (loading) {
      return
    }

    if (!user?.id) {
      window.location.href = '/login'
      return
    }

    if (saving) {
      return
    }

    try {

      setSaving(true)

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/saved-listings/toggle`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            listing_id: listing.id,
          }),
        }
      )

      const json = await res.json()

      if (res.ok) {
        setSaved(json.saved)
      }

    } catch (err) {

      console.error(err)

    } finally {

      setSaving(false)

    }
  }

  return (
    <Link
      href={`/rentals/${listing.id}`}
      className={cn(
        'group block bg-white rounded-[12px] border border-[#E5E0D5] overflow-hidden shadow-vastoq-sm hover:shadow-vastoq-md transition-all duration-200 hover:-translate-y-0.5',
        className
      )}
    >
      {/* Photo area */}
      <div className="relative overflow-hidden" style={{ height: 180 }}>
        {coverPhoto ? (
          <img
            src={coverPhoto}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-[#E8ECF8] flex items-center justify-center">
            <span className="text-[#8A8480] text-sm">No photo</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {listing.isVerified && <VastoqBadge variant="verified" />}
          {listing.isPopular && <VastoqBadge variant="popular" />}
          {listing.isBoosted && <VastoqBadge variant="boosted" />}
          {listing.isCommercial && <VastoqBadge variant="commercial" />}
        </div>

        {/* Save button */}
        <button
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          onClick={handleToggleSave}
          disabled={saving || loading}
          aria-label={saved ? 'Remove from saved' : 'Save listing'}
        >
          <Heart
            size={15}
            className={saved ? 'fill-[#D84040] stroke-[#D84040]' : 'stroke-[#4A4640]'}
          />
        </button>

        {/* Photo count */}
        {listing.photos.length > 1 && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 rounded-full px-2 py-0.5">
            <Camera size={10} className="text-white" />
            <span className="text-white text-[10px] font-medium">{listing.photos.length}</span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-3.5">
        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-[18px] font-bold text-[#1B2B6B]">
            ₹{(listing.rent ?? 0).toLocaleString('en-IN')}
          </span>
          <span className="text-[12px] text-[#8A8480] font-medium">/mo</span>
        </div>

        {/* Title */}
        <h3 className="text-[14px] font-semibold text-[#1A1814] line-clamp-1 mb-1">
          {listing.title}
        </h3>

        {/* Locality */}
        <div className="flex items-center gap-1 mb-2.5">
          <MapPin size={12} className="text-[#8A8480] flex-shrink-0" />
          <span className="text-[12px] text-[#4A4640] truncate">{listing.locality}</span>
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-3 mb-3 text-[12px] text-[#4A4640]">
          {listing.bhk && (
            <span className="font-medium">{listing.bhk} BHK</span>
          )}
          {listing.areaSqft && (
            <>
              <span className="text-[#D0C9BC]">·</span>
              <span>{listing.areaSqft} sqft</span>
            </>
          )}
          {listing.floor !== undefined && (
            <>
              <span className="text-[#D0C9BC]">·</span>
              <span>Floor {listing.floor}</span>
            </>
          )}
          {listing.furnishing && (
            <>
              <span className="text-[#D0C9BC]">·</span>
              <span>{listing.furnishing}</span>
            </>
          )}
        </div>

        {/* Owner row */}
        <div className="flex items-center justify-between pt-3 border-t border-[#F5F0E8]">
          <div className="flex items-center gap-2">
            <VerifiedAvatar
              name={listing.owner.name}
              src={listing.owner.avatar}
              size={28}
              verified={listing.owner.verified}
            />
            <span className="text-[12px] text-[#4A4640] font-medium">{listing.owner.name}</span>
          </div>
          {listing.isLocked && (
            <div className="flex items-center gap-1 text-[11px] text-[#8A8480]">
              <Lock size={11} />
              <span>₹20 to unlock</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
