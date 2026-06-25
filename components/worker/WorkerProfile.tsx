'use client'

import { useState, Fragment, useEffect } from 'react'
import { Star, MapPin, Lock, Copy, Check, MessageSquare, Loader2 } from 'lucide-react'
import { VerifiedAvatar, Chip } from '@/components/ui/vastoq-badge'
import UnlockGate from '@/components/listing/UnlockGate'
import type { Worker } from './WorkerCard'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SLOTS = ['Morning', 'Afternoon', 'Evening']

const mockAvailability = (worker: Worker) =>
  DAYS.reduce<Record<string, string[]>>((acc, day) => {
    acc[day] = worker.isVerified ? SLOTS.slice(0, 2) : []
    return acc
  }, {})

export default function WorkerProfile({ worker }: { worker: Worker }) {
  const [showUnlock,    setShowUnlock]    = useState(false)
  const [unlocked,      setUnlocked]      = useState(worker.isUnlocked ?? false)
  const [revealedPhone, setRevealedPhone] = useState<string | undefined>(worker.phone)
  const [copied,        setCopied]        = useState(false)
  const [statusLoading, setStatusLoading] = useState(true)
  const availability = mockAvailability(worker)

  // Check if user has already unlocked this worker
  useEffect(() => {
    let cancelled = false
    fetch(`/api/workers/${worker.id}/unlock`, { credentials: 'include' })
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return
        const data = json?.data
        if (data?.unlocked) {
          setUnlocked(true)
          if (data.phone) setRevealedPhone(data.phone)
        }
      })
      .catch(() => {/* not logged in or network error — stay locked */})
      .finally(() => { if (!cancelled) setStatusLoading(false) })
    return () => { cancelled = true }
  }, [worker.id])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[12px] text-[#8A8480] mb-6" aria-label="Breadcrumb">
        <a href="/workers" className="hover:text-[#1B2B6B]">Workers</a>
        <span>/</span>
        <span className="text-[#1A1814]">{worker.category}</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
        {/* LEFT */}
        <div>
          {/* Header */}
          <div className="bg-white rounded-[18px] border border-[#E5E0D5] p-6 mb-5 shadow-vastoq-sm">
            <div className="flex items-start gap-4">
              <VerifiedAvatar name={worker.name} src={worker.avatar} size={64} verified={worker.isVerified} />
              <div className="flex-1">
                <h1 className="text-[22px] font-bold text-[#1A1814]">{worker.name}</h1>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-[14px] font-medium text-[#4A4640]">{worker.category}</span>
                  <span className={`w-2 h-2 rounded-full ${worker.isAvailableToday ? 'bg-[#1D9E75]' : 'bg-[#E8A020]'}`} aria-hidden="true" />
                  <span className={`text-[12px] font-medium ${worker.isAvailableToday ? 'text-[#1D9E75]' : 'text-[#E8A020]'}`}>
                    {worker.isAvailableToday ? 'Available today' : 'Limited availability'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-[13px] text-[#4A4640]">
                  <div className="flex items-center gap-1">
                    <Star size={13} className="fill-[#E8A020] stroke-[#E8A020]" />
                    <span className="font-semibold">{worker.ratingAvg.toFixed(1)}</span>
                    <span className="text-[#8A8480]">({worker.ratingCount} reviews)</span>
                  </div>
                  <span className="text-[#D0C9BC]">·</span>
                  <span>{worker.jobsCompleted} jobs done</span>
                  <span className="text-[#D0C9BC]">·</span>
                  <span className="text-[17px] font-bold text-[#1B2B6B]">₹{worker.hourlyRate}/hr</span>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-[18px] border border-[#E5E0D5] p-5 mb-5 shadow-vastoq-sm">
            <h2 className="text-[16px] font-bold text-[#1A1814] mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {worker.skills.map((s) => <Chip key={s} variant="indigo">{s}</Chip>)}
            </div>
          </div>

          {/* Localities */}
          <div className="bg-white rounded-[18px] border border-[#E5E0D5] p-5 mb-5 shadow-vastoq-sm">
            <h2 className="text-[16px] font-bold text-[#1A1814] mb-3">Service areas</h2>
            <div className="flex flex-wrap gap-2">
              {worker.localities.map((l) => (
                <div key={l} className="flex items-center gap-1 px-3 py-1.5 bg-[#F5F0E8] rounded-full text-[12px] text-[#4A4640]">
                  <MapPin size={11} className="text-[#8A8480]" />
                  {l}
                </div>
              ))}
            </div>
          </div>

          {/* Availability grid */}
          <div className="bg-white rounded-[18px] border border-[#E5E0D5] p-5 mb-5 shadow-vastoq-sm">
            <h2 className="text-[16px] font-bold text-[#1A1814] mb-4">Availability</h2>
            <div className="grid grid-cols-8 gap-1 text-center">
              <div className="text-[10px] font-bold text-[#8A8480]" />
              {DAYS.map((d) => (
                <div key={d} className="text-[10px] font-bold text-[#8A8480] uppercase">{d}</div>
              ))}
              {SLOTS.map((slot) => (
                <Fragment key={slot}>
                  <div className="text-[9px] text-[#8A8480] text-right pr-1 flex items-center justify-end">{slot.slice(0, 3)}</div>
                  {DAYS.map((day) => (
                    <div
                      key={`${day}-${slot}`}
                      className={`h-6 rounded-[4px] ${availability[day]?.includes(slot) ? 'bg-[#1D9E75]' : 'bg-[#F5F0E8]'}`}
                      title={`${day} ${slot}: ${availability[day]?.includes(slot) ? 'Available' : 'Not available'}`}
                    />
                  ))}
                </Fragment>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3 text-[11px] text-[#8A8480]">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-[3px] bg-[#1D9E75]" /> Available</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-[3px] bg-[#F5F0E8]" /> Not available</span>
            </div>
          </div>

          {/* Notice */}
          <div className="bg-[#E8ECF8] border border-[#1B2B6B]/10 rounded-[12px] p-4 text-[12px] text-[#4A4640] leading-relaxed">
            Contact this worker directly. Vastoq verifies their identity — the job and pricing are between you and them.
          </div>

          {/* Reviews */}
          <div className="mt-6">
            <h2 className="text-[16px] font-bold text-[#1A1814] mb-3">Reviews</h2>
            <div className="bg-[#F5F0E8] rounded-[14px] p-5 text-center">
              <p className="text-[13px] text-[#8A8480]">Reviews visible after unlocking this worker&apos;s contact.</p>
            </div>
          </div>
        </div>

        {/* RIGHT: unlock card */}
        <div className="lg:sticky lg:top-20">
          <div className="bg-white rounded-[18px] border border-[#E5E0D5] shadow-vastoq-md p-5">
            <div className="text-[13px] font-bold text-[#1A1814] mb-1">Get contact details</div>
            <p className="text-[12px] text-[#8A8480] mb-4">
              Unlock {worker.name}&apos;s phone number to hire directly.
            </p>

            {statusLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 size={20} className="animate-spin text-[#1B2B6B]" />
              </div>
            ) : !worker.isVerified ? (
              <div className="bg-[#FEF3DC] rounded-[10px] p-3 text-[12px] text-[#E8A020] font-medium">
                This worker has not completed Aadhaar verification yet. Contact not available.
              </div>
            ) : unlocked && revealedPhone ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-[#E1F5EE] rounded-[10px]">
                  <span className="text-[14px] font-bold text-[#1A1814] flex-1">{revealedPhone}</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(revealedPhone ?? ''); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                    aria-label="Copy phone"
                  >
                    {copied ? <Check size={13} className="text-[#1D9E75]" /> : <Copy size={13} className="text-[#4A4640]" />}
                  </button>
                </div>
                <a
                  href={`https://wa.me/91${(revealedPhone ?? '').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white text-[14px] font-bold rounded-[10px] hover:bg-[#1aac52] transition-colors min-h-[48px]"
                >
                  Open in WhatsApp
                </a>
              </div>
            ) : (
              <div className="space-y-2.5">
                <button
                  onClick={() => setShowUnlock(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#1B2B6B] text-white text-[14px] font-bold rounded-[10px] hover:bg-[#2D3E8C] transition-colors min-h-[48px]"
                >
                  <Lock size={16} />
                  Unlock number — ₹20
                </button>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-center text-[#8A8480]">
                  <div className="bg-[#F5F0E8] rounded-[8px] p-2">Pack of 7<br /><span className="font-bold text-[#1B2B6B]">₹100</span></div>
                  <div className="bg-[#F5F0E8] rounded-[8px] p-2">Pack of 10<br /><span className="font-bold text-[#1B2B6B]">₹150</span></div>
                </div>
                <p className="text-[11px] text-[#8A8480] text-center">
                  Pay once, get direct contact. No middleman.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showUnlock && (
        <UnlockGate
          type="worker"
          targetId={worker.id}
          subjectName={worker.name}
          subjectLocality={worker.localities[0]}
          onClose={() => setShowUnlock(false)}
          onSuccess={(data) => {
            setUnlocked(true)
            if (data?.phone) setRevealedPhone(data.phone)
            setShowUnlock(false)
          }}
        />
      )}
    </div>
  )
}
