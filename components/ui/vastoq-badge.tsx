'use client'

import { cn } from '@/lib/utils'

type BadgeVariant = 'verified' | 'popular' | 'boosted' | 'broker' | 'commercial'

interface BadgeProps {
  variant: BadgeVariant
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  verified:
    'bg-[#E1F5EE] text-[#1D9E75] border border-[#1D9E75]/30 font-semibold',
  popular:
    'bg-[#FEF3DC] text-[#E8A020] border border-[#E8A020]/30 font-semibold',
  boosted:
    'bg-gray-100 text-gray-600 border border-gray-200 font-semibold',
  broker:
    'bg-white text-[#1B2B6B] border border-[#1B2B6B] font-semibold',
  commercial:
    'bg-[#E8ECF8] text-[#1B2B6B] border border-[#1B2B6B]/30 font-semibold',
}

const labels: Record<BadgeVariant, string> = {
  verified: 'Verified',
  popular: 'Popular',
  boosted: 'Boosted',
  broker: 'Broker',
  commercial: 'Commercial',
}

export function VastoqBadge({ variant, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wide',
        variants[variant],
        className
      )}
    >
      {variant === 'verified' && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <circle cx="5" cy="5" r="5" fill="#1D9E75" />
          <path d="M3 5l1.5 1.5L7 3.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {labels[variant]}
    </span>
  )
}

interface ChipProps {
  variant?: 'indigo' | 'green' | 'amber' | 'default'
  children: React.ReactNode
  className?: string
}

const chipVariants = {
  indigo: 'bg-[#E8ECF8] text-[#1B2B6B]',
  green: 'bg-[#E1F5EE] text-[#1D9E75]',
  amber: 'bg-[#FEF3DC] text-[#E8A020]',
  default: 'bg-[#F5F0E8] text-[#4A4640]',
}

export function Chip({ variant = 'default', children, className }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
        chipVariants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

export function VerifiedAvatar({
  src,
  name,
  size = 40,
  verified = false,
}: {
  src?: string
  name: string
  size?: number
  verified?: boolean
}) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <div
        className="rounded-full bg-[#E8ECF8] flex items-center justify-center text-[#1B2B6B] font-semibold overflow-hidden"
        style={{ width: size, height: size, fontSize: size * 0.35 }}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>
      {verified && (
        <span
          className="absolute bottom-0 right-0 rounded-full bg-[#1D9E75] flex items-center justify-center border border-white"
          style={{ width: size * 0.3, height: size * 0.3 }}
          aria-label="Verified"
        >
          <svg
            width={size * 0.16}
            height={size * 0.16}
            viewBox="0 0 8 8"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1.5 4l2 2L6.5 2"
              stroke="white"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </div>
  )
}
