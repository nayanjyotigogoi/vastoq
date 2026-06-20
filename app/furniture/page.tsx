import TopNav from '@/components/nav/TopNav'
import MobileNav from '@/components/nav/MobileNav'
import Footer from '@/components/nav/Footer'
import FurniturePage from '@/components/furniture/FurniturePage'

export const metadata = {
  title: 'Furniture Rental in Guwahati — Vastoq',
  description: 'Rent fridges, beds, sofas, washing machines and more in Guwahati. Quality furniture delivered to your door.',
}

export default function Furniture() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <TopNav />
      <main>
        <FurniturePage />
      </main>
      <Footer />
      <MobileNav />
      <div className="h-16 lg:hidden" aria-hidden="true" />
    </div>
  )
}
