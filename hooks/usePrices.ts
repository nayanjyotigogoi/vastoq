'use client'

import { useEffect, useState } from 'react'

interface Prices {
  listing_unlock: number
  worker_unlock: number
}

const DEFAULT_PRICES: Prices = { listing_unlock: 20, worker_unlock: 20 }

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
