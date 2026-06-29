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

/**
 * Reverse-geocodes a lat/lng using the Google Geocoding API.
 * Extracts locality (suburb/sublocality) for displayName and
 * administrative_area_level_2 / locality for the city search term.
 */
async function reverseGeocode(lat: number, lng: number): Promise<UserLocation> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) throw new Error('Google Maps API key not configured')

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=en&result_type=sublocality|locality|administrative_area_level_2`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Geocode request failed')

  const data = await res.json()
  if (data.status !== 'OK' || !data.results?.length) {
    throw new Error(`Geocode error: ${data.status}`)
  }

  // Collect all address_components across all results into a single map
  const components: Record<string, string> = {}
  for (const result of data.results) {
    for (const comp of result.address_components ?? []) {
      for (const type of comp.types ?? []) {
        if (!components[type]) components[type] = comp.long_name
      }
    }
  }

  // City: prefer locality → administrative_area_level_2 → administrative_area_level_1
  const city =
    components['locality'] ??
    components['administrative_area_level_2'] ??
    components['administrative_area_level_1'] ??
    'Unknown'

  // Display name: use sublocality for fine-grained label, else city
  const suburb =
    components['sublocality_level_1'] ??
    components['sublocality'] ??
    components['neighborhood'] ??
    undefined

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

