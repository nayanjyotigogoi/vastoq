'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import { loadGoogleMaps } from '@/lib/googleMaps'
import type { Listing } from './ListingCard'

// -- BHK colour palette ---------------------------------------------
const BHK_COLOR: Record<string, string> = {
  '1rk':  '#F59E0B',
  '1bhk': '#EC4899',
  '2bhk': '#8B5CF6',
  '3bhk': '#10B981',
  '4bhk': '#3B82F6',
  '5bhk': '#EF4444',
  'pg':   '#06B6D4',
  'room': '#F97316',
  'house':'#84CC16',
}
const DEFAULT_COLOR = '#6B7280'

function bhkColor(bhkRaw?: string, propertyType?: string): string {
  if (bhkRaw && BHK_COLOR[bhkRaw]) return BHK_COLOR[bhkRaw]
  const pt = propertyType?.toLowerCase()
  if (pt && BHK_COLOR[pt]) return BHK_COLOR[pt]
  return DEFAULT_COLOR
}

function bhkLabel(bhkRaw?: string, propertyType?: string): string {
  if (!bhkRaw) return propertyType ?? '-'
  const map: Record<string, string> = {
    '1rk': '1RK', '1bhk': '1BHK', '2bhk': '2BHK',
    '3bhk': '3BHK', '4bhk': '4BHK', '5bhk': '5BHK',
  }
  return map[bhkRaw] ?? bhkRaw.toUpperCase()
}

// -- Deterministic \u00B1~150 m offset so exact building is never shown -------------
function approxOffset(id: string): [number, number] {
  let h = 5381
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) + h + id.charCodeAt(i)) & 0x7fffffff
  }
  const latOff = ((h & 0xff) / 255 - 0.5) * 0.0027
  const lngOff = (((h >> 8) & 0xff) / 255 - 0.5) * 0.0035
  return [latOff, lngOff]
}

// -- Pill marker HTML -------------------------------------------------------------
function pillHtml(label: string, rentK: string, color: string, active: boolean): string {
  const shadow = active ? '0 4px 16px rgba(0,0,0,0.35)' : '0 2px 8px rgba(0,0,0,0.22)'
  const scale  = active ? 'scale(1.15)' : 'scale(1)'
  return `
    <div style="cursor:pointer;transform:${scale};transform-origin:center bottom;transition:transform .15s,box-shadow .15s">
      <div style="display:inline-flex;align-items:center;gap:4px;background:${color};color:#fff;padding:4px 9px;border-radius:20px;font-family:inherit;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:${shadow};border:2px solid #fff;">
        ${label}<span style="opacity:.75;font-weight:500">\u00B7${rentK}</span>
      </div>
      <div style="width:0;height:0;margin:0 auto;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${color};filter:drop-shadow(0 1px 1px rgba(0,0,0,.15));"></div>
    </div>`
}

// -- "You are here" pulsing marker HTML -----------------------------------------
const YOU_HTML = `
  <style>
    @keyframes vastoq-ring{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.8);opacity:0}}
    .vastoq-pulse{position:absolute;inset:0;border-radius:50%;background:#3B82F6;animation:vastoq-ring 1.6s ease-out infinite}
  </style>
  <div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
    <div class="vastoq-pulse"></div>
    <div style="width:14px;height:14px;background:#3B82F6;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(59,130,246,0.6);position:relative;z-index:2;"></div>
  </div>`

