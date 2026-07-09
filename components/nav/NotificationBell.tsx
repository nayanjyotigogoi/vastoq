'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, CheckCheck, Eye, IndianRupee, Loader2 } from 'lucide-react'

interface AppNotification {
  id: string
  type: string
  title: string
  body: string
  url: string | null
  icon: string
  read: boolean
  created_at: string
}

function NotificationIcon({ icon }: { icon: string }) {
  switch (icon) {
    case 'check':   return <Check size={14} className="text-[#1D9E75]" />
    case 'eye':     return <Eye size={14} className="text-[#1B2B6B]" />
    case 'rupee':   return <IndianRupee size={14} className="text-amber-500" />
    default:        return <Bell size={14} className="text-[#8A8480]" />
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function NotificationBell() {
  const [open, setOpen]                 = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount]   = useState(0)
  const [loading, setLoading]           = useState(false)
  const dropdownRef                     = useRef<HTMLDivElement>(null)
  const router                          = useRouter()

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      const data = await res.json()
      if (data.success) {
        setNotifications(data.data.notifications)
        setUnreadCount(data.data.unread_count)
      }
    } catch {}
  }, [])

  // Poll every 60 seconds and on window focus
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    window.addEventListener('focus', fetchNotifications)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', fetchNotifications)
    }
  }, [fetchNotifications])

  // Close on outside click
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  async function handleMarkAllRead() {
    setLoading(true)
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' })
      setNotifications(n => n.map(x => ({ ...x, read: true })))
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  async function handleClick(notification: AppNotification) {
    if (!notification.read) {
      await fetch(`/api/notifications/${notification.id}/read`, { method: 'POST' })
      setNotifications(n => n.map(x => x.id === notification.id ? { ...x, read: true } : x))
      setUnreadCount(c => Math.max(0, c - 1))
    }
    setOpen(false)
    if (notification.url) router.push(notification.url)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => { setOpen(o => !o); if (!open) fetchNotifications() }}
        className="relative p-2 rounded-lg hover:bg-[#E8ECF8] transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
        aria-label="Notifications"
      >
        <Bell size={18} className="text-[#4A4640]" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E5E0D5] rounded-xl shadow-lg overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0EBE3]">
            <span className="text-sm font-semibold text-[#1A1814]">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={loading}
                className="flex items-center gap-1 text-xs text-[#1B2B6B] hover:underline disabled:opacity-50"
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={12} />}
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#F8F4EE]">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[#8A8480]">
                No notifications yet
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-[#F8F8F8] transition-colors ${!n.read ? 'bg-[#F0F3FB]' : ''}`}
                >
                  <div className="mt-0.5 w-6 h-6 rounded-full bg-white border border-[#E5E0D5] flex items-center justify-center flex-shrink-0">
                    <NotificationIcon icon={n.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1814] leading-snug">{n.title}</p>
                    <p className="text-xs text-[#6A6460] mt-0.5 leading-snug line-clamp-2">{n.body}</p>
                    <p className="text-[11px] text-[#A09890] mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.read && (
                    <div className="mt-2 w-2 h-2 rounded-full bg-[#1B2B6B] flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
