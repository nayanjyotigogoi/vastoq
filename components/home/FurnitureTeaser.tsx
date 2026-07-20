'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  getDynamicCategorySummaries,
  DynamicCategorySummary,
} from '@/lib/services/furniture.service'

export default function FurnitureTeaser() {
  const [categories, setCategories] = useState<DynamicCategorySummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCategories() {
      try {
        const { categories: cats } = await getDynamicCategorySummaries()
        setCategories(cats)
      } catch (err) {
        console.error('Failed to load furniture categories:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  if (!loading && categories.length === 0) {
    return null
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14" aria-labelledby="furniture-heading">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="label-uppercase text-[#1D9E75] mb-1">No purchase needed</p>
          <h2 id="furniture-heading" className="text-[22px] font-bold text-[#1A1814]">
            Furniture Rental Categories
          </h2>
          <p className="text-[13px] text-[#4A4640] mt-1">Quality furniture & appliances delivered to your door.</p>
        </div>
        <Link
          href="/furniture"
          className="hidden sm:flex items-center gap-1.5 text-[13px] font-semibold text-[#1B2B6B] hover:text-[#2D3E8C] transition-colors"
        >
          Browse catalog <ArrowRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-[14px] border border-[#E5E0D5] p-3 h-44 animate-pulse" />
          ))}
        </div>
      ) : (
        /* Horizontal scroll on mobile, grid on desktop */
        <div className="flex sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/furniture?category=${encodeURIComponent(cat.id)}`}
              className="flex-shrink-0 w-36 sm:w-auto group bg-white rounded-[14px] border border-[#E5E0D5] overflow-hidden shadow-vastoq-sm hover:shadow-vastoq-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="aspect-square bg-[#F5F0E8] overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-2.5">
                <div className="text-[13px] font-semibold text-[#1A1814] truncate">{cat.name}</div>
                <div className="text-[11px] font-medium text-[#1D9E75] mt-0.5">
                  From ₹{cat.startingPrice}/mo
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        <Link
          href="/furniture"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] border-2 border-[#1B2B6B] text-[14px] font-bold text-[#1B2B6B] hover:bg-[#E8ECF8] transition-colors min-h-[48px]"
        >
          Enquire about furniture rental <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  )
}
