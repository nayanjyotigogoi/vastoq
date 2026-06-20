'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import WorkerCard from './WorkerCard'
import UnlockGate from '@/components/listing/UnlockGate'
import { MOCK_WORKERS } from '@/lib/mock-data'

const CATEGORIES = ['All', 'Electrician', 'Plumber', 'Cleaner', 'Carpenter', 'Painter']
const CAT_ICONS: Record<string, string> = {
  All: '🔍',
  Electrician: '⚡',
  Plumber: '🔧',
  Cleaner: '🧹',
  Carpenter: '🪑',
  Painter: '🎨',
}

export default function WorkersClient() {
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [unlockTarget, setUnlockTarget] = useState<string | null>(null)

  const filtered = MOCK_WORKERS.filter((w) => {
    if (category !== 'All' && w.category !== category) return false
    if (search && !w.name.toLowerCase().includes(search.toLowerCase()) && !w.category.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const unlockWorker = MOCK_WORKERS.find((w) => w.id === unlockTarget)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#1A1814] mb-1">Local Workers</h1>
        <p className="text-[14px] text-[#4A4640]">
          {filtered.length} Aadhaar-verified workers available in Guwahati
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-[#E5E0D5] rounded-[10px] px-3 py-2.5 mb-5 shadow-vastoq-sm">
        <Search size={15} className="text-[#8A8480] flex-shrink-0" />
        <input
          type="text"
          placeholder="Search workers by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-[14px] text-[#1A1814] placeholder:text-[#8A8480] focus:outline-none"
          aria-label="Search workers"
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold transition-all border min-h-[40px] ${
              category === cat
                ? 'bg-[#1B2B6B] text-white border-[#1B2B6B]'
                : 'bg-white text-[#4A4640] border-[#E5E0D5] hover:border-[#1B2B6B] hover:text-[#1B2B6B]'
            }`}
            aria-pressed={category === cat}
          >
            <span aria-hidden="true">{CAT_ICONS[cat]}</span>
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-[18px] bg-[#E8ECF8] flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-[#1B2B6B]" />
          </div>
          <h3 className="text-[18px] font-bold text-[#1A1814] mb-2">No workers found</h3>
          <p className="text-[13px] text-[#4A4640]">Try changing the category or search term.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((worker) => (
            <WorkerCard key={worker.id} worker={worker} onUnlock={setUnlockTarget} />
          ))}
        </div>
      )}

      {/* Unlock modal */}
      {unlockTarget && unlockWorker && (
        <UnlockGate
          type="worker"
          subjectName={unlockWorker.name}
          subjectLocality={unlockWorker.localities[0]}
          onClose={() => setUnlockTarget(null)}
          onSuccess={() => setUnlockTarget(null)}
        />
      )}
    </div>
  )
}
