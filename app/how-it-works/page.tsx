import TopNav from '@/components/nav/TopNav'
import MobileNav from '@/components/nav/MobileNav'
import Footer from '@/components/nav/Footer'
import Link from 'next/link'
import {
  Search, Lock, Phone, CheckCircle2,
  UserCheck, Star, ClipboardList, Wrench,
  Home, PlusSquare, Eye, IndianRupee
} from 'lucide-react'

const TENANT_STEPS = [
  { icon: Search, title: 'Search listings', desc: 'Browse verified flats, PGs, rooms and houses in Guwahati. Filter by locality, budget, BHK and furnishing.' },
  { icon: Lock, title: 'Pay a small fee to unlock', desc: 'Pay just ₹20 to reveal the owner\'s contact number and exact address. No broker. No hidden charges.' },
  { icon: Phone, title: 'Contact directly', desc: 'Call or message the owner directly using the unlocked number. Schedule a visit on your terms.' },
  { icon: CheckCircle2, title: 'Move in', desc: 'Finalize the deal with the owner directly. No middlemen, no negotiation stress.' },
]

const OWNER_STEPS = [
  { icon: PlusSquare, title: 'List your property', desc: 'Post your flat, PG, room or house in under 5 minutes with photos and details.' },
  { icon: Eye, title: 'Reach thousands', desc: 'Your listing goes live immediately to thousands of verified tenants looking in your area.' },
  { icon: IndianRupee, title: 'Earn per contact unlock', desc: 'Every time a tenant pays ₹20 to unlock your number, you earn a portion. We handle payments.' },
  { icon: UserCheck, title: 'Choose your tenant', desc: 'Screen tenants yourself. No broker pressure. Move-in on your schedule.' },
]

const WORKER_STEPS = [
  { icon: UserCheck, title: 'Verify your Aadhaar', desc: 'Complete a one-time Aadhaar verification to get the Vastoq Verified badge — building trust instantly.' },
  { icon: ClipboardList, title: 'Set up your profile', desc: 'Add your skills, work localities, hourly rate, and photos of past work.' },
  { icon: Star, title: 'Earn 5-star reviews', desc: 'Complete jobs and collect reviews. The more you earn, the higher you rank in search results.' },
  { icon: Wrench, title: 'Build your local reputation', desc: 'Vastoq becomes your digital portfolio. New clients find you without any middleman fee.' },
]

type StepItem = {
  icon: React.ElementType
  title: string
  desc: string
}

