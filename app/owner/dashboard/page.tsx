'use client'

import TopNav from '@/components/nav/TopNav'
import MobileNav from '@/components/nav/MobileNav'
import Footer from '@/components/nav/Footer'
import Link from 'next/link'
import {
  PlusSquare,
  Eye,
  Lock,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  MoreVertical,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import BoostGate from '@/components/listing/BoostGate'

const STATUS_CONFIG = {
  approved: { label: 'Live',           color: 'bg-[#E1F5EE] text-[#1D9E75]' },
  pending:  { label: 'Pending review', color: 'bg-[#FEF3DC] text-[#E8A020]' },
  rejected: { label: 'Rejected',       color: 'bg-[#FDEAEA] text-[#D84040]' },
}

type DashboardListing = {
  id: number
  title: string
  locality: string
  rent_per_month: number
  photos?: string[]
  status: 'approved' | 'pending' | 'rejected'
  view_count: number
  unlock_count: number
  is_featured?: boolean
  featured_until?: string | null
}

export default function OwnerDashboard() {
  const { user, loading: userLoading } = useCurrentUser()
  const [listings, setListings] = useState<DashboardListing[]>([])
  const [loading, setLoading] = useState(true)
  const [boostingListing, setBoostingListing] = useState<DashboardListing | null>(null)

  const isActivelyFeatured = (l: DashboardListing) =>
    !!l.is_featured && !!l.featured_until && new Date(l.featured_until) > new Date()

  useEffect(() => {
    if (!user?.userId) return

    async function loadListings() {
      try {
        const res  = await fetch('/api/listings/my-listings', { credentials: 'include' })
        const json = await res.json()
        setListings(json.data?.data ?? json.data ?? [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadListings()
  }, [user])

  const totalRevenue = listings.reduce(
    (sum, item) => sum + item.unlock_count * 20,
    0
  )

  const totalUnlocks = listings.reduce(
    (sum, item) => sum + item.unlock_count,
    0
  )

  const totalViews = listings.reduce(
    (sum, item) => sum + item.view_count,
    0
  )

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        Loading dashboard...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <TopNav />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#E8A020] text-white text-[20px] font-extrabold flex items-center justify-center flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>

            <div>
              <h1 className="text-[22px] font-bold text-[#1A1814]">
                {user?.name || 'Owner'}
              </h1>

              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[12px] text-[#8A8480]">
                  {user?.phone || ''}
                </span>

                <span className="px-2 py-0.5 bg-[#FEF3DC] text-[#E8A020] text-[11px] font-bold rounded-full">
                  Owner
                </span>

                </div>
            </div>
          </div>

          <Link
            href="/owner/listings/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1B2B6B] text-white text-[13px] font-bold rounded-[10px] hover:bg-[#2D3E8C] transition-colors flex-shrink-0"
          >
            <PlusSquare size={15} />
            New listing
          </Link>
        </div>

        {/* Revenue overview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: TrendingUp,
              label: 'Total revenue',
              value: `₹${totalRevenue}`,
              sub: 'from unlock fees',
              color: 'text-[#1D9E75]',
              bg: 'bg-[#E1F5EE]',
            },
            {
              icon: Lock,
              label: 'Total unlocks',
              value: String(totalUnlocks),
              sub: 'contact reveals',
              color: 'text-[#1B2B6B]',
              bg: 'bg-[#E8ECF8]',
            },
            {
              icon: Eye,
              label: 'Total views',
              value: String(totalViews),
              sub: 'listing page views',
              color: 'text-[#E8A020]',
              bg: 'bg-[#FEF3DC]',
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-[14px] border border-[#E5E0D5] p-4 shadow-vastoq-sm"
            >
              <div
                className={`w-9 h-9 rounded-[8px] ${s.bg} flex items-center justify-center mb-3`}
              >
                <s.icon size={17} className={s.color} />
              </div>

              <p className="text-[22px] font-extrabold text-[#1A1814] leading-none">
                {s.value}
              </p>

              <p className="text-[12px] font-semibold text-[#1A1814] mt-1">
                {s.label}
              </p>

              <p className="text-[10px] text-[#8A8480]">
                {s.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Listings table */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-bold text-[#1A1814]">
              Your listings
            </h2>

            <Link
              href="/owner/listings/new"
              className="text-[12px] text-[#1B2B6B] font-semibold hover:underline flex items-center gap-1"
            >
              Add new
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="bg-white rounded-[16px] border border-[#E5E0D5] shadow-vastoq-sm overflow-hidden">
            {listings.length === 0 ? (
              <div className="p-8 text-center text-[#8A8480]">
                No listings found.
              </div>
            ) : (
              listings.map((listing, i) => {
                const cfg =
                  STATUS_CONFIG[
                    listing.status as keyof typeof STATUS_CONFIG
                  ]

                return (
                  <div
                    key={listing.id}
                    className={`flex items-center gap-4 px-5 py-4 ${
                      i < listings.length - 1
                        ? 'border-b border-[#F5F0E8]'
                        : ''
                    }`}
                  >
                    {listing.photos?.[0] ? (
                      <img
                        src={listing.photos[0]}
                        alt={listing.title}
                        className="w-14 h-12 object-cover rounded-[8px] flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-12 bg-[#E8ECF8] rounded-[8px] flex-shrink-0" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[14px] font-semibold text-[#1A1814] truncate">
                          {listing.title}
                        </p>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg?.color}`}
                        >
                          {cfg?.label}
                        </span>
                      </div>

                      <p className="text-[12px] text-[#4A4640]">
                        ₹{listing.rent_per_month.toLocaleString('en-IN')}/mo ·{' '}
                        {listing.locality}
                      </p>
                    </div>

                    <div className="hidden sm:flex items-center gap-6 flex-shrink-0 text-center">
                      <div>
                        <p className="text-[15px] font-bold text-[#1A1814]">
                          {listing.view_count}
                        </p>
                        <p className="text-[10px] text-[#8A8480]">
                          views
                        </p>
                      </div>

                      <div>
                        <p className="text-[15px] font-bold text-[#1B2B6B]">
                          {listing.unlock_count}
                        </p>
                        <p className="text-[10px] text-[#8A8480]">
                          unlocks
                        </p>
                      </div>

                      <div>
                        <p className="text-[15px] font-bold text-[#1D9E75]">
                          ₹{listing.unlock_count * 20}
                        </p>
                        <p className="text-[10px] text-[#8A8480]">
                          earned
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isActivelyFeatured(listing) ? (
                        <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] bg-[#FEF3DC] text-[#E8A020] text-[11px] font-bold">
                          <Zap size={12} /> Boosted
                        </span>
                      ) : (
                        <button
                          onClick={() => setBoostingListing(listing)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] border border-[#E8A020]/30 text-[#E8A020] text-[11px] font-bold hover:bg-[#FEF3DC] transition-colors"
                        >
                          <Zap size={12} /> Boost
                        </button>
                      )}

                      <Link
                        href={`/rentals/${listing.id}`}
                        className="p-1.5 rounded-[6px] hover:bg-[#E8ECF8] transition-colors"
                      >
                        <Eye
                          size={15}
                          className="text-[#4A4640]"
                        />
                      </Link>

                      <button className="p-1.5 rounded-[6px] hover:bg-[#E8ECF8] transition-colors">
                        <MoreVertical
                          size={15}
                          className="text-[#4A4640]"
                        />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>

        {/* CTA banner */}
        {listings.some((l) => !isActivelyFeatured(l)) && (
          <div className="mt-8 bg-[#1B2B6B] rounded-[18px] p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-white font-bold text-[16px] mb-1">
                Boost your listing for more visibility
              </p>

              <p className="text-white/60 text-[13px]">
                Featured listings get 3x more unlocks on average.
              </p>
            </div>

            <button
              onClick={() => setBoostingListing(listings.find((l) => !isActivelyFeatured(l)) ?? null)}
              className="flex-shrink-0 px-4 py-2.5 bg-[#E8A020] text-white text-[13px] font-bold rounded-[10px] hover:bg-[#d48f10] transition-colors"
            >
              Boost listing
            </button>
          </div>
        )}
      </main>

      {boostingListing && (
        <BoostGate
          listingId={boostingListing.id}
          listingTitle={boostingListing.title}
          onClose={() => setBoostingListing(null)}
          onSuccess={(data) => {
            setListings((prev) =>
              prev.map((l) =>
                l.id === boostingListing.id
                  ? { ...l, is_featured: true, featured_until: data?.featured_until ?? l.featured_until }
                  : l
              )
            )
          }}
        />
      )}

      <Footer />
      <MobileNav />
      <div className="h-16 lg:hidden" aria-hidden="true" />
    </div>
  )
}