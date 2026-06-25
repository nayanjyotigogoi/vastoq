import TopNav from '@/components/nav/TopNav'
import MobileNav from '@/components/nav/MobileNav'
import Footer from '@/components/nav/Footer'
import HeroSection from '@/components/home/HeroSection'
import TrustBar from '@/components/home/TrustBar'
import ActionCards from '@/components/home/ActionCards'
import FeaturedListings from '@/components/home/FeaturedListings'
import FurnitureTeaser from '@/components/home/FurnitureTeaser'
import HowItWorks from '@/components/home/HowItWorks'
import HomeMapSection from '@/components/home/HomeMapSection'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <TopNav />
      <main>
        <HeroSection />
        <TrustBar />
        <ActionCards />
        <HomeMapSection />
        <FeaturedListings />
        <HowItWorks />
        <FurnitureTeaser />
      </main>
      <Footer />
      <MobileNav />
      {/* Bottom padding for mobile nav */}
      <div className="h-16 lg:hidden" aria-hidden="true" />
    </div>
  )
}
