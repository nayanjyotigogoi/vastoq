'use client'

import Link from 'next/link'
import { Star, MapPin, Lock, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { VerifiedAvatar, Chip } from '@/components/ui/vastoq-badge'
import { cn } from '@/lib/utils'
import { usePrices } from '@/hooks/usePrices'

export interface Worker {
  id: string
  name: string
  avatar?: string
  category: string
  skills: string[]
  localities: string[]
  hourlyRate: number
  ratingAvg: number
  ratingCount: number
  jobsCompleted: number
  isVerified: boolean
  isAvailableToday: boolean
  isUnlocked?: boolean
  phone?: string
}

interface WorkerCardProps {
  worker: Worker
  onUnlock?: (workerId: string) => void
  className?: string
}

export default function WorkerCard({ worker, onUnlock, className }: WorkerCardProps) {
  const prices = usePrices()
  const [copied, setCopied] = useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    if (worker.phone) {
      navigator.clipboard.writeText(worker.phone)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div
      className={cn(
        'bg-white rounded-[12px] border border-[#E5E0D5] p-4 shadow-vastoq-sm hover:shadow-vastoq-md transition-all duration-200',
        !worker.isVerified && 'opacity-70',
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Link href={`/workers/${worker.id}`} className="flex-shrink-0">
          <VerifiedAvatar
            name={worker.name}
            src={worker.avatar}
            size={52}
            verified={worker.isVerified}
          />
        </Link>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <Link href={`/workers/${worker.id}`}>
                <h3 className="text-[15px] font-semibold text-[#1A1814] hover:text-[#1B2B6B] transition-colors">
                  {worker.name}
                </h3>
              </Link>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[12px] font-medium text-[#4A4640]">{worker.category}</span>
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full flex-shrink-0',
                    worker.isAvailableToday ? 'bg-[#1D9E75]' : 'bg-[#E8A020]'
                  )}
                  aria-label={worker.isAvailableToday ? 'Available today' : 'Limited availability'}
                />
                <span
                  className={cn(
                    'text-[11px] font-medium',
                    worker.isAvailableToday ? 'text-[#1D9E75]' : 'text-[#E8A020]'
                  )}
                >
                  {worker.isAvailableToday ? 'Available today' : 'Limited'}
                </span>
              </div>
            </div>

            {/* Rate */}
            <div className="text-right flex-shrink-0">
              <div className="text-[15px] font-bold text-[#1B2B6B]">
                ₹{worker.hourlyRate.toLocaleString('en-IN')}<span className="text-[11px] font-normal text-[#8A8480]">/hr</span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 my-2.5">
            {worker.skills.slice(0, 3).map((skill) => (
              <Chip key={skill} variant="indigo" className="text-[11px]">
                {skill}
              </Chip>
            ))}
            {worker.skills.length > 3 && (
              <Chip variant="default" className="text-[11px]">+{worker.skills.length - 3}</Chip>
            )}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#4A4640]">
            <div className="flex items-center gap-1">
              <Star size={11} className="fill-[#E8A020] stroke-[#E8A020]" />
              <span className="font-medium">{worker.ratingAvg.toFixed(1)}</span>
              <span className="text-[#8A8480]">({worker.ratingCount})</span>
            </div>
            <span className="text-[#D0C9BC]">·</span>
            <span>{worker.jobsCompleted} jobs</span>
            <span className="text-[#D0C9BC]">·</span>
            <div className="flex items-center gap-1">
              <MapPin size={11} className="text-[#8A8480]" />
              <span className="truncate max-w-[100px]">{worker.localities.slice(0, 2).join(', ')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Unlock section */}
      <div className="mt-3 pt-3 border-t border-[#F5F0E8]">
        {!worker.isVerified ? (
          <div className="text-[12px] text-[#8A8480] italic">
            Aadhaar not yet verified — contact not available
          </div>
        ) : worker.isUnlocked && worker.phone ? (
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-[#1A1814]">{worker.phone}</span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-[6px] border border-[#E5E0D5] hover:bg-[#E8ECF8] transition-colors"
              aria-label="Copy phone number"
            >
              {copied ? (
                <Check size={13} className="text-[#1D9E75]" />
              ) : (
                <Copy size={13} className="text-[#4A4640]" />
              )}
            </button>
            <a
              href={`https://wa.me/91${worker.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-[#25D366] text-white text-[12px] font-semibold rounded-[6px] hover:bg-[#1aac52] transition-colors"
            >
              WhatsApp
            </a>
          </div>
        ) : (
          <button
            onClick={() => onUnlock?.(worker.id)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1B2B6B] text-white text-[13px] font-semibold rounded-[8px] hover:bg-[#2D3E8C] transition-colors min-h-[40px]"
          >
            <Lock size={13} />
            Unlock number — ₹{prices.worker_unlock}
          </button>
        )}
      </div>
    </div>
  )
}
