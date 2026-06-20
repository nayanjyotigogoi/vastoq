import TopNav from '@/components/nav/TopNav'
import MobileNav from '@/components/nav/MobileNav'
import Footer from '@/components/nav/Footer'
import ListingDetail from '@/components/listing/ListingDetail'
import { getListing } from '@/lib/services/listings.service'

interface Props {
  params: Promise<{ id: string }>
}

async function fetchListing(id: string) {
  try {
    const response = await getListing(id)

    const listing = response?.data

    if (!listing) {
      return null
    }

    return {
      id: String(listing.id),

      title: listing.title,

      locality: `${listing.locality}, ${listing.city}`,

      rent: Number(listing.rent_per_month),

      deposit: Number(listing.deposit),

      bhk:
        listing.bhk_type?.includes('bhk')
          ? Number(listing.bhk_type.replace('bhk', ''))
          : undefined,

      areaSqft: listing.area_sqft ?? undefined,

      floor: listing.floor_number ?? undefined,

      furnishing:
        listing.furnishing === 'fully_furnished'
          ? 'Furnished'
          : listing.furnishing === 'semi_furnished'
          ? 'Semi-furnished'
          : 'Unfurnished',

      propertyType:
        listing.property_type === 'flat'
          ? 'Flat'
          : listing.property_type === 'house'
          ? 'House'
          : listing.property_type === 'pg'
          ? 'PG'
          : listing.property_type === 'room'
          ? 'Room'
          : listing.property_type === 'office'
          ? 'Office'
          : listing.property_type === 'shop'
          ? 'Shop'
          : listing.property_type === 'warehouse'
          ? 'Warehouse'
          : 'Flat',

      photos: Array.isArray(listing.photos)
        ? listing.photos
        : [],

      description: listing.description ?? '',

      amenities: Array.isArray(listing.amenities)
        ? listing.amenities
        : [],

      latitude: listing.latitude
        ? Number(listing.latitude)
        : undefined,

      longitude: listing.longitude
        ? Number(listing.longitude)
        : undefined,

      phone:
        listing.owner?.phone ||
        listing.owner_phone ||
        undefined,

      owner: {
        name:
          listing.owner?.name ||
          'Owner',

        avatar:
          listing.owner?.profile_photo_url ||
          undefined,

        verified:
          listing.owner?.is_verified ||
          false,
      },

      isVerified:
        listing.owner?.is_verified ||
        false,

      isPopular:
        Number(listing.view_count) > 100,

      isBoosted:
        Boolean(listing.is_featured),

      isCommercial:
        listing.listing_class === 'commercial',

      isLocked: true,
    }
  } catch (error) {
    console.error('Failed to load listing', error)
    return null
  }
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params

  const listing = await fetchListing(id)

  if (!listing) {
    return {
      title: 'Listing Not Found | Vastoq',
    }
  }

  return {
    title: `${listing.title} — Vastoq`,
    description:
      listing.description ||
      `${listing.locality} · ₹${listing.rent.toLocaleString(
        'en-IN'
      )}/month`,
  }
}

export default async function ListingDetailPage({
  params,
}: Props) {
  const { id } = await params

  const listing = await fetchListing(id)

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        <TopNav />

        <main className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-[28px] font-bold text-[#1A1814] mb-3">
            Listing not found
          </h1>

          <p className="text-[#4A4640]">
            This listing may have been removed or does not exist.
          </p>
        </main>

        <Footer />
        <MobileNav />
        <div className="h-16 lg:hidden" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <TopNav />

      <main>
        <ListingDetail listing={listing} />
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