function StepList({ steps, color }: { steps: StepItem[]; color: 'indigo' | 'green' | 'amber' }) {
  const palette = {
    indigo: { bg: 'bg-[#E8ECF8]', icon: 'text-[#1B2B6B]', num: 'bg-[#1B2B6B]' },
    green: { bg: 'bg-[#E1F5EE]', icon: 'text-[#1D9E75]', num: 'bg-[#1D9E75]' },
    amber: { bg: 'bg-[#FEF3DC]', icon: 'text-[#E8A020]', num: 'bg-[#E8A020]' },
  }[color]

  return (
    <div className="space-y-5">
      {steps.map((step, i) => (
        <div key={step.title} className="flex items-start gap-4">
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full ${palette.num} text-white text-[13px] font-extrabold flex items-center justify-center`}>
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className="w-px h-6 bg-[#E5E0D5] mt-1" aria-hidden="true" />
            )}
          </div>
          <div className="pb-2">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-7 h-7 rounded-[8px] ${palette.bg} flex items-center justify-center`}>
                <step.icon size={14} className={palette.icon} aria-hidden="true" />
              </div>
              <h3 className="text-[15px] font-bold text-[#1A1814]">{step.title}</h3>
            </div>
            <p className="text-[13px] text-[#4A4640] leading-relaxed">{step.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

const FAQS = [
  { q: 'Is Vastoq only for Guwahati?', a: 'Currently yes — we are focused on building the best rental and worker discovery platform for Guwahati. More Assam cities are coming soon.' },
  { q: 'Why do I pay ₹20 to unlock a contact?', a: 'The ₹20 unlock fee keeps Vastoq free of broker fees. It also filters out fake enquiries, so owners only get serious tenants contacting them.' },
  { q: 'How are workers verified?', a: 'Workers submit their Aadhaar number. Our team verifies the Aadhaar data against the UIDAI database. Verified workers get a green badge on their profile.' },
  { q: 'Can I list more than one property?', a: 'Yes. Owner accounts can post unlimited listings. Each listing is reviewed within 24 hours before going live.' },
  { q: 'What happens if a tenant unlocks but the property is already rented?', a: 'Owners are expected to mark listings as rented. If you unlocked a listing that turned out to be unavailable, raise a ticket and we will process a full refund.' },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <TopNav />
      <main>
        {/* Hero */}
        <section className="bg-[#1B2B6B] relative overflow-hidden">
          <span className="city-watermark" aria-hidden="true">HOW</span>
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
            <p className="label-uppercase text-[#1D9E75] mb-3">No brokers. No hassle.</p>
            <h1 className="text-[32px] sm:text-[42px] font-extrabold text-white leading-tight mb-4 text-pretty" style={{ letterSpacing: '-1px' }}>
              How Vastoq works
            </h1>
            <p className="text-white/70 text-[15px] leading-relaxed max-w-xl mx-auto">
              Vastoq connects tenants, property owners, and local workers directly — cutting out brokers and middlemen entirely.
            </p>
          </div>
        </section>

        {/* Three-tab content */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid sm:grid-cols-3 gap-8">
            {/* Tenant */}
            <div className="bg-white rounded-[20px] border border-[#E5E0D5] p-7 shadow-vastoq-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-[10px] bg-[#E8ECF8] flex items-center justify-center">
                  <Home size={20} className="text-[#1B2B6B]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A8480]">For tenants</p>
                  <h2 className="text-[16px] font-bold text-[#1A1814]">Find a rental</h2>
                </div>
              </div>
              <StepList steps={TENANT_STEPS} color="indigo" />
              <Link
                href="/rentals"
                className="mt-6 w-full flex items-center justify-center py-2.5 rounded-[10px] bg-[#1B2B6B] text-white text-[13px] font-bold hover:bg-[#2D3E8C] transition-colors"
              >
                Browse rentals
              </Link>
            </div>

            {/* Owner */}
            <div className="bg-white rounded-[20px] border border-[#E5E0D5] p-7 shadow-vastoq-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-[10px] bg-[#FEF3DC] flex items-center justify-center">
                  <PlusSquare size={20} className="text-[#E8A020]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A8480]">For owners</p>
                  <h2 className="text-[16px] font-bold text-[#1A1814]">List a property</h2>
                </div>
              </div>
              <StepList steps={OWNER_STEPS} color="amber" />
              <Link
                href="/owner/listings/new"
                className="mt-6 w-full flex items-center justify-center py-2.5 rounded-[10px] bg-[#E8A020] text-white text-[13px] font-bold hover:bg-[#d48f10] transition-colors"
              >
                Post a listing
              </Link>
            </div>

            {/* Worker */}
            <div className="bg-white rounded-[20px] border border-[#E5E0D5] p-7 shadow-vastoq-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-[10px] bg-[#E1F5EE] flex items-center justify-center">
                  <Wrench size={20} className="text-[#1D9E75]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A8480]">For workers</p>
                  <h2 className="text-[16px] font-bold text-[#1A1814]">Get discovered</h2>
                </div>
              </div>
              <StepList steps={WORKER_STEPS} color="green" />
              <Link
                href="/worker/dashboard"
                className="mt-6 w-full flex items-center justify-center py-2.5 rounded-[10px] bg-[#1D9E75] text-white text-[13px] font-bold hover:bg-[#178860] transition-colors"
              >
                Join as a worker
              </Link>
            </div>
          </div>
        </section>

        {/* Pricing transparency */}
        <section className="bg-[#1B2B6B] py-14">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="label-uppercase text-[#1D9E75] mb-3">Pricing</p>
            <h2 className="text-[26px] font-extrabold text-white mb-3">Simple. Transparent. Affordable.</h2>
            <div className="grid sm:grid-cols-3 gap-4 mt-8 text-left">
              {[
                { who: 'Tenants', price: 'From ₹20', what: 'Per listing unlock. Packs & monthly pass available.' },
                { who: 'Owners', price: 'Free to list', what: 'Listing is free. Earn revenue share on tenant unlocks.' },
                { who: 'Workers', price: 'Free profile', what: 'No commission. Keep 100% of what you earn.' },
              ].map((p) => (
                <div key={p.who} className="bg-white/10 rounded-[14px] p-5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">{p.who}</p>
                  <p className="text-[22px] font-extrabold text-white mb-1">{p.price}</p>
                  <p className="text-[12px] text-white/60 leading-relaxed">{p.what}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-[22px] font-bold text-[#1A1814] mb-8 text-center">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group bg-white rounded-[14px] border border-[#E5E0D5] shadow-vastoq-sm overflow-hidden"
              >
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                  <span className="text-[14px] font-semibold text-[#1A1814] pr-4">{faq.q}</span>
                  <span className="text-[#8A8480] text-[18px] flex-shrink-0 group-open:rotate-45 transition-transform font-light" aria-hidden="true">+</span>
                </summary>
                <div className="px-5 pb-4">
                  <p className="text-[13px] text-[#4A4640] leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <MobileNav />
      <div className="h-16 lg:hidden" aria-hidden="true" />
    </div>
  )
}
