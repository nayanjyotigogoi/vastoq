'use client'

import { useEffect, useState, useCallback } from 'react'
import { getCurrentUser } from '@/lib/api/user'
import { User } from '@/lib/types'

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await getCurrentUser()

      if (!data) {
        setUser(null)
        return
      }

      setUser(data)

    } catch (error) {
      console.error('Failed to load current user:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return {
    user,
    loading,
    reload: load,
  }
}