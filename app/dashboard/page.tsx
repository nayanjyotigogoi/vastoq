'use client'

import TopNav from '@/components/nav/TopNav'
import MobileNav from '@/components/nav/MobileNav'
import Footer from '@/components/nav/Footer'
import Link from 'next/link'
import { Heart, Lock, MessageSquare, ChevronRight, Search, HardHat } from 'lucide-react'
import ListingCard from '@/components/listing/ListingCard'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useEffect, useState } from 'react'

// const MOCK_UNLOCKED = [
//   {
//     listingId: '1',
//     unlockedAt: '2 days ago',
//     ownerPhone: '+91 98765 43210',
//     ownerName: 'Ranjit Bora',
//   },
//   {
//     listingId: '4',
//     unlockedAt: '5 days ago',
//     ownerPhone: '+91 90123 45678',
//     ownerName: 'Anita Devi',
//   },
// ]

const QUICK_LINKS = [
  {
    icon: Search,
    label: 'Browse rentals',
    href: '/rentals',
    color: 'bg-[#E8ECF8] text-[#1B2B6B]',
  },
  {
    icon: Heart,
    label: 'Saved listings',
    href: '#saved',
    color: 'bg-[#FEF3DC] text-[#E8A020]',
  },
  {
    icon: Lock,
    label: 'My unlocks',
    href: '#unlocks',
    color: 'bg-[#E1F5EE] text-[#1D9E75]',
  },
  {
    icon: HardHat,
    label: 'Workers',
    href: '#worker-unlocks',
    color: 'bg-[#E8ECF8] text-[#1B2B6B]',
  },
  {
    icon: MessageSquare,
    label: 'Messages',
    href: '/messages',
    color: 'bg-[#E8ECF8] text-[#1B2B6B]',
  },
]

