'use client'

import { useEffect, useRef } from 'react'
import { loadGoogleMaps } from '@/lib/googleMaps'

export default function GoogleMapPicker({
  latitude,
  longitude,
  onPinSelect,
}: {
  latitude: number
  longitude: number
  onPinSelect: (lat: number, lng: number) => void
}) {
  const mapRef    = useRef<HTMLDivElement>(null)
  const mapInst   = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<any>(null)

  // ── Init map once ─────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    loadGoogleMaps().then((g) => {
      if (cancelled || !mapRef.current || mapInst.current) return

      const map = new g.maps.Map(mapRef.current!, {
        center: { lat: latitude, lng: longitude },
        zoom: 14,
        mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        clickableIcons: false,
        gestureHandling: 'cooperative',
      })

      // Draggable marker
      // @ts-ignore
      const marker = new g.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: latitude, lng: longitude },
        title: 'Drag to set exact location',
        gmpDraggable: true,
      })

      marker.addListener('dragend', (e: any) => {
        const pos = marker.position as google.maps.LatLngLiteral
        onPinSelect(pos.lat, pos.lng)
      })

      // Click on map to move pin
      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return
        marker.position = e.latLng
        onPinSelect(e.latLng.lat(), e.latLng.lng())
      })

      mapInst.current = map
      markerRef.current = marker
    })
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync marker when lat/lng props change externally (e.g. geocode result) ─
  useEffect(() => {
    if (!markerRef.current || !mapInst.current) return
    const pos = { lat: latitude, lng: longitude }
    markerRef.current.position = pos
    mapInst.current.panTo(pos)
  }, [latitude, longitude])

  return (
    <div ref={mapRef} style={{ height: '220px', width: '100%' }} />
  )
}

