'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Home, Users, Wrench, CheckCircle2, XCircle, Clock, Eye,
  TrendingUp, IndianRupee, Search, MoreVertical, ShieldCheck, Loader2
} from 'lucide-react'
import type { Listing, WorkerProfile, User } from '@/lib/types'

type AdminTab = 'overview' | 'listings' | 'workers' | 'users'

interface PlatformStats {
  listings: { total: number; active: number; pending: number; rejected: number }
  workers: { total: number; verified: number; pending: number }
  users: { total: number; blocked: number; aadhaarPending: number }
  revenue: { totalPaise: number; totalPayments: number }
  unlocks: { total: number }
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [listingFilter, setListingFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('all')
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [workers, setWorkers] = useState<WorkerProfile[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loadingTab, setLoadingTab] = useState(false)

  // Fetch stats on mount
  useEffect(() => {
    fetch('/api/admin/stats', { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => setStats(j.data))
      .catch(() => {})
  }, [])

  const fetchTabData = useCallback(async (tab: AdminTab) => {
    setLoadingTab(true)
    try {
      if (tab === 'listings') {
        const r = await fetch('/api/admin/listings', { credentials: 'include' })
        const j = await r.json()
        setListings(j.data ?? [])
      } else if (tab === 'workers') {
        const r = await fetch('/api/workers?limit=50', { credentials: 'include' })
        const j = await r.json()
        setWorkers(j.data ?? [])
      } else if (tab === 'users') {
        const r = await fetch('/api/admin/users', { credentials: 'include' })
        const j = await r.json()
        setUsers(j.data ?? [])
      }
    } catch { /* ignore */ } finally {
      setLoadingTab(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab !== 'overview') fetchTabData(activeTab)
  }, [activeTab, fetchTabData])

  const handleListingAction = async (id: string, action: string) => {
    await fetch(`/api/admin/listings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action }),
    })
    fetchTabData('listings')
  }

  const handleWorkerAction = async (id: string, action: string) => {
    await fetch(`/api/admin/workers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action }),
    })
    fetchTabData('workers')
  }

