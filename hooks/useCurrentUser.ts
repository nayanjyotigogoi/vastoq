'use client'

import { useEffect, useState, useCallback } from 'react'

export type SessionUser = {
  userId: string
  phone: string
  name: string
  email: string
  role: 'tenant' | 'owner' | 'worker' | 'admin'
  free_unlocks_remaining: number
  vastoq_points: number
}

export function useCurrentUser() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (force = false) => {
    try {
      const url = force ? '/api/auth/session?nocache=true' : '/api/auth/session'
      const res = await fetch(url, {
        credentials: 'include',
        cache: 'no-store',
      })

      if (!res.ok) {
        setUser(null)
        return
      }

      const json = await res.json()
      setUser(json.data ?? null)

      // Broadcast changes to all other hook instances if this was a forced refresh
      if (force && typeof window !== 'undefined') {
        window.dispatchEvent(new Event('user-session-updated'))
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()

    if (typeof window !== 'undefined') {
      const handleSessionUpdate = () => {
        // Fetch the fresh cached/updated details
        load()
      }
      window.addEventListener('user-session-updated', handleSessionUpdate)
      return () => {
        window.removeEventListener('user-session-updated', handleSessionUpdate)
      }
    }
  }, [load])

  return { user, loading, reload: () => load(true) }
}
