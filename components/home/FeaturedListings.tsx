import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ListingCard from '@/components/listing/ListingCard'
import { MOCK_LISTINGS } from '@/lib/mock-data'

export default function FeaturedListings() {
  const featured = MOCK_LISTINGS.slice(0, 3)

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14" aria-labelledby="featured-heading">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="label-uppercase text-[#1B2B6B] mb-1">Guwahati · Just listed</p>
          <h2 id="featured-heading" className="text-[22px] font-bold text-[#1A1814]">
            Featured Rentals
          </h2>
        </div>
        <Link
          href="/rentals"
          className="hidden sm:flex items-center gap-1.5 text-[13px] font-semibold text-[#1B2B6B] hover:text-[#2D3E8C] transition-colors"
        >
          View all listings
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {featured.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      <div className="mt-6 text-center sm:hidden">
        <Link
          href="/rentals"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1B2B6B]"
        >
          View all listings <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  )
}
