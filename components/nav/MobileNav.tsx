'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Search,
  Wrench,
  MessageSquare,
  User,
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

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E5E0D5] shadow-vastoq-lg"
      style={{ height: 64 }}
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch h-full">
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