'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Sparkles,
  Truck,
  ShieldCheck,
  RefreshCw,
  Armchair,
  Refrigerator,
  BedDouble,
  Tv,
  Package,
  Wrench,
  Flame,
} from 'lucide-react'
import {
  getDynamicCategorySummaries,
  DynamicCategorySummary,
} from '@/lib/services/furniture.service'

const CATEGORY_ICONS: Record<string, any> = {
  bed: BedDouble,
  sofa: Armchair,
  refrigerator: Refrigerator,
  television: Tv,
  tv: Tv,
  washing_machine: Package,
  dining_table: Package,
  chair: Armchair,
  study_table: Package,
  wardrobe: Package,
  mattress: BedDouble,
  air_conditioner: Package,
}

export default function FurnitureBanner() {
  const [categories, setCategories] = useState<DynamicCategorySummary[]>([])
  const [minPrice, setMinPrice] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDynamicData() {
      try {
        const { categories: cats, overallMinPrice } =
          await getDynamicCategorySummaries()
        setCategories(cats)
        setMinPrice(overallMinPrice)
      } catch (err) {
        console.error('Failed to load dynamic furniture categories:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDynamicData()
  }, [])

  const highlights = [
    { icon: Truck, text: 'Free Delivery & Setup' },
    { icon: ShieldCheck, text: 'Zero Maintenance Fee' },
    { icon: RefreshCw, text: 'Easy Returns & Swap' },
  ]

  // Display top 4-6 categories dynamically from database
  const popularPills = categories.slice(0, 6)

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 my-8" aria-label="Furniture Rental Scheme">
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#1B2B6B] via-[#18265C] to-[#1D9E75] p-6 sm:p-10 text-white shadow-vastoq-lg border border-white/10">
        
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#1D9E75]/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#1B2B6B]/40 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main content column */}
          <div className="lg:col-span-7 space-y-5">
            {/* Tag / Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25">
              <Sparkles size={14} className="text-[#FFD166] animate-pulse" />
              <span className="text-[12px] sm:text-[13px] font-bold tracking-wide uppercase text-white/95">
                Vastoq Furniture Scheme · Rent & Save
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Furnish your entire home <br className="hidden sm:inline" />
              <span className="text-[#A2F0D3]">without buying a single piece.</span>
            </h2>

            {/* Description */}
            <p className="text-white/85 text-[14px] sm:text-[16px] leading-relaxed max-w-xl">
              Moving into a new flat or PG in Guwahati? Rent verified beds, sofas, refrigerators, washing machines & study desks starting at just{' '}
              <strong className="text-white underline decoration-[#1D9E75] decoration-2">
                {minPrice > 0 ? `₹${minPrice}/month` : 'affordable monthly rates'}
              </strong>
              .
            </p>

            {/* Feature Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {highlights.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-[12px] sm:text-[13px] font-medium text-white/90"
                >
                  <Icon size={14} className="text-[#A2F0D3]" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/furniture"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[12px] bg-white text-[#1B2B6B] text-[15px] font-bold shadow-md hover:bg-[#F5F0E8] transition-all hover:scale-[1.02] min-h-[48px]"
              >
                <span>Browse Furniture Catalog ({categories.reduce((acc, c) => acc + c.itemCount, 0)} Items)</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
            </div>
          </div>

          {/* Dynamic Popular Category Column */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-[18px] border border-white/20 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <div className="flex items-center gap-1.5">
                <Flame size={16} className="text-[#FFD166]" />
                <h3 className="text-[14px] font-bold text-white uppercase tracking-wider">
                  Popular Rentals
                </h3>
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-white/20 text-white/90">
                Flexible Tenure
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-3 animate-pulse py-2">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-16 rounded-[12px] bg-white/10" />
                ))}
              </div>
            ) : popularPills.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {popularPills.map((cat) => {
                  const IconComponent =
                    CATEGORY_ICONS[cat.id.toLowerCase()] || Package

                  return (
                    <Link
                      key={cat.id}
                      href={`/furniture?category=${encodeURIComponent(cat.id)}`}
                      className="group flex flex-col p-3 rounded-[12px] bg-white/10 hover:bg-white/20 border border-white/15 transition-all hover:-translate-y-0.5"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <IconComponent size={18} className="text-[#A2F0D3]" />
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1D9E75]/50 text-white">
                          From ₹{cat.startingPrice}/mo
                        </span>
                      </div>
                      <span className="text-[13px] font-bold text-white group-hover:text-[#A2F0D3] transition-colors truncate">
                        {cat.name}
                      </span>
                      <span className="text-[11px] text-white/70 flex items-center justify-between mt-0.5">
                        <span>{cat.itemCount} available</span>
                        <ArrowRight
                          size={10}
                          className="group-hover:translate-x-0.5 transition-transform"
                        />
                      </span>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-white/70 text-sm">
                No furniture items available currently in database.
              </div>
            )}

            <div className="pt-2 text-center border-t border-white/15">
              <Link
                href="/furniture"
                className="text-[12px] font-semibold text-white/90 hover:text-white underline decoration-white/50"
              >
                Explore all items in Guwahati →
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