// -- Popup card HTML --------------------------------------------------------------
function popupHtml(listing: Listing, color: string, label: string): string {
  const rentStr = `\u20B9${listing.rent.toLocaleString('en-IN')}/mo`
  const photo = listing.photos?.[0]
    ? `<img src="${listing.photos[0]}" alt="${listing.title}" style="width:100%;height:112px;object-fit:cover;display:block;"/>`
    : `<div style="width:100%;height:64px;display:flex;align-items:center;justify-content:center;background:${color}22;">
         <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
       </div>`
  return `
    <div style="background:#fff;border-radius:14px;overflow:hidden;width:240px;font-family:inherit;border:1px solid #E5E0D5;box-shadow:0 8px 24px rgba(0,0,0,0.14);">
      ${photo}
      <div style="padding:10px 12px;">
        <span style="display:inline-block;font-size:10px;font-weight:700;color:#fff;background:${color};padding:2px 8px;border-radius:20px;margin-bottom:6px;">${label}</span>
        <p style="font-size:13px;font-weight:600;color:#1A1814;margin:0 0 4px;line-height:1.3;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${listing.title}</p>
        <p style="font-size:11px;color:#8A8480;margin:0 0 8px;">${listing.locality}</p>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:15px;font-weight:800;color:#1B2B6B;">${rentStr}</span>
          <a href="/rentals/${listing.id}" style="font-size:11px;font-weight:700;color:#1B2B6B;text-decoration:none;">View \u2192</a>
        </div>
      </div>
    </div>`
}

// -- Props ------------------------------------------------------------------------
interface RentalsMapViewProps {
  listings: Listing[]
  height?: string | number
  userLocation?: { lat: number; lng: number }
  onSelectListing?: (listing: Listing) => void
}

