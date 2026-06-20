import TopNav from '@/components/nav/TopNav'
import MobileNav from '@/components/nav/MobileNav'
import Footer from '@/components/nav/Footer'
import RentalsClient from '@/components/listing/RentalsClient'


export const metadata = {
  title: 'Rentals in Guwahati — Vastoq',
  description: 'Browse verified flats, PGs, rooms and houses for rent in Guwahati. No broker fees.',
}

export default function RentalsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <TopNav />
      <main>
        <RentalsClient />
      </main>
      <Footer />
      <MobileNav />
      <div className="h-16 lg:hidden" aria-hidden="true" />
    </div>
  )
}
