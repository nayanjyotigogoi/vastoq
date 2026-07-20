'use client'

import { useEffect, useState } from 'react'

export interface Prices {
  // Direct cash amounts (INR) — individual checkout
  listing_unlock_amount: number
  worker_unlock_amount: number
  listing_boost_amount: number
  listing_boost_days: number

  // Vastoq Points deducted from wallet per unlock
  listing_points_cost: number
  worker_points_cost: number

  // Points pack (bundle purchase)
  vastoq_points_pack_amount: number
  vastoq_points_pack_points: number

  // Backward-compatible aliases
  listing_boost: number
  listing_boost_duration_days: number
}

const DEFAULT_PRICES: Prices = {
  listing_unlock_amount: 25,
  worker_unlock_amount: 15,
  listing_boost_amount: 99,
  listing_boost_days: 7,
  listing_points_cost: 20,
  worker_points_cost: 10,
  vastoq_points_pack_amount: 59,
  vastoq_points_pack_points: 60,

  listing_boost: 99,
  listing_boost_duration_days: 7,
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
      const d = json.data ?? {}
      const boostAmt = d.listing_boost_amount ?? d.listing_boost ?? DEFAULT_PRICES.listing_boost_amount
      const boostDays = d.listing_boost_days ?? d.listing_boost_duration_days ?? DEFAULT_PRICES.listing_boost_days

      cachedPrices = {
        listing_unlock_amount:     d.listing_unlock_amount    ?? DEFAULT_PRICES.listing_unlock_amount,
        worker_unlock_amount:      d.worker_unlock_amount     ?? DEFAULT_PRICES.worker_unlock_amount,
        listing_boost_amount:      boostAmt,
        listing_boost_days:        boostDays,
        listing_points_cost:       d.listing_points_cost      ?? DEFAULT_PRICES.listing_points_cost,
        worker_points_cost:        d.worker_points_cost       ?? DEFAULT_PRICES.worker_points_cost,
        vastoq_points_pack_amount:  d.vastoq_points_pack_amount ?? DEFAULT_PRICES.vastoq_points_pack_amount,
        vastoq_points_pack_points:  d.vastoq_points_pack_points ?? DEFAULT_PRICES.vastoq_points_pack_points,

        listing_boost:               boostAmt,
        listing_boost_duration_days: boostDays,
      }
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