export default function TenantDashboard() {
  const { user, loading } = useCurrentUser()

  const [dashboardData, setDashboardData] = useState<any>(null)
  const [savedListings,  setSavedListings]  = useState<any[]>([])

  useEffect(() => {
    if (!user?.userId) return

    async function loadDashboard() {
      const res = await fetch('/api/dashboard/tenant', { credentials: 'include' })
      const json = await res.json()
      if (res.ok) {
        setDashboardData(json.data)
        setSavedListings(json.data?.saved_listings_data ?? [])
      }
    }

    loadDashboard()
  }, [user])

  // Called by ListingCard when the user unsaves from inside the card
  const handleSaveToggle = (listingId: string, saved: boolean) => {
    if (!saved) {
      setSavedListings((prev) => prev.filter((s) => String(s.listing?.id) !== String(listingId)))
      setDashboardData((prev: any) =>
        prev
          ? { ...prev, stats: { ...prev.stats, saved_listings: Math.max(0, (prev.stats?.saved_listings ?? 1) - 1) } }
          : prev
      )
    }
  }

  // const unlockedListings = MOCK_UNLOCKED.map((u) => ({
  //   ...u,
  //   listing: MOCK_LISTINGS.find((l) => l.id === u.listingId),
  // }))

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <TopNav />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-[#1B2B6B] text-white text-[22px] font-extrabold flex items-center justify-center flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>

          <div>
            <h1 className="text-[22px] font-bold text-[#1A1814]">
              {loading ? 'Loading...' : user?.name}
            </h1>

            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-[12px] text-[#8A8480]">
                +91 {user?.phone}
              </span>

              <span className="px-2 py-0.5 bg-[#E1F5EE] text-[#1D9E75] text-[11px] font-bold rounded-full capitalize">
                {user?.role}
              </span>

              <span className="px-2 py-0.5 bg-[#E8ECF8] text-[#1B2B6B] text-[11px] font-bold rounded-full">
                Mobile verified
              </span>
            </div>
          </div>

          <Link
            href="/profile"
            className="ml-auto text-[13px] text-[#1B2B6B] font-semibold hover:underline hidden sm:block"
          >
            Edit profile
          </Link>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              label: 'Unlocks used',
              value:dashboardData?.stats?.unlocks_used ?? '0',
              sub: 'this month',
            },
            {
              label: 'Saved listings',
              value: savedListings.length > 0 ? savedListings.length : (dashboardData?.stats?.saved_listings ?? '0'),
              sub: 'properties',
            },
            {
              label: 'Unlock credits',
              value: dashboardData?.stats?.unlock_credits ?? '0',
              sub: 'remaining',
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-[14px] border border-[#E5E0D5] p-4 shadow-vastoq-sm text-center"
            >
              <p className="text-[26px] font-extrabold text-[#1B2B6B] leading-none">
                {s.value}
              </p>

              <p className="text-[11px] font-semibold text-[#1A1814] mt-1">
                {s.label}
              </p>

              <p className="text-[10px] text-[#8A8480]">
                {s.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-4 gap-3 mb-10">
          {QUICK_LINKS.map(({ icon: Icon, label, href, color }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-2 p-3.5 bg-white rounded-[14px] border border-[#E5E0D5] shadow-vastoq-sm hover:shadow-vastoq-md transition-all text-center"
            >
              <div
                className={`w-10 h-10 rounded-[10px] ${color} flex items-center justify-center`}
              >
                <Icon size={18} />
              </div>

              <span className="text-[11px] font-semibold text-[#1A1814] leading-tight">
                {label}
              </span>
            </Link>
          ))}
        </div>

        {/* Unlocked contacts */}
        <section className="mb-10" id="unlocks">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-bold text-[#1A1814]">
              Unlocked contacts
            </h2>

            <Link
              href="/rentals"
              className="text-[12px] text-[#1B2B6B] font-semibold hover:underline flex items-center gap-1"
            >
              Unlock more <ChevronRight size={13} />
            </Link>
          </div>

          <div className="space-y-3">
            {dashboardData?.unlocks?.map(
              (unlock: any) =>
                unlock.listing ? (
                  <Link
                    key={unlock.id}
                    href={`/rentals/${unlock.listing.id}`}
                    className="bg-white rounded-[14px] border border-[#E5E0D5] p-4 flex items-start gap-4 shadow-vastoq-sm hover:shadow-vastoq-md hover:-translate-y-0.5 transition-all block"
                  >
                    {unlock.listing?.photos?.[0] && (
                      <img
                        src={unlock.listing.photos[0]}
                        alt={unlock.listing.title}
                        className="w-16 h-14 object-cover rounded-[10px] flex-shrink-0"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#1A1814] truncate">
                        {unlock.listing?.title}
                      </p>

                      <p className="text-[12px] text-[#4A4640]">
                        {unlock.listing?.locality}
                      </p>

                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-[13px] font-bold text-[#1D9E75]">
                          +91 {unlock.listing?.owner?.phone}
                        </span>

                        <span className="text-[11px] text-[#8A8480]">
                          {unlock.listing?.owner?.name} · Unlocked
                        </span>
                      </div>
                    </div>
                  </Link>
                ) : null
            )}

            {(!dashboardData?.unlocks || dashboardData.unlocks.length === 0) && (
              <div className="bg-white rounded-[14px] border border-[#E5E0D5] p-8 text-center">
                <Lock size={28} className="text-[#D0C9BC] mx-auto mb-3" />
                <p className="text-[13px] text-[#8A8480]">No unlocked rental contacts yet.</p>
                <Link
                  href="/rentals"
                  className="inline-block mt-3 px-4 py-2 bg-[#1B2B6B] text-white text-[12px] font-semibold rounded-[8px] hover:bg-[#2D3E8C] transition-colors"
                >
                  Browse rentals
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Unlocked workers */}
        <section className="mb-10" id="worker-unlocks">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-bold text-[#1A1814]">Unlocked workers</h2>
            <Link
              href="/workers"
              className="text-[12px] text-[#1B2B6B] font-semibold hover:underline flex items-center gap-1"
            >
              Find workers <ChevronRight size={13} />
            </Link>
          </div>

          <div className="space-y-3">
            {dashboardData?.worker_unlocks?.map((unlock: any) =>
              unlock.worker ? (
                <div
                  key={unlock.id}
                  className="bg-white rounded-[14px] border border-[#E5E0D5] p-4 flex items-start gap-4 shadow-vastoq-sm"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-[#E8ECF8] flex items-center justify-center flex-shrink-0">
                    <span className="text-[16px] font-bold text-[#1B2B6B]">
                      {unlock.worker.name?.[0] ?? '?'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-semibold text-[#1A1814]">{unlock.worker.name}</p>
                      {unlock.worker.is_verified && (
                        <span className="text-[10px] font-bold text-[#1D9E75] bg-[#E1F5EE] px-2 py-0.5 rounded-full">Verified</span>
                      )}
                    </div>

                    <p className="text-[12px] text-[#4A4640]">
                      {unlock.worker.category}{unlock.worker.locality ? ` · ${unlock.worker.locality}` : ''}
                    </p>

                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-[13px] font-bold text-[#1D9E75]">
                        +91 {unlock.worker.phone}
                      </span>
                      <a
                        href={`https://wa.me/91${(unlock.worker.phone ?? '').replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-white bg-[#25D366] px-2.5 py-1 rounded-full hover:bg-[#1aac52] transition-colors"
                      >
                        WhatsApp
                      </a>
                      <Link
                        href={`/workers/${unlock.worker.id}`}
                        className="text-[11px] text-[#1B2B6B] font-semibold hover:underline"
                      >
                        View profile →
                      </Link>
                    </div>
                  </div>
                </div>
              ) : null
            )}

            {(!dashboardData?.worker_unlocks || dashboardData.worker_unlocks.length === 0) && (
              <div className="bg-white rounded-[14px] border border-[#E5E0D5] p-8 text-center">
                <HardHat size={28} className="text-[#D0C9BC] mx-auto mb-3" />
                <p className="text-[13px] text-[#8A8480]">No unlocked workers yet.</p>
                <Link
                  href="/workers"
                  className="inline-block mt-3 px-4 py-2 bg-[#1B2B6B] text-white text-[12px] font-semibold rounded-[8px] hover:bg-[#2D3E8C] transition-colors"
                >
                  Browse workers
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Saved listings */}
        <section id="saved">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-bold text-[#1A1814]">
              Saved listings
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
{savedListings.map(
  (saved: any) => {
    if (!saved.listing) return null

    const listing = saved.listing

    return (
      <ListingCard
        key={saved.id}
        onSaveToggle={handleSaveToggle}
        listing={{
          id: String(listing.id),

          title: listing.title,

          locality: listing.locality,

          rent: Number(listing.rent_per_month ?? 0),

          deposit: Number(listing.deposit ?? 0),

          bhk:
            listing.bhk_type &&
            !['pg', '1rk'].includes(
              listing.bhk_type.toLowerCase()
            )
              ? parseInt(
                  listing.bhk_type
                    .toLowerCase()
                    .replace('bhk', '')
                )
              : undefined,

          areaSqft: listing.area_sqft,

          floor: listing.floor_number,

          furnishing:
            listing.furnishing === 'fully_furnished'
              ? 'Furnished'
              : listing.furnishing === 'semi_furnished'
              ? 'Semi-furnished'
              : 'Unfurnished',

          propertyType: 'Flat',

          photos: listing.photos ?? [],

          isVerified: true,

          isBoosted: listing.is_featured,

          owner: {
            name: listing.owner?.name ?? 'Owner',
            phone: listing.owner?.phone,
            verified: true,
          },

          latitude: listing.latitude
            ? Number(listing.latitude)
            : undefined,

          longitude: listing.longitude
            ? Number(listing.longitude)
            : undefined,

          isLocked: false,

          isSaved: true,
        }}
      />
    )
  }
)}
          </div>

          {(!savedListings || savedListings.length === 0) && (
            <div className="bg-white rounded-[14px] border border-[#E5E0D5] p-8 text-center">
              <Heart
                size={28}
                className="text-[#D0C9BC] mx-auto mb-3"
              />

              <p className="text-[13px] text-[#8A8480]">
                No saved listings yet.
              </p>

              <Link
                href="/rentals"
                className="inline-block mt-3 px-4 py-2 bg-[#1B2B6B] text-white text-[12px] font-semibold rounded-[8px] hover:bg-[#2D3E8C] transition-colors"
              >
                Browse rentals
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />
      <MobileNav />

      <div
        className="h-16 lg:hidden"
        aria-hidden="true"
      />
    </div>
  )
}