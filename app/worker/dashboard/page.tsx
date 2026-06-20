'use client'

import TopNav from '@/components/nav/TopNav'
import MobileNav from '@/components/nav/MobileNav'
import Footer from '@/components/nav/Footer'
import Link from 'next/link'
import { Star, Eye, Phone, CheckCircle2, Clock, ShieldCheck, ChevronRight, MapPin, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { Chip } from '@/components/ui/vastoq-badge'

const MOCK_REVIEWS = [
  { id: 1, reviewer: 'Priya Bora', rating: 5, comment: 'Very professional and completed the work on time. Highly recommended!', date: '3 days ago' },
  { id: 2, reviewer: 'Rahul Das', rating: 5, comment: 'Fixed our wiring issue quickly. Fair price and clean work.', date: '1 week ago' },
  { id: 3, reviewer: 'Meena Gogoi', rating: 4, comment: 'Good work, just took a little longer than expected but quality is good.', date: '2 weeks ago' },
]

const WEEKLY_VIEWS = [12, 18, 9, 22, 15, 28, 34]
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function WorkerDashboard() {
  const [newSkill, setNewSkill] = useState('')
  const [skills, setSkills] = useState(['Wiring', 'AC Installation', 'MCB Fixing', 'Fan Installation'])
  const [availability, setAvailability] = useState(true)

  const addSkill = () => {
    const s = newSkill.trim()
    if (s && !skills.includes(s)) {
      setSkills([...skills, s])
    }
    setNewSkill('')
  }

  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s))

  const maxViews = Math.max(...WEEKLY_VIEWS)

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <TopNav />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile header */}
        <div className="bg-white rounded-[20px] border border-[#E5E0D5] shadow-vastoq-sm p-6 mb-6 flex items-start gap-5 flex-wrap">
          <div className="w-16 h-16 rounded-full bg-[#1D9E75] text-white text-[22px] font-extrabold flex items-center justify-center flex-shrink-0">
            B
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-[22px] font-bold text-[#1A1814]">Bipul Kalita</h1>
              <span className="px-2 py-0.5 bg-[#E1F5EE] text-[#1D9E75] text-[11px] font-bold rounded-full flex items-center gap-1">
                <ShieldCheck size={10} /> Aadhaar Verified
              </span>
            </div>
            <p className="text-[13px] text-[#4A4640] mb-2">Electrician · ₹350/hr</p>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <Star size={13} className="fill-[#E8A020] stroke-[#E8A020]" />
                <span className="text-[13px] font-bold text-[#1A1814]">4.8</span>
                <span className="text-[12px] text-[#8A8480]">(64 reviews)</span>
              </div>
              <span className="text-[#D0C9BC]">·</span>
              <span className="text-[12px] text-[#4A4640]">120 jobs completed</span>
              <span className="text-[#D0C9BC]">·</span>
              <div className="flex items-center gap-1">
                <MapPin size={11} className="text-[#8A8480]" />
                <span className="text-[12px] text-[#4A4640]">Paltan Bazar, Fancy Bazar</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#4A4640] font-medium">Available today</span>
              <button
                onClick={() => setAvailability(!availability)}
                className={`relative inline-flex h-6 w-11 rounded-full transition-colors focus:outline-none ${availability ? 'bg-[#1D9E75]' : 'bg-[#D0C9BC]'}`}
                role="switch"
                aria-checked={availability}
                aria-label="Toggle availability"
              >
                <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform mt-1 ${availability ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <Link
              href={`/workers/w1`}
              className="text-[12px] text-[#1B2B6B] font-semibold hover:underline flex items-center gap-1"
            >
              View public profile <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Eye, label: 'Profile views', value: '138', sub: 'this week', color: 'bg-[#E8ECF8] text-[#1B2B6B]' },
            { icon: Phone, label: 'Contact unlocks', value: '19', sub: 'total', color: 'bg-[#E1F5EE] text-[#1D9E75]' },
            { icon: Star, label: 'Rating', value: '4.8', sub: '64 reviews', color: 'bg-[#FEF3DC] text-[#E8A020]' },
            { icon: CheckCircle2, label: 'Jobs done', value: '120', sub: 'all time', color: 'bg-[#E8ECF8] text-[#1B2B6B]' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-[14px] border border-[#E5E0D5] p-4 shadow-vastoq-sm">
              <div className={`w-8 h-8 rounded-[8px] ${s.color} flex items-center justify-center mb-2`}>
                <s.icon size={15} />
              </div>
              <p className="text-[22px] font-extrabold text-[#1A1814] leading-none">{s.value}</p>
              <p className="text-[11px] font-semibold text-[#1A1814] mt-1">{s.label}</p>
              <p className="text-[10px] text-[#8A8480]">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          {/* Left */}
          <div className="space-y-6">
            {/* Weekly views chart */}
            <div className="bg-white rounded-[16px] border border-[#E5E0D5] p-5 shadow-vastoq-sm">
              <h2 className="text-[15px] font-bold text-[#1A1814] mb-4">Profile views — this week</h2>
              <div className="flex items-end gap-2 h-24">
                {WEEKLY_VIEWS.map((v, i) => (
                  <div key={DAYS[i]} className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className="w-full rounded-[4px] bg-[#1B2B6B] min-h-[4px] transition-all"
                      style={{ height: `${Math.round((v / maxViews) * 80)}px` }}
                      aria-label={`${DAYS[i]}: ${v} views`}
                    />
                    <span className="text-[10px] text-[#8A8480] font-medium">{DAYS[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills editor */}
            <div className="bg-white rounded-[16px] border border-[#E5E0D5] p-5 shadow-vastoq-sm">
              <h2 className="text-[15px] font-bold text-[#1A1814] mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map((s) => (
                  <div
                    key={s}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8ECF8] rounded-full text-[12px] font-semibold text-[#1B2B6B]"
                  >
                    {s}
                    <button
                      onClick={() => removeSkill(s)}
                      className="text-[#8A8480] hover:text-[#D84040] transition-colors"
                      aria-label={`Remove skill ${s}`}
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  className="flex-1 px-3 py-2 border border-[#E5E0D5] rounded-[8px] text-[13px] text-[#1A1814] placeholder:text-[#8A8480] focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30 focus:border-[#1B2B6B]"
                />
                <button
                  onClick={addSkill}
                  className="p-2 bg-[#1B2B6B] text-white rounded-[8px] hover:bg-[#2D3E8C] transition-colors"
                  aria-label="Add skill"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-[16px] border border-[#E5E0D5] p-5 shadow-vastoq-sm">
              <h2 className="text-[15px] font-bold text-[#1A1814] mb-4">Recent reviews</h2>
              <div className="space-y-4">
                {MOCK_REVIEWS.map((r) => (
                  <div key={r.id} className="pb-4 border-b border-[#F5F0E8] last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] font-semibold text-[#1A1814]">{r.reviewer}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} size={11} className="fill-[#E8A020] stroke-[#E8A020]" />
                        ))}
                        <span className="text-[11px] text-[#8A8480] ml-1">{r.date}</span>
                      </div>
                    </div>
                    <p className="text-[12px] text-[#4A4640] leading-relaxed">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Aadhaar status + quick tips */}
          <div className="space-y-4">
            {/* Aadhaar verified card */}
            <div className="bg-[#E1F5EE] rounded-[16px] border border-[#1D9E75]/20 p-5">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck size={22} className="text-[#1D9E75]" />
                <div>
                  <p className="text-[14px] font-bold text-[#1A1814]">Aadhaar Verified</p>
                  <p className="text-[11px] text-[#4A4640]">Your profile shows a verified badge</p>
                </div>
              </div>
              <p className="text-[12px] text-[#4A4640] leading-relaxed">
                Verified workers receive 4x more contact unlocks than unverified profiles.
              </p>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-[16px] border border-[#E5E0D5] p-5 shadow-vastoq-sm">
              <h3 className="text-[14px] font-bold text-[#1A1814] mb-3">Tips to get more work</h3>
              <ul className="space-y-2.5">
                {[
                  'Add photos of completed work to build trust',
                  'Set your hourly rate competitively',
                  'Keep your availability updated daily',
                  'Ask satisfied clients to leave a review',
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-[12px] text-[#4A4640]">
                    <CheckCircle2 size={13} className="text-[#1D9E75] mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick info */}
            <div className="bg-white rounded-[16px] border border-[#E5E0D5] p-5 shadow-vastoq-sm">
              <h3 className="text-[14px] font-bold text-[#1A1814] mb-3">Profile snapshot</h3>
              <div className="space-y-2.5 text-[12px] text-[#4A4640]">
                <div className="flex items-center justify-between">
                  <span>Category</span>
                  <span className="font-semibold text-[#1A1814]">Electrician</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Hourly rate</span>
                  <span className="font-semibold text-[#1A1814]">₹350/hr</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Service areas</span>
                  <span className="font-semibold text-[#1A1814]">3 localities</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Response time</span>
                  <span className="font-semibold text-[#1D9E75]">Within 1 hour</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Member since</span>
                  <span className="font-semibold text-[#1A1814]">Jan 2025</span>
                </div>
              </div>
              <button className="mt-4 w-full py-2.5 border border-[#1B2B6B] text-[#1B2B6B] text-[13px] font-semibold rounded-[10px] hover:bg-[#E8ECF8] transition-colors">
                Edit profile
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <MobileNav />
      <div className="h-16 lg:hidden" aria-hidden="true" />
    </div>
  )
}
