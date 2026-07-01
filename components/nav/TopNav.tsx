'use client'

import Link from 'next/link'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Bell, Menu, X, ChevronDown } from 'lucide-react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { toast } from 'sonner'

function ErrorToastHandler() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams?.get('error')
    if (errorParam) {
      if (errorParam === 'owner_required') {
        toast.error('Access denied: You must be registered as a Property Owner to list properties.')
      } else if (errorParam === 'worker_required') {
        toast.error('Access denied: You must be registered as a Local Worker to access this area.')
      } else if (errorParam === 'admin_required') {
        toast.error('Access denied: Administrator privileges required.')
      }

      const params = new URLSearchParams(searchParams.toString())
      params.delete('error')
      const newQuery = params.toString() ? `?${params.toString()}` : ''
      router.replace(`${pathname}${newQuery}`)
    }
  }, [searchParams, pathname, router])

  return null
}

export default function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const pathname = usePathname()
  const { user } = useCurrentUser()

  const getLinkClass = (path: string, isMobile = false) => {
    const isActive = pathname === path || (path !== '/' && pathname?.startsWith(path))
    
    if (isMobile) {
      return isActive
        ? 'text-[15px] font-semibold py-2 text-[#1B2B6B] transition-colors'
        : 'text-[15px] font-medium py-2 text-[#4A4640] hover:text-[#1B2B6B] transition-colors'
    }
    
    return isActive
      ? 'text-[14px] font-semibold text-[#1B2B6B] transition-colors'
      : 'text-[14px] font-medium text-[#4A4640] hover:text-[#1B2B6B] transition-colors'
  }

  const dashboardPath = (() => {
    switch (user?.role) {
      case 'owner':  return '/owner/dashboard'
      case 'worker': return '/worker/dashboard'
      case 'admin':  return '/admin'
      default:       return '/dashboard'
    }
  })()

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  async function handleLogout() {
    try {
      setLoggingOut(true)

      await fetch('/api/auth/logout', {
        method: 'POST',
      })

      window.location.href = '/'

    } catch (error) {
      console.error(error)
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E0D5] shadow-vastoq-sm">
      <Suspense fallback={null}><ErrorToastHandler /></Suspense>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-[60px] gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 select-none">
          <span className="text-xl font-extrabold tracking-tight text-[#1B2B6B]">
            Vastoq<span className="text-[#1D9E75]">.</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden lg:flex items-center gap-6"
          aria-label="Main navigation"
        >
          <Link
            href="/rentals"
            className={getLinkClass('/rentals')}
          >
            Rentals
          </Link>

          <Link
            href="/workers"
            className={getLinkClass('/workers')}
          >
            Local Workers
          </Link>

          <Link
            href="/furniture"
            className={getLinkClass('/furniture')}
          >
            Furniture Rental
          </Link>

          <Link
            href="/how-it-works"
            className={getLinkClass('/how-it-works')}
          >
            How It Works
          </Link>

          {(!user || user.role === 'owner' || user.role === 'admin') && (
            <Link
              href="/owner/listings/new"
              className={getLinkClass('/owner/listings/new')}
            >
              List Property
            </Link>
          )}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Notifications */}
              <button
                className="relative p-2 rounded-lg hover:bg-[#E8ECF8] transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
                aria-label="Notifications"
              >
                <Bell size={18} className="text-[#4A4640]" />
              </button>

              {/* User Dropdown */}
              <div
                className="relative hidden sm:block"
                ref={dropdownRef}
              >
                <button
                  onClick={() =>
                    setDropdownOpen(!dropdownOpen)
                  }
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#E8ECF8] transition-colors min-h-[48px]"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1B2B6B] text-white text-sm font-bold flex items-center justify-center">
                    {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                  </div>

                  <span className="text-sm font-medium text-[#1A1814] max-w-[120px] truncate">
                    {user?.name}
                  </span>

                  <ChevronDown
                    size={14}
                    className="text-[#8A8480]"
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-[#E5E0D5] rounded-xl shadow-lg overflow-hidden">
                    <Link
                      href={dashboardPath}
                      className="block px-4 py-3 text-sm hover:bg-[#F8F8F8]"
                      onClick={() =>
                        setDropdownOpen(false)
                      }
                    >
                      Dashboard
                    </Link>

                    <Link
                      href="/profile"
                      className="block px-4 py-3 text-sm hover:bg-[#F8F8F8]"
                      onClick={() =>
                        setDropdownOpen(false)
                      }
                    >
                      Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                    >
                      {loggingOut
                        ? 'Logging out...'
                        : 'Logout'}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-[6px] border border-[#E5E0D5] text-[14px] font-medium text-[#1B2B6B] hover:bg-[#E8ECF8] transition-colors min-h-[40px]"
              >
                Sign in
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 rounded-[6px] bg-[#1B2B6B] text-white text-[14px] font-semibold hover:bg-[#2D3E8C] transition-colors min-h-[40px]"
              >
                Get started
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-[#E8ECF8] transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
            onClick={() =>
              setMobileOpen(!mobileOpen)
            }
            aria-label={
              mobileOpen
                ? 'Close menu'
                : 'Open menu'
            }
          >
            {mobileOpen ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-[#E5E0D5] px-4 py-4 flex flex-col gap-3">
          <Link
            href="/rentals"
            className={getLinkClass('/rentals', true)}
          >
            Rentals
          </Link>

          <Link
            href="/workers"
            className={getLinkClass('/workers', true)}
          >
            Local Workers
          </Link>

          <Link
            href="/furniture"
            className={getLinkClass('/furniture', true)}
          >
            Furniture Rental
          </Link>

          <Link
            href="/how-it-works"
            className={getLinkClass('/how-it-works', true)}
          >
            How It Works
          </Link>

          {(!user || user.role === 'owner' || user.role === 'admin') && (
            <Link
              href="/owner/listings/new"
              className={getLinkClass('/owner/listings/new', true)}
            >
              List Property
            </Link>
          )}

          {!user ? (
            <div className="flex gap-2 pt-2">
              <Link
                href="/login"
                className="flex-1 text-center py-2.5 rounded-[6px] border border-[#E5E0D5] text-[14px] font-medium text-[#1B2B6B]"
              >
                Sign in
              </Link>

              <Link
                href="/login"
                className="flex-1 text-center py-2.5 rounded-[6px] bg-[#1B2B6B] text-white text-[14px] font-semibold"
              >
                Get started
              </Link>
            </div>
          ) : (
            <div className="border-t border-[#F5F0E8] pt-3 flex flex-col gap-2">
              <Link
                href={dashboardPath}
                className="text-[15px] font-medium py-2"
              >
                Dashboard
              </Link>

              <Link
                href="/profile"
                className="text-[15px] font-medium py-2"
              >
                Profile
              </Link>

              <button
                onClick={handleLogout}
                className="text-left text-red-600 text-[15px] font-medium py-2"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}