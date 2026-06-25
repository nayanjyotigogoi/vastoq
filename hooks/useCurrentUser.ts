'use client'

import { useEffect, useState, useCallback } from 'react'

export type SessionUser = {
  userId: string
  phone: string
  name: string
  role: 'tenant' | 'owner' | 'worker' | 'admin'
}

export function useCurrentUser() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session', {
        credentials: 'include',
        cache: 'no-store',
      })

      if (!res.ok) {
        setUser(null)
        return
      }

      const json = await res.json()
      setUser(json.data ?? null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { user, loading, reload: load }
}
