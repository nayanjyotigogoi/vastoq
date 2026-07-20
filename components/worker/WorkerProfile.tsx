'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Star, MapPin, Lock, Copy, Check, Loader2 } from 'lucide-react'
import { VerifiedAvatar, Chip } from '@/components/ui/vastoq-badge'
import UnlockGate from '@/components/listing/UnlockGate'
import type { Worker } from './WorkerCard'
import { usePrices } from '@/hooks/usePrices'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import PointsInfoModal from '@/components/ui/PointsInfoModal'
import { resolveImageUrl } from '@/lib/utils'


export default function WorkerProfile({ worker }: { worker: Worker }) {
  const prices = usePrices()
  const { user } = useCurrentUser()
  const router = useRouter()
  const [showUnlock,    setShowUnlock]    = useState(false)
  const [unlocked,      setUnlocked]      = useState(worker.isUnlocked ?? false)
  const [revealedPhone, setRevealedPhone] = useState<string | undefined>(worker.phone)
  const [copied,        setCopied]        = useState(false)
  const [statusLoading, setStatusLoading] = useState(true)
  // Guard: redirect to login if not authenticated when trying to unlock
  const openUnlock = () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/workers/${worker.id}`)}`)
      return
    }
    setShowUnlock(true)
  }

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

          {/* Work Photos */}
          {worker.workPhotos && worker.workPhotos.length > 0 && (
            <div className="bg-white rounded-[18px] border border-[#E5E0D5] p-5 mb-5 shadow-vastoq-sm">
              <h2 className="text-[16px] font-bold text-[#1A1814] mb-3">Work photos</h2>
              <div className="grid grid-cols-3 gap-2">
                {worker.workPhotos.map((url, i) => (
                  <a key={i} href={resolveImageUrl(url)} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-[10px] overflow-hidden block bg-[#F5F0E8]">
                    <img
                      src={resolveImageUrl(url)}
                      alt={`Work photo ${i + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

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

          {/* Availability */}
          <div className="bg-white rounded-[18px] border border-[#E5E0D5] p-5 mb-5 shadow-vastoq-sm">
            <h2 className="text-[16px] font-bold text-[#1A1814] mb-3">Availability</h2>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-[10px] ${worker.isAvailableToday ? 'bg-[#E1F5EE]' : 'bg-[#F5F0E8]'}`}>
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${worker.isAvailableToday ? 'bg-[#1D9E75]' : 'bg-[#D0C9BC]'}`} />
              <div>
                <p className={`text-[14px] font-semibold ${worker.isAvailableToday ? 'text-[#1D9E75]' : 'text-[#4A4640]'}`}>
                  {worker.isAvailableToday ? 'Available for work today' : 'Not available today'}
                </p>
                <p className="text-[12px] text-[#8A8480] mt-0.5">
                  {worker.isAvailableToday
                    ? 'This worker is open to new jobs — contact them now.'
                    : 'Check back later or contact them to discuss scheduling.'}
                </p>
              </div>
            </div>
          </div>

          {/* Notice */}
          <div className="bg-[#E8ECF8] border border-[#1B2B6B]/10 rounded-[12px] p-4 text-[12px] text-[#4A4640] leading-relaxed">
            Contact this worker directly. Vastoq verifies their identity — the job and pricing are between you and them.
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
                  onClick={openUnlock}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#1B2B6B] text-white text-[14px] font-bold rounded-[10px] hover:bg-[#2D3E8C] transition-colors min-h-[48px]"
                >
                  <Lock size={16} />
                  Unlock details — {prices.worker_points_cost} Points
                </button>
                <div className="bg-[#F5F0E8] rounded-[10px] p-3 text-[11px] text-[#4A4640] leading-relaxed relative">
                  <div className="flex items-center gap-1.5 font-bold text-[#1B2B6B] mb-1">
                    <span>Vastoq Points System</span>
                    <PointsInfoModal />
                  </div>
                  Buy {prices.vastoq_points_pack_points} points for ₹{prices.vastoq_points_pack_amount} and unlock up to {Math.floor(prices.vastoq_points_pack_points / prices.worker_points_cost)} workers ({prices.worker_points_cost} pts each). Or pay ₹{prices.worker_unlock_amount} directly for this one worker — no wallet needed.
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
