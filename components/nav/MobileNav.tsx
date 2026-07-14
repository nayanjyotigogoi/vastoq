'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Search,
  Wrench,
  MessageSquare,
  User,
  Unlock,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useCurrentUser } from '@/hooks/useCurrentUser'

export default function MobileNav() {
  const pathname = usePathname()
  const { user } = useCurrentUser()

  const tabs = [
    {
      href: '/',
      icon: Home,
      label: 'Home',
    },
    {
      href: '/rentals',
      icon: Search,
      label: 'Rentals',
    },
    {
      href: '/workers',
      icon: Wrench,
      label: 'Workers',
    },
    {
      href: '/messages',
      icon: MessageSquare,
      label: 'Messages',
    },
    {
      href: user ? '/profile' : '/login',
      icon: User,
      label: user ? 'Profile' : 'Login',
    },
  ]

  const isTenant = user?.role === 'tenant'
  const freeCredits = isTenant ? (user?.free_unlocks_remaining ?? 0) : 0
  const points = user?.vastoq_points ?? 0
  const hasCreditsOrPoints = user && (freeCredits > 0 || points > 0)

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E0D5] shadow-vastoq-lg"
      aria-label="Mobile navigation"
    >
      {/* Credits strip — only shown when user has unlocks or points available */}
      {hasCreditsOrPoints && (
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 px-4 py-1.5 bg-gradient-to-r from-[#1B2B6B]/90 to-[#1D9E75]/80 text-white text-[11px] font-semibold leading-none"
        >
          <Unlock size={11} strokeWidth={2.5} />
          <span>
            {freeCredits > 0 && points > 0
              ? `${freeCredits} free unlock${freeCredits !== 1 ? 's' : ''} + ${points} Vastoq Points`
              : freeCredits > 0
              ? `${freeCredits} free unlock${freeCredits !== 1 ? 's' : ''} left`
              : `${points} Vastoq Points`}
          </span>
          <span className="opacity-60 text-[9px]">· Tap for dashboard</span>
        </Link>
      )}

      <div className="flex items-stretch" style={{ height: 64 }}>
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (
              tab.href !== '/' &&
              pathname.startsWith(tab.href)
            )

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[48px] transition-colors',
                isActive
                  ? 'text-[#1B2B6B]'
                  : 'text-[#8A8480]'
              )}
              aria-current={
                isActive ? 'page' : undefined
              }
            >
              <tab.icon
                size={20}
                strokeWidth={
                  isActive ? 2.2 : 1.8
                }
              />

              <span className="text-[10px] font-semibold leading-none">
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
