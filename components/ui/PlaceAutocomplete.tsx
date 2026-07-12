'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MapPin, Loader2, X } from 'lucide-react'
import { loadGoogleMaps } from '@/lib/googleMaps'

interface PlaceAutocompleteProps {
  value: string
  onChange: (val: string) => void
  onSelect: (val: string, latLng?: { lat: number; lng: number }) => void
  placeholder?: string
  containerClassName?: string
  inputClassName?: string
  icon?: React.ReactNode
  userLatLng?: { lat: number; lng: number }
}

export default function PlaceAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Search locality, city...',
  containerClassName = '',
  inputClassName = 'w-full bg-transparent text-[14px] text-[#1A1814] placeholder:text-[#8A8480] focus:outline-none',
  icon,
  userLatLng,
}: PlaceAutocompleteProps) {
  // Use any[] to avoid strict type incompatibilities with older versions of @types/google.maps
  const [predictions, setPredictions] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null)
  const isSelectingRef = useRef(false)
  const sessionTokenRef = useRef<any>(null)

  // Initialize AutocompleteService (as fallback)
  useEffect(() => {
    loadGoogleMaps().then((g) => {
      autocompleteServiceRef.current = new g.maps.places.AutocompleteService()
    })
  }, [])

  // Helper to lazily create a billing session token
  const getSessionToken = () => {
    if (!sessionTokenRef.current && window.google?.maps?.places?.AutocompleteSessionToken) {
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken()
    }
    return sessionTokenRef.current
  }

  const getMainText = (p: any) => {
    const main = p.placePrediction?.mainText
    if (!main) return ''
    return typeof main === 'string' ? main : main.toString()
  }

  const getSecondaryText = (p: any) => {
    const sec = p.placePrediction?.secondaryText
    if (!sec) return ''
    return typeof sec === 'string' ? sec : sec.toString()
  }

  // Fetch suggestions with debounce using AutocompleteSuggestion or AutocompleteService as fallback
  useEffect(() => {
    if (!value.trim()) {
      setPredictions([])
      return
    }

    if (isSelectingRef.current) {
      isSelectingRef.current = false
      return
    }

    const timer = setTimeout(() => {
      setLoading(true)

      const hasNewApi = !!window.google?.maps?.places?.AutocompleteSuggestion

      if (hasNewApi) {
        // Modern recommended API (Places API v2)
        const token = getSessionToken()
        const request: any = {
          input: value,
          includedRegionCodes: ['IN'],
        }
        if (token) request.sessionToken = token
        if (userLatLng && window.google?.maps?.LatLng) {
          request.locationBias = new window.google.maps.LatLng(userLatLng.lat, userLatLng.lng)
        }

        window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request)
          .then(({ suggestions }) => {
            setLoading(false)
            if (suggestions && Array.isArray(suggestions)) {
              setPredictions(suggestions)
            } else {
              setPredictions([])
            }
          })
          .catch(() => {
            setLoading(false)
            setPredictions([])
          })
      } else if (autocompleteServiceRef.current) {
        // Legacy fallback API (Places API v1)
        autocompleteServiceRef.current.getPlacePredictions(
          {
            input: value,
            componentRestrictions: { country: 'in' },
            locationBias: userLatLng && window.google?.maps?.LatLng
              ? new window.google.maps.LatLng(userLatLng.lat, userLatLng.lng)
              : undefined,
          },
          (results, status) => {
            setLoading(false)
            if (status === 'OK' && results) {
              // Normalize legacy results to match the AutocompleteSuggestion shape
              const normalized = results.map((r) => ({
                placePrediction: {
                  placeId: r.place_id,
                  mainText: r.structured_formatting.main_text,
                  secondaryText: r.structured_formatting.secondary_text,
                  text: r.description,
                },
              }))
              setPredictions(normalized)
            } else {
              setPredictions([])
            }
          }
        )
      } else {
        setLoading(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [value, userLatLng])

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectPrediction = (prediction: any) => {
    isSelectingRef.current = true
    const text = prediction.placePrediction?.text || prediction.placePrediction?.description || ''
    const fullText = typeof text === 'string' ? text : text.toString()
    
    // Clear session token for the next input session
    sessionTokenRef.current = null

    setIsOpen(false)
    setPredictions([])

    // Geocode the place to get coordinates
    if (window.google?.maps?.Geocoder && prediction.placePrediction?.placeId) {
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ placeId: prediction.placePrediction.placeId }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const loc = results[0].geometry.location
          onSelect(fullText, { lat: loc.lat(), lng: loc.lng() })
        } else {
          onSelect(fullText)
        }
      })
    } else {
      onSelect(fullText)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || predictions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % predictions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev - 1 + predictions.length) % predictions.length)
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < predictions.length) {
        e.preventDefault()
        handleSelectPrediction(predictions[activeIndex])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center gap-2 ${containerClassName}`}
    >
      {icon}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setIsOpen(true)
          setActiveIndex(-1)
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        className={inputClassName}
        aria-autocomplete="list"
        aria-expanded={isOpen}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('')
            setIsOpen(false)
            setPredictions([])
          }}
          aria-label="Clear search"
          className="p-1 hover:bg-black/5 rounded-full transition-colors flex-shrink-0"
        >
          <X size={14} className="text-[#8A8480]" />
        </button>
      )}

      {isOpen && (predictions.length > 0 || loading) && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#E5E0D5] rounded-[12px] shadow-vastoq-lg z-[9999] py-1.5 overflow-hidden text-left">
          {loading && predictions.length === 0 ? (
            <div className="flex items-center justify-center py-4 text-[#8A8480]">
              <Loader2 size={16} className="animate-spin mr-2" />
              <span className="text-[13px]">Finding places...</span>
            </div>
          ) : (
            <ul className="max-h-[240px] overflow-y-auto">
              {predictions.map((p, idx) => {
                const isSelected = idx === activeIndex
                const placeId = p.placePrediction?.placeId || idx
                return (
                  <li
                    key={placeId}
                    onClick={() => handleSelectPrediction(p)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`flex items-start gap-2.5 px-4 py-2.5 cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#F5F0E8] text-[#1A1814]' : 'text-[#4A4640] hover:bg-[#F5F0E8]'
                    }`}
                  >
                    <MapPin size={15} className="text-[#1B2B6B] mt-0.5 flex-shrink-0" />
                    <div className="flex flex-col leading-tight">
                      <span className="text-[13px] font-semibold text-[#1A1814]">
                        {getMainText(p)}
                      </span>
                      <span className="text-[11px] text-[#8A8480]">
                        {getSecondaryText(p)}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