  const handleUserAction = async (id: string, action: string) => {
    await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action }),
    })
    fetchTabData('users')
  }

  const tabs: { id: AdminTab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'listings', label: 'Listings', count: stats?.listings.pending },
    { id: 'workers', label: 'Workers', count: stats?.workers.pending },
    { id: 'users', label: 'Users' },
  ]

  const filteredListings = listings.filter((l) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = l.title.toLowerCase().includes(q) || l.locality.toLowerCase().includes(q)
    if (listingFilter === 'pending') return matchesSearch && l.status === 'pending'
    if (listingFilter === 'rejected') return matchesSearch && l.status === 'rejected'
    if (listingFilter === 'active') return matchesSearch && l.status === 'active'
    return matchesSearch
  })

  const STATS_CARDS = stats ? [
    { label: 'Total listings', value: String(stats.listings.total), delta: `${stats.listings.active} active`, icon: Home, color: 'bg-[#E8ECF8]', icolor: 'text-[#1B2B6B]' },
    { label: 'Active workers', value: String(stats.workers.verified), delta: `${stats.workers.pending} pending verify`, icon: Wrench, color: 'bg-[#E1F5EE]', icolor: 'text-[#1D9E75]' },
    { label: 'Total users', value: String(stats.users.total), delta: `${stats.users.blocked} blocked`, icon: Users, color: 'bg-[#FEF3DC]', icolor: 'text-[#E8A020]' },
    { label: 'Revenue (₹)', value: (stats.revenue.totalPaise / 100).toLocaleString('en-IN'), delta: `${stats.revenue.totalPayments} payments`, icon: IndianRupee, color: 'bg-[#E8ECF8]', icolor: 'text-[#1B2B6B]' },
  ] : []

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      {/* Admin topbar */}
      <header className="sticky top-0 z-50 bg-[#1B2B6B] border-b border-[#2D3E8C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-[56px] gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white font-extrabold text-[18px] tracking-tight">
              Vastoq<span className="text-[#1D9E75]">.</span>
            </Link>
            <span className="px-2 py-0.5 bg-[#D84040] text-white text-[10px] font-bold rounded uppercase tracking-wider">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-white/20 text-white text-[12px] font-bold flex items-center justify-center">A</div>
            <span className="text-white text-[13px] font-medium hidden sm:block">Admin</span>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-[24px] font-extrabold text-[#1A1814]">Admin Panel</h1>
          <p className="text-[13px] text-[#8A8480]">Manage listings, workers, and users for Vastoq Guwahati</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS_CARDS.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-[14px] border border-[#E5E0D5] p-4 shadow-vastoq-sm animate-pulse h-[104px]" />
            ))
          ) : STATS_CARDS.map((s) => (
            <div key={s.label} className="bg-white rounded-[14px] border border-[#E5E0D5] p-4 shadow-vastoq-sm">
              <div className={`w-9 h-9 rounded-[8px] ${s.color} flex items-center justify-center mb-3`}>
                <s.icon size={17} className={s.icolor} />
              </div>
              <p className="text-[22px] font-extrabold text-[#1A1814] leading-none">{s.value}</p>
              <p className="text-[12px] font-semibold text-[#1A1814] mt-1">{s.label}</p>
              <p className="text-[10px] text-[#1D9E75] font-medium mt-0.5 flex items-center gap-1">
                <TrendingUp size={9} /> {s.delta}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#F5F0E8] p-1 rounded-[12px] mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-[9px] text-[13px] font-semibold whitespace-nowrap transition-all ${
                activeTab === t.id
                  ? 'bg-white text-[#1B2B6B] shadow-vastoq-sm'
                  : 'text-[#8A8480] hover:text-[#1A1814]'
              }`}
            >
              {t.label}
              {t.count ? (
                <span className="w-5 h-5 rounded-full bg-[#D84040] text-white text-[10px] font-bold flex items-center justify-center">
                  {t.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Pending listings */}
            <div className="bg-white rounded-[16px] border border-[#E5E0D5] shadow-vastoq-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5F0E8]">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-[#E8A020]" />
                  <h2 className="text-[14px] font-bold text-[#1A1814]">Pending review</h2>
                  {stats && (
                    <span className="w-5 h-5 rounded-full bg-[#E8A020] text-white text-[10px] font-bold flex items-center justify-center">{stats.listings.pending}</span>
                  )}
                </div>
                <button
                  onClick={() => { setActiveTab('listings'); setListingFilter('pending') }}
                  className="text-[12px] text-[#1B2B6B] font-semibold hover:underline"
                >
                  View all
                </button>
              </div>
              {!stats ? (
                <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-[#1B2B6B]" /></div>
              ) : stats.listings.pending === 0 ? (
                <p className="text-[13px] text-[#8A8480] text-center py-8">No pending listings</p>
              ) : (
                <p className="text-[13px] text-[#4A4640] text-center py-8 font-medium">
                  {stats.listings.pending} listing{stats.listings.pending !== 1 ? 's' : ''} awaiting review
                  <br /><span className="text-[11px] text-[#8A8480]">Click &ldquo;View all&rdquo; to manage them</span>
                </p>
              )}
            </div>

            {/* Worker verification queue */}
            <div className="bg-white rounded-[16px] border border-[#E5E0D5] shadow-vastoq-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5F0E8]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-[#1D9E75]" />
                  <h2 className="text-[14px] font-bold text-[#1A1814]">Aadhaar verifications</h2>
                  {stats && (
                    <span className="w-5 h-5 rounded-full bg-[#1D9E75] text-white text-[10px] font-bold flex items-center justify-center">{stats.workers.pending}</span>
                  )}
                </div>
                <button onClick={() => setActiveTab('workers')} className="text-[12px] text-[#1B2B6B] font-semibold hover:underline">View all</button>
              </div>
              {!stats ? (
                <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-[#1B2B6B]" /></div>
              ) : stats.workers.pending === 0 ? (
                <p className="text-[13px] text-[#8A8480] text-center py-8">All workers are verified</p>
              ) : (
                <p className="text-[13px] text-[#4A4640] text-center py-8 font-medium">
                  {stats.workers.pending} worker{stats.workers.pending !== 1 ? 's' : ''} pending verification
                  <br /><span className="text-[11px] text-[#8A8480]">Click &ldquo;View all&rdquo; to review</span>
                </p>
              )}
            </div>

            {/* Platform summary */}
            <div className="bg-white rounded-[16px] border border-[#E5E0D5] shadow-vastoq-sm overflow-hidden lg:col-span-2">
              <div className="flex items-center px-5 py-4 border-b border-[#F5F0E8] gap-2">
                <IndianRupee size={15} className="text-[#1B2B6B]" />
                <h2 className="text-[14px] font-bold text-[#1A1814]">Platform summary</h2>
              </div>
              {stats ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-y divide-[#F5F0E8]">
                  {[
                    { label: 'Total unlocks', value: stats.unlocks.total },
                    { label: 'Blocked users', value: stats.users.blocked },
                    { label: 'Aadhaar pending (users)', value: stats.users.aadhaarPending },
                    { label: 'Rejected listings', value: stats.listings.rejected },
                  ].map((item) => (
                    <div key={item.label} className="p-5 text-center">
                      <p className="text-[24px] font-extrabold text-[#1B2B6B]">{item.value}</p>
                      <p className="text-[11px] text-[#8A8480] font-medium mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-[#1B2B6B]" /></div>
              )}
            </div>
          </div>
        )}

        {/* Listings tab */}
        {activeTab === 'listings' && (
          <div>
            {/* Filters */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <div className="flex items-center gap-2 flex-1 px-3 py-2.5 bg-white border border-[#E5E0D5] rounded-[10px] min-w-[200px]">
                <Search size={14} className="text-[#8A8480]" />
                <input
                  type="text"
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-[13px] text-[#1A1814] placeholder:text-[#8A8480] focus:outline-none"
                />
              </div>
              <div className="flex gap-1.5">
                {(['all', 'pending', 'active', 'rejected'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setListingFilter(f)}
                    className={`px-3 py-2 rounded-[8px] text-[12px] font-semibold border transition-colors capitalize ${
                      listingFilter === f
                        ? 'border-[#1B2B6B] bg-[#E8ECF8] text-[#1B2B6B]'
                        : 'border-[#E5E0D5] text-[#4A4640] hover:border-[#1B2B6B] bg-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[16px] border border-[#E5E0D5] shadow-vastoq-sm overflow-hidden">
              {loadingTab ? (
                <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-[#1B2B6B]" /></div>
              ) : filteredListings.length === 0 ? (
                <div className="py-12 text-center text-[13px] text-[#8A8480]">No listings found.</div>
              ) : (
                filteredListings.map((l, i) => (
                  <div key={l.id} className={`flex items-center gap-4 px-5 py-4 ${i < filteredListings.length - 1 ? 'border-b border-[#F5F0E8]' : ''}`}>
                    {l.photos[0] ? (
                      <img src={l.photos[0]} alt={l.title} className="w-14 h-12 object-cover rounded-[8px] flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-12 bg-[#E8ECF8] rounded-[8px] flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-[13px] font-semibold text-[#1A1814] truncate">{l.title}</p>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          l.status === 'pending' ? 'bg-[#FEF3DC] text-[#E8A020]' :
                          l.status === 'active' ? 'bg-[#E1F5EE] text-[#1D9E75]' :
                          l.status === 'rejected' ? 'bg-red-50 text-[#D84040]' :
                          'bg-[#F5F0E8] text-[#8A8480]'
                        }`}>
                          {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                        </span>
                        {l.isBroker && <span className="px-2 py-0.5 bg-red-50 text-[#D84040] text-[10px] font-bold rounded-full">Broker</span>}
                      </div>
                      <p className="text-[11px] text-[#8A8480]">
                        {l.locality}, {l.city} · ₹{Math.round(l.rentPerMonth / 100).toLocaleString('en-IN')}/mo · {l.bhkType}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link href={`/rentals/${l.id}`} className="p-1.5 rounded-[6px] hover:bg-[#E8ECF8] transition-colors" aria-label="View">
                        <Eye size={14} className="text-[#4A4640]" />
                      </Link>
                      {l.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleListingAction(l.id, 'approve')}
                            className="px-3 py-1.5 bg-[#E1F5EE] text-[#1D9E75] text-[11px] font-bold rounded-[6px] hover:bg-[#1D9E75] hover:text-white transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleListingAction(l.id, 'reject')}
                            className="px-3 py-1.5 bg-[#F5F0E8] text-[#D84040] text-[11px] font-bold rounded-[6px] hover:bg-[#D84040] hover:text-white transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {l.status === 'active' && (
                        <button
                          onClick={() => handleListingAction(l.id, l.isFeatured ? 'unfeature' : 'feature')}
                          className="px-3 py-1.5 bg-[#F5F0E8] text-[#4A4640] text-[11px] font-semibold rounded-[6px] hover:bg-[#E8ECF8] transition-colors"
                        >
                          {l.isFeatured ? 'Unfeature' : 'Feature'}
                        </button>
                      )}
                      <button className="p-1.5 rounded-[6px] hover:bg-[#E8ECF8] transition-colors" aria-label="More options">
                        <MoreVertical size={14} className="text-[#4A4640]" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Workers tab */}
        {activeTab === 'workers' && (
          <div className="bg-white rounded-[16px] border border-[#E5E0D5] shadow-vastoq-sm overflow-hidden">
            {loadingTab ? (
              <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-[#1B2B6B]" /></div>
            ) : workers.length === 0 ? (
              <div className="py-12 text-center text-[13px] text-[#8A8480]">No workers found.</div>
            ) : (
              workers.map((w, i) => (
                <div key={w.id} className={`flex items-center gap-4 px-5 py-4 ${i < workers.length - 1 ? 'border-b border-[#F5F0E8]' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-[#E8ECF8] flex items-center justify-center font-bold text-[#1B2B6B] flex-shrink-0">
                    {w.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-[13px] font-semibold text-[#1A1814]">{w.name}</p>
                      {w.isVerified ? (
                        <span className="px-2 py-0.5 bg-[#E1F5EE] text-[#1D9E75] text-[10px] font-bold rounded-full flex items-center gap-1">
                          <ShieldCheck size={9} /> Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-[#FEF3DC] text-[#E8A020] text-[10px] font-bold rounded-full">Pending</span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#8A8480]">
                      {w.category} · {w.ratePerDay ? `₹${Math.round(w.ratePerDay / 100)}/day` : 'Rate TBD'} · {w.locality}, {w.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 text-center hidden sm:flex">
                    <div>
                      <p className="text-[14px] font-bold text-[#1A1814]">{w.rating.toFixed(1)}</p>
                      <p className="text-[10px] text-[#8A8480]">rating</p>
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-[#1A1814]">{w.reviewCount}</p>
                      <p className="text-[10px] text-[#8A8480]">reviews</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {!w.isVerified && (
                      <button
                        onClick={() => handleWorkerAction(w.id, 'verify')}
                        className="px-3 py-1.5 bg-[#E1F5EE] text-[#1D9E75] text-[11px] font-bold rounded-[6px] hover:bg-[#1D9E75] hover:text-white transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 size={11} /> Verify
                      </button>
                    )}
                    {w.isActive && (
                      <button
                        onClick={() => handleWorkerAction(w.id, 'deactivate')}
                        className="px-3 py-1.5 bg-[#F5F0E8] text-[#D84040] text-[11px] font-bold rounded-[6px] hover:bg-[#D84040] hover:text-white transition-colors"
                      >
                        Deactivate
                      </button>
                    )}
                    <button className="p-1.5 rounded-[6px] hover:bg-[#E8ECF8] transition-colors" aria-label="More">
                      <MoreVertical size={14} className="text-[#4A4640]" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Users tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-[16px] border border-[#E5E0D5] shadow-vastoq-sm overflow-hidden">
            {loadingTab ? (
              <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-[#1B2B6B]" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-[#F5F0E8]">
                      {['Name', 'Role', 'Phone', 'Credits', 'Aadhaar', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#8A8480]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-t border-[#F5F0E8] hover:bg-[#FAFAF8] transition-colors">
                        <td className="px-4 py-3 font-medium text-[#1A1814]">{u.name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'owner' ? 'bg-[#FEF3DC] text-[#E8A020]' :
                            u.role === 'worker' ? 'bg-[#E1F5EE] text-[#1D9E75]' :
                            u.role === 'admin' ? 'bg-red-50 text-[#D84040]' :
                            'bg-[#E8ECF8] text-[#1B2B6B]'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#4A4640]">{u.phone}</td>
                        <td className="px-4 py-3 text-[#4A4640]">{u.creditBalance}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.aadhaarStatus === 'verified' ? 'bg-[#E1F5EE] text-[#1D9E75]' :
                            u.aadhaarStatus === 'pending' ? 'bg-[#FEF3DC] text-[#E8A020]' :
                            'bg-[#F5F0E8] text-[#8A8480]'
                          }`}>
                            {u.aadhaarStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.isBlocked ? 'bg-red-50 text-[#D84040]' : 'bg-[#E1F5EE] text-[#1D9E75]'}`}>
                            {u.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleUserAction(u.id, u.isBlocked ? 'unblock' : 'block')}
                              className={`px-2 py-1 text-[10px] font-bold rounded-[5px] transition-colors ${
                                u.isBlocked
                                  ? 'bg-[#E1F5EE] text-[#1D9E75] hover:bg-[#1D9E75] hover:text-white'
                                  : 'bg-red-50 text-[#D84040] hover:bg-[#D84040] hover:text-white'
                              }`}
                            >
                              {u.isBlocked ? 'Unblock' : 'Block'}
                            </button>
                            {u.aadhaarStatus === 'pending' && (
                              <button
                                onClick={() => handleUserAction(u.id, 'verify_aadhaar')}
                                className="px-2 py-1 bg-[#E8ECF8] text-[#1B2B6B] text-[10px] font-bold rounded-[5px] hover:bg-[#1B2B6B] hover:text-white transition-colors"
                              >
                                Verify ID
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