// -- Main component ---------------------------------------------------------------
export default function RentalsMapView({ listings, height, userLocation, onSelectListing }: RentalsMapViewProps) {
  const mapRef         = useRef<HTMLDivElement>(null)
  const gRef           = useRef<typeof google | null>(null)
  const mapInst        = useRef<google.maps.Map | null>(null)
  const markersRef     = useRef<any[]>([])
  const infoWindowRef  = useRef<google.maps.InfoWindow | null>(null)
  const youMarkerRef   = useRef<any>(null)
  const [mapReady, setMapReady] = useState(false)

  const pinned   = listings.filter((l) => l.latitude != null && l.longitude != null)
  const unpinned = listings.length - pinned.length

  // -- Init map ---------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false
    loadGoogleMaps().then((g) => {
      if (cancelled || !mapRef.current || mapInst.current) return
      gRef.current = g
      const fallback = { lat: 26.1445, lng: 91.7362 }
      const center = userLocation ?? fallback

      const map = new g.maps.Map(mapRef.current!, {
        center,
        zoom: 13,
        mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        clickableIcons: false,
        gestureHandling: 'cooperative',
      })

      mapInst.current = map
      infoWindowRef.current = new g.maps.InfoWindow()
      map.addListener('click', () => infoWindowRef.current?.close())
      setMapReady(true)
    })
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // -- Re-centre on user location -------------------------------------------------
  useEffect(() => {
    if (!mapInst.current || !userLocation) return
    mapInst.current.panTo(userLocation)
    mapInst.current.setZoom(13)
  }, [userLocation])

  // -- "You are here" marker ------------------------------------------------------
  useEffect(() => {
    if (!mapReady || !gRef.current || !mapInst.current) return
    if (!userLocation) { if (youMarkerRef.current) youMarkerRef.current.map = null; return }
    const el = document.createElement('div')
    el.innerHTML = YOU_HTML
    if (youMarkerRef.current) youMarkerRef.current.map = null
    // @ts-ignore
    youMarkerRef.current = new gRef.current.maps.marker.AdvancedMarkerElement({
      map: mapInst.current, position: userLocation, content: el, title: 'Your location', zIndex: 2000,
    })
  }, [mapReady, userLocation])

  // -- Listing markers -------------------------------------------------------------
  useEffect(() => {
    if (!mapReady || !gRef.current || !mapInst.current) return
    const g   = gRef.current
    const map = mapInst.current
    const iw  = infoWindowRef.current!

    // Clear old markers
    markersRef.current.forEach((m) => { m.map = null })
    markersRef.current = []

    // Fit bounds (only when no userLocation)
    if (pinned.length > 0 && !userLocation) {
      const bounds = new g.maps.LatLngBounds()
      pinned.forEach((l) => {
        const [dLat, dLng] = approxOffset(l.id)
        bounds.extend({ lat: l.latitude! + dLat, lng: l.longitude! + dLng })
      })
      if (pinned.length === 1) { map.setCenter(bounds.getCenter()); map.setZoom(14) }
      else {
        map.fitBounds(bounds, 48)
        g.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          if ((map.getZoom() ?? 0) > 14) map.setZoom(14)
        })
      }
    }

    pinned.forEach((listing) => {
      const [dLat, dLng] = approxOffset(listing.id)
      const pos   = { lat: listing.latitude! + dLat, lng: listing.longitude! + dLng }
      const color = bhkColor((listing as any).bhkRaw, listing.propertyType)
      const label = bhkLabel((listing as any).bhkRaw, listing.propertyType)
      const rentK = listing.rent >= 1000 ? `\u20B9${Math.round(listing.rent / 1000)}K` : `\u20B9${listing.rent}`

      const el = document.createElement('div')
      el.innerHTML = pillHtml(label, rentK, color, false)

      // @ts-ignore
      const marker = new g.maps.marker.AdvancedMarkerElement({
        map, position: pos, content: el, title: listing.title, zIndex: 0,
      })

      marker.addListener('click', () => {
        // Reset all markers to inactive
        markersRef.current.forEach((m) => {
          const l = pinned.find((x) => x.title === m.title)
          if (!l) return
          const c = bhkColor((l as any).bhkRaw, l.propertyType)
          const lb = bhkLabel((l as any).bhkRaw, l.propertyType)
          const rk = l.rent >= 1000 ? `\u20B9${Math.round(l.rent / 1000)}K` : `\u20B9${l.rent}`;
          (m.content as HTMLElement).innerHTML = pillHtml(lb, rk, c, false)
          m.zIndex = 0
        })
        el.innerHTML = pillHtml(label, rentK, color, true)
        marker.zIndex = 1000
        iw.setContent(popupHtml(listing, color, label))
        iw.open({ anchor: marker, map })
        onSelectListing?.(listing)
      })

      markersRef.current.push(marker)
    })
  }, [mapReady, listings]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="relative w-full rounded-[14px] overflow-hidden border border-[#E5E0D5] shadow-vastoq-sm"
      style={{ height: height ?? 'calc(100vh - 260px)', minHeight: 420 }}
    >
      {/* -- Google Map canvas -- */}
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

      {/* -- Legend -- */}
      <div className="absolute bottom-4 left-4 z-[900] bg-white/95 border border-[#E5E0D5] rounded-[12px] px-3 py-2.5 shadow-sm pointer-events-none">
        <p className="text-[10px] font-bold text-[#8A8480] uppercase tracking-wide mb-2">Type</p>
        <div className="flex flex-col gap-1.5">
          {[
            ['1RK',  '#F59E0B'], ['1BHK', '#EC4899'],
            ['2BHK', '#8B5CF6'], ['3BHK', '#10B981'],
            ['4BHK', '#3B82F6'], ['5BHK', '#EF4444'],
            ['PG',   '#06B6D4'], ['House','#84CC16'],
          ].map(([lbl, col]) => (
            <div key={lbl} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: col }} />
              <span className="text-[11px] font-medium text-[#4A4640]">{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* -- Stats badge -- */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[900] flex items-center gap-2 bg-white/95 border border-[#E5E0D5] rounded-full px-3 py-1.5 shadow-sm pointer-events-none">
        <MapPin size={12} className="text-[#1B2B6B]" />
        <span className="text-[12px] font-semibold text-[#1A1814]">
          {pinned.length} listing{pinned.length !== 1 ? 's' : ''} on map
        </span>
        {unpinned > 0 && (
          <span className="text-[11px] text-[#8A8480]">&middot; {unpinned} without coordinates</span>
        )}
      </div>

      {/* -- Privacy note -- */}
      <div className="absolute bottom-4 right-4 z-[900] bg-white/95 border border-[#E5E0D5] rounded-full px-3 py-1 shadow-sm pointer-events-none">
        <span className="text-[10px] text-[#8A8480]">Approx. area shown &middot; not exact</span>
      </div>
    </div>
  )
}
