import { ShieldCheck, BadgeCheck, EyeOff, Star } from 'lucide-react'

const items = [
  { icon: ShieldCheck, label: 'No broker fees' },
  { icon: BadgeCheck, label: 'Verified owners only' },
  { icon: EyeOff, label: 'Safe, masked contact' },
  { icon: Star, label: 'Honest reviews' },
]

export default function TrustBar() {
  return (
    <section className="bg-[#F5F0E8] border-b border-[#E5E0D5]" aria-label="Trust signals">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {items.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon size={16} className="text-[#1B2B6B]" aria-hidden="true" />
              <span className="text-[13px] font-semibold text-[#1A1814]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
