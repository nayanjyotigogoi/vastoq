'use client'

import { usePrices } from '@/hooks/usePrices'

export default function PricingSection() {
  const prices = usePrices()

  const cards = [
    {
      who: 'Tenants / Users',
      price: `₹${prices.vastoq_points_pack_amount} pack`,
      what: `Get ${prices.vastoq_points_pack_points} Vastoq Points. Spend ${prices.listing_points_cost} pts to unlock a property (~₹${(prices.vastoq_points_pack_amount / Math.floor(prices.vastoq_points_pack_points / prices.listing_points_cost)).toFixed(0)} effective) or ${prices.worker_points_cost} pts for a worker (~₹${(prices.vastoq_points_pack_amount / Math.floor(prices.vastoq_points_pack_points / prices.worker_points_cost)).toFixed(0)} effective). Or pay directly: ₹${prices.listing_unlock_amount}/property · ₹${prices.worker_unlock_amount}/worker.`,
    },
    {
      who: 'Owners',
      price: 'Free to list',
      what: 'List property free. Reach verified tenants directly with zero broker commissions.',
    },
    {
      who: 'Workers',
      price: 'Free profile',
      what: 'Verify Aadhaar and get discovered. Keep 100% of the wages you negotiate.',
    },
  ]

  return (
    <div className="grid sm:grid-cols-3 gap-4 mt-8 text-left">
      {cards.map((p) => (
        <div key={p.who} className="bg-white/10 rounded-[14px] p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">{p.who}</p>
          <p className="text-[22px] font-extrabold text-white mb-1">{p.price}</p>
          <p className="text-[12px] text-white/60 leading-relaxed">{p.what}</p>
        </div>
      ))}
    </div>
  )
}
