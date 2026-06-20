import Link from 'next/link'
import { Home, Wrench, PlusSquare, ArrowRight } from 'lucide-react'

const cards = [
  {
    icon: Home,
    title: 'Find a rental',
    description: 'Browse verified flats, PGs, rooms and houses in Guwahati — no brokers.',
    href: '/rentals',
    color: 'bg-[#E8ECF8]',
    iconColor: 'text-[#1B2B6B]',
  },
  {
    icon: Wrench,
    title: 'Hire a worker',
    description: 'Find Aadhaar-verified electricians, plumbers, cleaners and more nearby.',
    href: '/workers',
    color: 'bg-[#E1F5EE]',
    iconColor: 'text-[#1D9E75]',
  },
  {
    icon: PlusSquare,
    title: 'List your property',
    description: 'Reach thousands of tenants looking for homes in your area.',
    href: '/owner/listings/new',
    color: 'bg-[#FEF3DC]',
    iconColor: 'text-[#E8A020]',
  },
]

export default function ActionCards() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14" aria-labelledby="action-heading">
      <h2 id="action-heading" className="sr-only">Quick actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {cards.map(({ icon: Icon, title, description, href, color, iconColor }) => (
          <Link
            key={href}
            href={href}
            className="group bg-white rounded-[18px] border border-[#E5E0D5] p-6 shadow-vastoq-sm hover:shadow-vastoq-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col gap-4"
          >
            <div className={`w-12 h-12 rounded-[12px] ${color} flex items-center justify-center`}>
              <Icon size={22} className={iconColor} aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#1A1814] mb-1">{title}</h3>
              <p className="text-[13px] text-[#4A4640] leading-relaxed">{description}</p>
            </div>
            <div className="flex items-center gap-1 text-[13px] font-semibold text-[#1B2B6B] mt-auto">
              <span>Explore</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
