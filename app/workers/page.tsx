import TopNav from '@/components/nav/TopNav'
import MobileNav from '@/components/nav/MobileNav'
import Footer from '@/components/nav/Footer'
import WorkersClient from '@/components/worker/WorkersClient'

export const metadata = {
  title: 'Local Workers in Guwahati — Vastoq',
  description: 'Find Aadhaar-verified electricians, plumbers, cleaners, carpenters and painters in Guwahati.',
}

export default function WorkersPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <TopNav />
      <main>
        <WorkersClient />
      </main>
      <Footer />
      <MobileNav />
      <div className="h-16 lg:hidden" aria-hidden="true" />
    </div>
  )
}
