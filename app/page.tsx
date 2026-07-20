import TopNav from '@/components/nav/TopNav'
import MobileNav from '@/components/nav/MobileNav'
import Footer from '@/components/nav/Footer'
import HeroSection from '@/components/home/HeroSection'
import TrustBar from '@/components/home/TrustBar'
import ActionCards from '@/components/home/ActionCards'
import FurnitureBanner from '@/components/home/FurnitureBanner'
import FeaturedListings from '@/components/home/FeaturedListings'
import FurnitureTeaser from '@/components/home/FurnitureTeaser'
import HowItWorks from '@/components/home/HowItWorks'
import HomeMapSection from '@/components/home/HomeMapSection'

export const metadata = {
  title: 'Vastoq — Rental Properties, Furniture Rentals & Local Workers',
  description: 'Find verified flats, PGs, rooms and houses for rent in Guwahati. Rent furniture & appliances effortlessly. Hire trusted local workers — electricians, plumbers, carpenters & more.',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <TopNav />
      <main>
        <HeroSection />
        <TrustBar />
        <ActionCards />
        <FurnitureBanner />
        <HomeMapSection />
        <FeaturedListings />
        <FurnitureTeaser />
        <HowItWorks />
      </main>
      <Footer />
      <MobileNav />
      {/* Bottom padding for mobile nav */}
      <div className="h-16 lg:hidden" aria-hidden="true" />
    </div>
  )
}
