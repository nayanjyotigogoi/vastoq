'use client'

import { useState, useEffect } from 'react'

export interface UserLocation {
  city: string         // proper city name for API search, e.g. "Dibrugarh"
  displayName: string  // suburb-level if available, e.g. "Dibrugarh West"; else same as city
  lat: number
  lng: number
}

type LocationState =
  | { status: 'idle' }
  | { status: 'requesting' }
  | { status: 'ready'; location: UserLocation }
  | { status: 'denied' }
  | { status: 'error'; message: string }

const CACHE_KEY = 'vastoq_user_location'
const CACHE_TTL = 30 * 60 * 1000 // 30 min

interface CachedLocation {
  location: UserLocation
  at: number
}

function readCache(): UserLocation | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const cached: CachedLocation = JSON.parse(raw)
    if (Date.now() - cached.at > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY)
      return null
    }
    return cached.location
  } catch {
    return null
  }
}

function writeCache(location: UserLocation) {
  try {
    const payload: CachedLocation = { location, at: Date.now() }
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch { /* storage full — ignore */ }
}

async function reverseGeocode(lat: number, lng: number): Promise<UserLocation> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=12`
  const res  = await fetch(url, { headers: { 'Accept-Language': 'en' } })
  if (!res.ok) throw new Error('Geocode failed')
  const data = await res.json()
  const addr = data.address ?? {}

  // In India, addr.town is the proper city name for most cities.
  // addr.city often contains the ward/constituency name (e.g. "Dibrugarh West")
  // so we prefer town → city → municipality → county → state_district.
  const city =
    addr.town ??
    addr.city ??
    addr.municipality ??
    addr.county ??
    addr.state_district ??
    'Unknown'

  // The suburb/neighbourhood is the ward-level name (e.g. "Dibrugarh West")
  // — used for display only, not for API search
  const suburb =
    addr.suburb ??
    addr.neighbourhood ??
    addr.quarter ??
    addr.village ??
    undefined

  // displayName shown in the UI pill — suburb if available, else city
  const displayName = suburb ?? city

  return { city, displayName, lat, lng }
}

export function useUserLocation() {
  const [state, setState] = useState<LocationState>({ status: 'idle' })

  useEffect(() => {
    // Return cached result immediately if available
    const cached = readCache()
    if (cached) {
      setState({ status: 'ready', location: cached })
      return
    }

    if (!navigator?.geolocation) {
      setState({ status: 'error', message: 'Geolocation not supported' })
      return
    }

    setState({ status: 'requesting' })

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const location = await reverseGeocode(pos.coords.latitude, pos.coords.longitude)
          writeCache(location)
          setState({ status: 'ready', location })
        } catch {
          setState({ status: 'error', message: 'Could not determine your city' })
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setState({ status: 'denied' })
        } else {
          setState({ status: 'error', message: 'Location unavailable' })
        }
      },
      { timeout: 8000, maximumAge: 5 * 60 * 1000 }
    )
  }, [])

  return state
}
