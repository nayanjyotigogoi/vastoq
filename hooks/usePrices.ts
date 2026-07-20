'use client'

import { useEffect, useState } from 'react'

interface Prices {
  listing_unlock: number
  worker_unlock: number
  listing_boost: number
  listing_boost_duration_days: number
  premium_unlock_package: number
  premium_unlock_package_count: number
  vastoq_points_pack: number
  vastoq_points_pack_points: number
}

const DEFAULT_PRICES: Prices = {
  listing_unlock: 25,              // Direct cash per listing unlock
  worker_unlock: 10,               // Points cost per worker unlock
  listing_boost: 99,
  listing_boost_duration_days: 7,
  premium_unlock_package: 59,      // Pack price in INR
  premium_unlock_package_count: 3, // Listings unlockable per pack
  vastoq_points_pack: 59,
  vastoq_points_pack_points: 60,
}

// Module-level cache so all components share one fetch per page load
let cachedPrices: Prices | null = null
let fetchPromise: Promise<Prices> | null = null

async function fetchPrices(): Promise<Prices> {
  if (cachedPrices) return cachedPrices
  if (fetchPromise) return fetchPromise

  fetchPromise = fetch('/api/prices')
    .then((r) => r.json())
    .then((json) => {
      cachedPrices = json.data ?? DEFAULT_PRICES
      return cachedPrices!
    })
    .catch(() => DEFAULT_PRICES)

  return fetchPromise
}

export function usePrices() {
  const [prices, setPrices] = useState<Prices>(cachedPrices ?? DEFAULT_PRICES)

  useEffect(() => {
    fetchPrices().then(setPrices)
  }, [])

  return prices
}
