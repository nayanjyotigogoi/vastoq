'use client'

import { useEffect, useState, useMemo, useRef, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
  ArrowRight,
  X,
  Check,
  Loader2,
  Calendar,
  MapPin,
  Search,
  SlidersHorizontal,
  Armchair,
  Sparkles,
  Tag,
  Package,
} from 'lucide-react'

import {
  getFurnitureItems,
  createFurnitureEnquiry,
  formatCategoryName,
  FurnitureItem,
} from '@/lib/services/furniture.service'

const DURATIONS = [
  { value: 1, label: '1 month' },
  { value: 3, label: '3 months' },
  { value: 6, label: '6 months' },
  { value: 12, label: '12 months' },
]

function EnquiryModal({
  item,
  onClose,
}: {
  item: FurnitureItem
  onClose: () => void
}) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    locality: '',
    duration: 1,
    date: '',
    notes: '',
  })

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)

      await createFurnitureEnquiry({
        furniture_id: item.id,
        name: form.name,
        phone: form.phone,
        locality: form.locality,
        message: form.notes,
      })

      setSubmitted(true)
    } catch (error) {
      console.error(error)
      alert('Failed to submit enquiry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 overflow-hidden">
      <div className="bg-white w-full sm:max-w-md rounded-t-[20px] sm:rounded-[18px] shadow-vastoq-lg max-h-[90dvh] sm:max-h-[85vh] overflow-y-auto overscroll-contain">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#F5F0E8]">
          <div>
            <h2 className="text-[16px] font-bold text-[#1A1814]">
              Enquire to rent
            </h2>
            <p className="text-[12px] text-[#8A8480]">{item.name}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#F5F0E8]"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="px-5 py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4">
              <Check size={28} className="text-[#1D9E75]" />
            </div>

            <h3 className="text-[18px] font-bold text-[#1A1814]">Enquiry sent!</h3>

            <p className="text-[13px] text-[#4A4640] mt-2">
              We'll call you shortly regarding {item.name}.
            </p>

            <button
              onClick={onClose}
              className="mt-5 px-6 py-2.5 bg-[#1B2B6B] text-white font-semibold rounded-[10px]"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
            <input
              type="text"
              placeholder="Your name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-[#E5E0D5] rounded-[8px] px-3 py-2.5 text-sm focus:outline-none focus:border-[#1B2B6B]"
            />

            <input
              type="tel"
              placeholder="Phone number"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-[#E5E0D5] rounded-[8px] px-3 py-2.5 text-sm focus:outline-none focus:border-[#1B2B6B]"
            />

            <div className="relative">
              <MapPin
                size={14}
                className="absolute left-3 top-3 text-[#8A8480]"
              />
              <input
                type="text"
                placeholder="Locality in Guwahati"
                required
                value={form.locality}
                onChange={(e) =>
                  setForm({ ...form, locality: e.target.value })
                }
                className="w-full pl-9 border border-[#E5E0D5] rounded-[8px] px-3 py-2.5 text-sm focus:outline-none focus:border-[#1B2B6B]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#4A4640] mb-1.5">
                Rental Duration
              </label>
              <div className="grid grid-cols-4 gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setForm({ ...form, duration: d.value })}
                    className={`py-2 rounded-[8px] border text-xs font-semibold transition-colors ${
                      form.duration === d.value
                        ? 'bg-[#1B2B6B] text-white border-[#1B2B6B]'
                        : 'border-[#E5E0D5] text-[#4A4640] hover:bg-[#F5F0E8]'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <Calendar
                size={14}
                className="absolute left-3 top-3 text-[#8A8480]"
              />
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full pl-9 border border-[#E5E0D5] rounded-[8px] px-3 py-2.5 text-sm focus:outline-none focus:border-[#1B2B6B]"
              />
            </div>

            <textarea
              rows={3}
              placeholder="Additional requirements or questions..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border border-[#E5E0D5] rounded-[8px] px-3 py-2.5 text-sm focus:outline-none focus:border-[#1B2B6B]"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1B2B6B] text-white font-bold py-3 rounded-[10px] hover:bg-[#2D3E8C] transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Sending...
                </span>
              ) : (
                'Send enquiry'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function FurniturePageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const initialCategory = searchParams.get('category') || 'all'

  const [items, setItems] = useState<FurnitureItem[]>([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'low-to-high' | 'high-to-low' | 'default'>('default')
  const [enquiryItem, setEnquiryItem] = useState<FurnitureItem | null>(null)

  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Sync state with URL params
  useEffect(() => {
    const cat = searchParams.get('category') || 'all'
    setSelectedCategory(cat)
  }, [searchParams])

  useEffect(() => {
    loadFurniture()
  }, [])

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadFurniture = async () => {
    try {
      setLoadingItems(true)
      const data = await getFurnitureItems()
      setItems(data)
    } catch (error) {
      console.error('Failed to load furniture items:', error)
    } finally {
      setLoadingItems(false)
    }
  }

  // Extract all available categories from database items dynamically
  const categoriesInDB = useMemo(() => {
    const categoryMap = new Map<string, number>()
    items.forEach((item) => {
      if (item.category) {
        const count = categoryMap.get(item.category) || 0
        categoryMap.set(item.category, count + 1)
      }
    })

    const list = Array.from(categoryMap.entries()).map(([catKey, count]) => ({
      key: catKey,
      name: formatCategoryName(catKey),
      count,
    }))

    list.sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [items])

  // Compute live search suggestions & nearby item matches
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) {
      return { matchingCategories: [], matchingItems: [], nearbyItems: [] }
    }

    const q = searchQuery.toLowerCase().trim()

    // 1. Matching categories
    const matchingCategories = categoriesInDB.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.key.toLowerCase().includes(q)
    )

    // 2. Direct matching items
    const matchingItems = items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
    )

    // 3. Nearby / Suggested items if exact query returns partial match or typo
    let nearbyItems: FurnitureItem[] = []
    if (matchingItems.length < 3) {
      const qTokens = q.split(/\s+/).filter((t) => t.length >= 2)
      nearbyItems = items.filter((item) => {
        if (matchingItems.some((m) => m.id === item.id)) return false
        const nameLower = item.name.toLowerCase()
        const catLower = item.category.toLowerCase()
        return qTokens.some(
          (tok) => nameLower.includes(tok) || catLower.includes(tok)
        )
      })
    }

    return {
      matchingCategories,
      matchingItems: matchingItems.slice(0, 5),
      nearbyItems: nearbyItems.slice(0, 3),
    }
  }, [searchQuery, items, categoriesInDB])

  const handleCategorySelect = (categoryKey: string) => {
    setSelectedCategory(categoryKey)
    setIsSearchDropdownOpen(false)
    const params = new URLSearchParams(searchParams.toString())
    if (categoryKey === 'all') {
      params.delete('category')
    } else {
      params.set('category', categoryKey)
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleSelectSuggestionItem = (item: FurnitureItem) => {
    setSearchQuery(item.name)
    setSelectedCategory('all')
    setIsSearchDropdownOpen(false)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('category')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Filter and sort items dynamically
  const filteredItems = useMemo(() => {
    let result = [...items]

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(
        (item) => item.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          item.category.toLowerCase().includes(q)
      )
    }

    // Sorting
    if (sortBy === 'low-to-high') {
      result.sort((a, b) => Number(a.price_per_month) - Number(b.price_per_month))
    } else if (sortBy === 'high-to-low') {
      result.sort((a, b) => Number(b.price_per_month) - Number(a.price_per_month))
    }

    return result
  }, [items, selectedCategory, searchQuery, sortBy])

  const hasSuggestions =
    searchSuggestions.matchingCategories.length > 0 ||
    searchSuggestions.matchingItems.length > 0 ||
    searchSuggestions.nearbyItems.length > 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1B2B6B] to-[#1D9E75] rounded-[20px] p-8 sm:p-12 text-center text-white mb-8 shadow-vastoq-md">
        <h1 className="text-[28px] sm:text-[38px] font-extrabold mb-3 tracking-tight">
          Furniture Rentals in Guwahati
        </h1>
        <p className="text-[15px] sm:text-[16px] text-white/85 max-w-2xl mx-auto">
          Rent beds, sofas, refrigerators, washing machines, and complete home setups with zero deposit, free delivery, and flexible monthly plans.
        </p>
      </div>

      {/* Filter and Search Section */}
      <div className="bg-white rounded-[18px] border border-[#E5E0D5] p-4 sm:p-6 mb-8 shadow-vastoq-sm space-y-4">
        
        {/* Search and Sort controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          
          {/* Search box with Suggestions Dropdown */}
          <div className="relative flex-1 w-full" ref={searchContainerRef}>
            <Search size={16} className="absolute left-3.5 top-3.5 text-[#8A8480] pointer-events-none" />
            <input
              type="text"
              placeholder="Search furniture by name, type, or description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setIsSearchDropdownOpen(true)
              }}
              onFocus={() => setIsSearchDropdownOpen(true)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAF8] border border-[#E5E0D5] rounded-[12px] text-[14px] text-[#1A1814] placeholder:text-[#8A8480] focus:outline-none focus:border-[#1B2B6B] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setIsSearchDropdownOpen(false)
                }}
                className="absolute right-3 top-3 text-[#8A8480] hover:text-[#1A1814] p-0.5"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}

            {/* User-friendly Autocomplete / Suggestions Dropdown */}
            {isSearchDropdownOpen && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-[16px] border border-[#E5E0D5] shadow-vastoq-lg z-50 overflow-hidden text-left max-h-[380px] overflow-y-auto divide-y divide-[#F5F0E8]">
                
                {/* 1. Category suggestions */}
                {searchSuggestions.matchingCategories.length > 0 && (
                  <div className="p-3 bg-[#FAFAF8]">
                    <div className="text-[11px] font-bold text-[#8A8480] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Tag size={12} className="text-[#1D9E75]" />
                      Matching Categories
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchSuggestions.matchingCategories.map((cat) => (
                        <button
                          key={cat.key}
                          onClick={() => handleCategorySelect(cat.key)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-[#E5E0D5] text-[13px] font-semibold text-[#1B2B6B] hover:bg-[#E8ECF8] transition-colors flex items-center gap-1.5"
                        >
                          <span>{cat.name}</span>
                          <span className="text-[10px] text-[#8A8480]">({cat.count})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Direct item matches */}
                {searchSuggestions.matchingItems.length > 0 && (
                  <div className="p-2">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-[#8A8480] uppercase tracking-wider flex items-center gap-1.5">
                      <Package size={12} className="text-[#1B2B6B]" />
                      Suggested Items
                    </div>
                    {searchSuggestions.matchingItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelectSuggestionItem(item)}
                        className="w-full text-left px-3 py-2 rounded-[10px] hover:bg-[#F5F0E8] transition-colors flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={
                              item.image_url ||
                              'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&q=80'
                            }
                            alt={item.name}
                            className="w-9 h-9 rounded-md object-cover flex-shrink-0 border border-[#E5E0D5]"
                          />
                          <div className="truncate">
                            <div className="text-[13px] font-bold text-[#1A1814] group-hover:text-[#1B2B6B] truncate">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-[#8A8480]">
                              {formatCategoryName(item.category)}
                            </div>
                          </div>
                        </div>

                        <span className="text-[12px] font-bold text-[#1B2B6B] flex-shrink-0">
                          ₹{item.price_per_month}/mo
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* 3. Nearby / Related suggestions */}
                {searchSuggestions.nearbyItems.length > 0 && (
                  <div className="p-2 bg-[#FAF8F5]">
                    <div className="px-3 py-1 text-[11px] font-bold text-[#E8A020] uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={12} />
                      Did you mean / Related items
                    </div>
                    {searchSuggestions.nearbyItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelectSuggestionItem(item)}
                        className="w-full text-left px-3 py-1.5 rounded-[8px] hover:bg-white transition-colors flex items-center justify-between gap-2"
                      >
                        <span className="text-[12px] font-medium text-[#4A4640]">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-[#8A8480]">
                          ₹{item.price_per_month}/mo
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* No suggestions found */}
                {!hasSuggestions && (
                  <div className="p-4 text-center text-[13px] text-[#8A8480]">
                    No items matching "{searchQuery}". Try selecting from categories below.
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SlidersHorizontal size={15} className="text-[#1B2B6B] hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto bg-[#FAFAF8] border border-[#E5E0D5] rounded-[12px] px-3 py-2.5 text-[13px] font-semibold text-[#1A1814] focus:outline-none cursor-pointer"
            >
              <option value="default">Sort: Default</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills Bar */}
        <div className="pt-2 border-t border-[#F5F0E8]">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {/* All Items Button (Renamed from "All Possible Items" to "All") */}
            <button
              onClick={() => handleCategorySelect('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-[10px] text-[13px] font-bold transition-all flex items-center gap-1.5 ${
                selectedCategory === 'all'
                  ? 'bg-[#1B2B6B] text-white shadow-sm'
                  : 'bg-[#F5F0E8] text-[#4A4640] hover:bg-[#E5E0D5] hover:text-[#1A1814]'
              }`}
            >
              <span>All</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-[#E5E0D5] text-[#1A1814]'
              }`}>
                {items.length}
              </span>
            </button>

            {/* Dynamic DB Categories */}
            {categoriesInDB.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.key.toLowerCase()

              return (
                <button
                  key={cat.key}
                  onClick={() => handleCategorySelect(cat.key)}
                  className={`flex-shrink-0 px-4 py-2 rounded-[10px] text-[13px] font-semibold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#1B2B6B] text-white shadow-sm'
                      : 'bg-[#F5F0E8] text-[#4A4640] hover:bg-[#E5E0D5] hover:text-[#1A1814]'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#E5E0D5] text-[#1A1814]'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[20px] font-bold text-[#1A1814] flex items-center gap-2">
          <span>
            {selectedCategory === 'all'
              ? 'All Furniture Items'
              : `${formatCategoryName(selectedCategory)} Rentals`}
          </span>
          <span className="text-[13px] font-normal text-[#8A8480]">
            ({filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found)
          </span>
        </h2>

        {(selectedCategory !== 'all' || searchQuery || sortBy !== 'default') && (
          <button
            onClick={() => {
              setSelectedCategory('all')
              setSearchQuery('')
              setSortBy('default')
              setIsSearchDropdownOpen(false)
              router.push(pathname, { scroll: false })
            }}
            className="text-[13px] font-semibold text-[#1B2B6B] hover:underline flex items-center gap-1"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Item Grid */}
      {loadingItems ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="bg-white rounded-[16px] border border-[#E5E0D5] p-4 h-72 animate-pulse"
            />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-[16px] border border-[#E5E0D5] overflow-hidden shadow-vastoq-sm hover:shadow-vastoq-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col"
            >
              <div className="aspect-square bg-[#F5F0E8] overflow-hidden relative">
                <img
                  src={
                    item.image_url ||
                    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80'
                  }
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/95 text-[#1B2B6B] shadow-sm backdrop-blur-sm">
                  {formatCategoryName(item.category)}
                </span>
              </div>

              <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-bold text-[#1A1814] text-[15px] group-hover:text-[#1B2B6B] transition-colors leading-snug">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-[12px] text-[#8A8480] mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#F5F0E8]">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-[11px] text-[#8A8480]">Monthly rent</span>
                    <span className="text-[16px] font-extrabold text-[#1B2B6B]">
                      ₹{item.price_per_month}<span className="text-[11px] font-normal text-[#4A4640]">/mo</span>
                    </span>
                  </div>

                  <button
                    onClick={() => setEnquiryItem(item)}
                    className="w-full bg-[#1B2B6B] text-white text-[13px] font-bold py-2.5 rounded-[10px] flex items-center justify-center gap-1.5 hover:bg-[#2D3E8C] transition-colors min-h-[40px]"
                  >
                    <span>Enquire to rent</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[18px] border border-[#E5E0D5] p-12 text-center my-6">
          <div className="w-16 h-16 rounded-full bg-[#F5F0E8] flex items-center justify-center mx-auto mb-3 text-[#1B2B6B]">
            <Armchair size={28} />
          </div>
          <h3 className="text-[18px] font-bold text-[#1A1814]">No furniture items found</h3>
          <p className="text-[13px] text-[#4A4640] mt-1 max-w-md mx-auto">
            No furniture items matched your selected category or search filter. Try clearing your search query or selecting "All".
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all')
              setSearchQuery('')
              setSortBy('default')
              setIsSearchDropdownOpen(false)
              router.push(pathname, { scroll: false })
            }}
            className="mt-4 px-5 py-2.5 bg-[#1B2B6B] text-white text-[13px] font-bold rounded-[10px] hover:bg-[#2D3E8C] transition-colors"
          >
            View All Furniture Items
          </button>
        </div>
      )}

      {enquiryItem && (
        <EnquiryModal
          item={enquiryItem}
          onClose={() => setEnquiryItem(null)}
        />
      )}
    </div>
  )
}

export default function FurniturePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          Loading furniture catalog...
        </div>
      }
    >
      <FurniturePageContent />
    </Suspense>
  )
}
