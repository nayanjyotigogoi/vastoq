import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import TopNav from '@/components/nav/TopNav'
import MobileNav from '@/components/nav/MobileNav'
import Footer from '@/components/nav/Footer'

export const metadata = {
  title: 'Messages — Coming Soon — Vastoq',
}

export default function MessagesComingSoonPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <TopNav />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-[18px] bg-[#E8ECF8] flex items-center justify-center mx-auto mb-5">
            <MessageSquare size={26} className="text-[#1B2B6B]" />
          </div>
          <h1 className="text-[22px] font-bold text-[#1A1814] mb-2">Messages — Coming Soon</h1>
          <p className="text-[14px] text-[#4A4640] leading-relaxed mb-6">
            In-app messaging is on its way. For now, use the phone number or WhatsApp button
            after unlocking a contact to get in touch directly.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-5 py-2.5 bg-[#1B2B6B] text-white text-[14px] font-semibold rounded-[10px] hover:bg-[#2D3E8C] transition-colors"
          >
            Back to dashboard
          </Link>
        </div>
      </main>
      <Footer />
      <MobileNav />
      <div className="h-16 lg:hidden" aria-hidden="true" />
    </div>
  )
}
