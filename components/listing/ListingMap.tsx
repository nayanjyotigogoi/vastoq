'use client'

import { useEffect, useRef } from 'react'
import { Lock, MapPin } from 'lucide-react'
import { loadGoogleMaps } from '@/lib/googleMaps'

// ── Grayscale map style (used when listing is locked) ────────────────────────
const GRAYSCALE_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ saturation: -100 }] },
  { elementType: 'labels.text.fill', stylers: [{ saturation: -100 }, { lightness: -20 }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
]

const COLOR_STYLE: google.maps.MapTypeStyle[] = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
]

interface ListingMapProps {
  lat: number
  lng: number
  /** True once the user has unlocked the listing */
  unlocked: boolean
  locality: string
}

export default function ListingMap({ lat, lng, unlocked, locality }: ListingMapProps) {
  const mapRef     = useRef<HTMLDivElement>(null)
  const mapInst    = useRef<google.maps.Map | null>(null)
  const circleRef  = useRef<google.maps.Circle | null>(null)
  const markerRef  = useRef<any>(null)
  const gRef       = useRef<typeof google | null>(null)

  const radius = unlocked ? 200 : 600
  const zoom   = unlocked ? 16  : 13

  // ── Recreate map when unlocked state or location changes ──────────────────
  useEffect(() => {
    let cancelled = false
    let map: google.maps.Map | null = null
    let circle: google.maps.Circle | null = null
    let marker: any = null

    loadGoogleMaps().then((g) => {
      if (cancelled || !mapRef.current) return
      gRef.current = g

      map = new g.maps.Map(mapRef.current!, {
        center: { lat, lng },
        zoom,
        mapId: unlocked ? (process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID') : undefined,
        disableDefaultUI: true,
        zoomControl: false,
        draggable: unlocked,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        gestureHandling: unlocked ? 'cooperative' : 'none',
        clickableIcons: false,
        styles: unlocked ? undefined : GRAYSCALE_STYLE,
      })

      if (unlocked) {
        // @ts-ignore
        marker = new g.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat, lng },
          title: locality,
        })
      } else {
        circle = new g.maps.Circle({
          map,
          center: { lat, lng },
          radius,
          strokeColor:   '#1B2B6B',
          strokeOpacity: 0.9,
          strokeWeight:  2,
          fillColor:     '#1B2B6B',
          fillOpacity:   0.08,
          strokeDashArray: '6 4',
        } as any)
      }

      mapInst.current = map
      circleRef.current = circle
      markerRef.current = marker
    })

    return () => {
      cancelled = true
      if (circle) circle.setMap(null)
      if (marker) marker.map = null
      if (mapRef.current) {
        mapRef.current.innerHTML = ''
      }
      mapInst.current = null
      circleRef.current = null
      markerRef.current = null
    }
  }, [unlocked, lat, lng, zoom, radius, locality])

  return (
    <div className="relative rounded-[14px] overflow-hidden border border-[#E5E0D5] h-56" style={{ isolation: 'isolate' }}>

      {/* ── Map canvas ── */}
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

      {/* ── Locked overlay ── */}
      {!unlocked && (
        <div className="absolute inset-0 z-[900] flex flex-col items-center justify-center bg-white/10 backdrop-blur-[1.5px] pointer-events-none">
          <div className="bg-white/95 rounded-[12px] px-4 py-3 text-center shadow-sm border border-[#E5E0D5]">
            <Lock size={16} className="text-[#1B2B6B] mx-auto mb-1" />
            <p className="text-[13px] font-semibold text-[#1A1814]">General area shown</p>
            <p className="text-[11px] text-[#8A8480] mt-0.5">{locality} · Unlock to narrow it down</p>
          </div>
        </div>
      )}

      {/* ── Unlocked disclaimer badge ── */}
      {unlocked && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-[900] flex items-center gap-2 bg-white/95 border border-[#E5E0D5] rounded-full px-3.5 py-1.5 shadow-sm whitespace-nowrap">
          <div className="flex items-center gap-1.5 border-r border-[#E5E0D5] pr-2.5">
            <MapPin size={11} className="text-[#1D9E75]" />
            <span className="text-[11px] text-[#1D9E75] font-semibold">Exact location mapped</span>
          </div>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-[#1B2B6B] hover:text-[#2D3E8C] font-bold transition-colors"
          >
            Get directions
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
          </a>
        </div>
      )}
    </div>
  )
}

