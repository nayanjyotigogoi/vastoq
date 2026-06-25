'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'
import { MapPin, ExternalLink, X } from 'lucide-react'
import type { Listing } from './ListingCard'

// ── BHK colour palette ────────────────────────────────────────────────────────
const BHK_COLOR: Record<string, string> = {
  '1rk':  '#F59E0B',   // amber
  '1bhk': '#EC4899',   // pink
  '2bhk': '#8B5CF6',   // purple
  '3bhk': '#10B981',   // green
  '4bhk': '#3B82F6',   // blue
  '5bhk': '#EF4444',   // red
  'pg':   '#06B6D4',   // cyan
  'room': '#F97316',   // orange
  'house':'#84CC16',   // lime
}
const DEFAULT_COLOR = '#6B7280'

function bhkColor(bhkRaw?: string, propertyType?: string): string {
  if (bhkRaw && BHK_COLOR[bhkRaw]) return BHK_COLOR[bhkRaw]
  const pt = propertyType?.toLowerCase()
  if (pt && BHK_COLOR[pt]) return BHK_COLOR[pt]
  return DEFAULT_COLOR
}

function bhkLabel(bhkRaw?: string, propertyType?: string): string {
  if (!bhkRaw) return propertyType ?? '—'
  const map: Record<string, string> = {
    '1rk': '1RK', '1bhk': '1BHK', '2bhk': '2BHK',
    '3bhk': '3BHK', '4bhk': '4BHK', '5bhk': '5BHK',
  }
  return map[bhkRaw] ?? bhkRaw.toUpperCase()
}

// ── Deterministic ±~150 m offset so exact building is never shown ─────────────
function approxOffset(id: string): [number, number] {
  let h = 5381
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) + h + id.charCodeAt(i)) & 0x7fffffff
  }
  const latOff = ((h & 0xff) / 255 - 0.5) * 0.0027        // ±0.00135° ≈ ±150 m
  const lngOff = (((h >> 8) & 0xff) / 255 - 0.5) * 0.0035 // ±0.00175° ≈ ±150 m
  return [latOff, lngOff]
}

// ── Custom pill marker ────────────────────────────────────────────────────────
function pillIcon(label: string, rentK: string, color: string, active: boolean) {
  const scale = active ? 'scale(1.15)' : 'scale(1)'
  const shadow = active
    ? '0 4px 16px rgba(0,0,0,0.35)'
    : '0 2px 8px rgba(0,0,0,0.22)'
  const html = `
    <div style="
      display:inline-flex;align-items:center;gap:4px;
      background:${color};color:#fff;
      padding:4px 9px;border-radius:20px;
      font-family:inherit;font-size:11px;font-weight:700;
      white-space:nowrap;
      box-shadow:${shadow};border:2px solid #fff;
      transform:${scale};transform-origin:center bottom;
      transition:transform 0.15s,box-shadow 0.15s;
      cursor:pointer;
    ">
      ${label}<span style="opacity:.75;font-weight:500">·${rentK}</span>
    </div>
    <div style="
      width:0;height:0;margin:0 auto;
      border-left:5px solid transparent;
      border-right:5px solid transparent;
      border-top:6px solid ${color};
      filter:drop-shadow(0 1px 1px rgba(0,0,0,.15));
    "></div>
  `
  return L.divIcon({ html, className: '', iconSize: [0, 0], iconAnchor: [0, 0] })
}

// ── Auto-fit: prefer user location, else fit listing bounds ──────────────────
function BoundsFitter({
  points,
  userLocation,
}: {
  points: [number, number][]
  userLocation?: { lat: number; lng: number }
}) {
  const map = useMap()
  const fitted = useRef(false)
  useEffect(() => {
    if (fitted.current) return
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 13)
      fitted.current = true
      return
    }
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], 14)
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 14 })
    }
    fitted.current = true
  }, [points, userLocation, map])
  return null
}

// ── Pulsing "You are here" marker ─────────────────────────────────────────────
function UserLocationMarker({ lat, lng }: { lat: number; lng: number }) {
  const icon = L.divIcon({
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `
      <div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
        <div class="vastoq-you-pulse"></div>
        <div style="width:14px;height:14px;background:#3B82F6;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(59,130,246,0.6);position:relative;z-index:2;"></div>
      </div>
    `,
  })
  return (
    <Marker position={[lat, lng]} icon={icon} zIndexOffset={2000}>
      <Popup closeButton={false} offset={[0, -8]}>
        <div style={{ padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#1A1814', whiteSpace: 'nowrap' }}>
          📍 Your location
        </div>
      </Popup>
    </Marker>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
interface RentalsMapViewProps {
  listings: Listing[]
  height?: string | number
  userLocation?: { lat: number; lng: number }
  onSelectListing?: (listing: Listing) => void
}

export default function RentalsMapView({ listings, height, userLocation, onSelectListing }: RentalsMapViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  // Only listings that have coordinates
  const pinned = listings.filter(
    (l) => l.latitude != null && l.longitude != null
  )
  const unpinned = listings.length - pinned.length

  // Build map points (with offset)
  const points: [number, number][] = pinned.map((l) => {
    const [dLat, dLng] = approxOffset(l.id)
    return [l.latitude! + dLat, l.longitude! + dLng]
  })

  // Center: user location → listing centroid → Guwahati fallback
  const fallbackCenter: [number, number] = [26.1445, 91.7362]
  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : points.length > 0
    ? [
        points.reduce((s, p) => s + p[0], 0) / points.length,
        points.reduce((s, p) => s + p[1], 0) / points.length,
      ]
    : fallbackCenter

  return (
    <div className="relative w-full rounded-[14px] overflow-hidden border border-[#E5E0D5] shadow-vastoq-sm"
         style={{ height: height ?? 'calc(100vh - 260px)', minHeight: 420 }}>

      {/* ── Map ── */}
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        attributionControl={false}
        scrollWheelZoom={true}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <BoundsFitter points={points} userLocation={userLocation} />

        {/* User's location marker */}
        {userLocation && (
          <UserLocationMarker lat={userLocation.lat} lng={userLocation.lng} />
        )}

        {pinned.map((listing, idx) => {
          const [dLat, dLng] = approxOffset(listing.id)
          const pos: [number, number] = [listing.latitude! + dLat, listing.longitude! + dLng]
          const color  = bhkColor((listing as any).bhkRaw, listing.propertyType)
          const label  = bhkLabel((listing as any).bhkRaw, listing.propertyType)
          const rentK  = listing.rent >= 1000
            ? `₹${Math.round(listing.rent / 1000)}K`
            : `₹${listing.rent}`
          const isActive = activeId === listing.id

          return (
            <Marker
              key={listing.id}
              position={pos}
              icon={pillIcon(label, rentK, color, isActive)}
              eventHandlers={{
                click: () => {
                  setActiveId(listing.id === activeId ? null : listing.id)
                  onSelectListing?.(listing)
                },
              }}
              zIndexOffset={isActive ? 1000 : 0}
            >
              <Popup
                offset={[0, -8]}
                closeButton={false}
                className="vastoq-popup"
                eventHandlers={{ remove: () => setActiveId(null) }}
              >
                <PopupCard listing={listing} color={color} label={label} />
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* ── Legend ── */}
      <div className="absolute bottom-4 left-4 z-[900] bg-white/95 border border-[#E5E0D5] rounded-[12px] px-3 py-2.5 shadow-sm">
        <p className="text-[10px] font-bold text-[#8A8480] uppercase tracking-wide mb-2">Type</p>
        <div className="flex flex-col gap-1.5">
          {[
            ['1RK', '#F59E0B'],
            ['1BHK', '#EC4899'],
            ['2BHK', '#8B5CF6'],
            ['3BHK', '#10B981'],
            ['4BHK', '#3B82F6'],
            ['5BHK', '#EF4444'],
            ['PG', '#06B6D4'],
            ['House', '#84CC16'],
          ].map(([lbl, col]) => (
            <div key={lbl} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: col }}
              />
              <span className="text-[11px] font-medium text-[#4A4640]">{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stats badge ── */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[900] flex items-center gap-2 bg-white/95 border border-[#E5E0D5] rounded-full px-3 py-1.5 shadow-sm pointer-events-none">
        <MapPin size={12} className="text-[#1B2B6B]" />
        <span className="text-[12px] font-semibold text-[#1A1814]">
          {pinned.length} listing{pinned.length !== 1 ? 's' : ''} on map
        </span>
        {unpinned > 0 && (
          <span className="text-[11px] text-[#8A8480]">· {unpinned} without coordinates</span>
        )}
      </div>

      {/* ── Privacy note ── */}
      <div className="absolute bottom-4 right-4 z-[900] bg-white/95 border border-[#E5E0D5] rounded-full px-3 py-1 shadow-sm pointer-events-none">
        <span className="text-[10px] text-[#8A8480]">Approx. area shown · not exact</span>
      </div>

      {/* ── OSM attribution ── */}
      <div className="absolute bottom-1 right-24 z-[900] text-[9px] text-[#8A8480]">
        © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">OpenStreetMap</a>
      </div>

      {/* ── Global popup + animation styles ── */}
      <style>{`
        @keyframes vastoq-you-ring {
          0%   { transform: scale(1);   opacity: 0.7; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        .vastoq-you-pulse {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #3B82F6;
          animation: vastoq-you-ring 1.6s ease-out infinite;
        }
        .vastoq-popup .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 14px;
          border: 1px solid #E5E0D5;
          box-shadow: 0 8px 24px rgba(0,0,0,0.14);
          overflow: hidden;
          min-width: 220px;
          max-width: 260px;
        }
        .vastoq-popup .leaflet-popup-content {
          margin: 0;
          width: 100% !important;
        }
        .vastoq-popup .leaflet-popup-tip-container {
          display: none;
        }
      `}</style>
    </div>
  )
}

// ── Popup card ────────────────────────────────────────────────────────────────
function PopupCard({
  listing,
  color,
  label,
}: {
  listing: Listing
  color: string
  label: string
}) {
  const rentStr = `₹${listing.rent.toLocaleString('en-IN')}/mo`

  return (
    <div className="bg-white rounded-[14px] overflow-hidden w-full">
      {/* Photo */}
      {listing.photos?.[0] ? (
        <img
          src={listing.photos[0]}
          alt={listing.title}
          className="w-full h-28 object-cover"
        />
      ) : (
        <div
          className="w-full h-16 flex items-center justify-center"
          style={{ background: color + '22' }}
        >
          <MapPin size={22} style={{ color }} />
        </div>
      )}

      {/* Info */}
      <div className="px-3 py-2.5">
        {/* BHK pill */}
        <span
          className="inline-block text-[10px] font-bold text-white px-2 py-0.5 rounded-full mb-1.5"
          style={{ background: color }}
        >
          {label}
        </span>

        <p className="text-[13px] font-semibold text-[#1A1814] leading-snug mb-0.5 line-clamp-2">
          {listing.title}
        </p>

        <p className="text-[11px] text-[#8A8480] mb-2 flex items-center gap-1">
          <MapPin size={10} className="flex-shrink-0" />
          {listing.locality}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-[15px] font-extrabold text-[#1B2B6B]">{rentStr}</span>
          <Link
            href={`/rentals/${listing.id}`}
            className="flex items-center gap-1 text-[11px] font-bold text-[#1B2B6B] hover:underline"
          >
            View <ExternalLink size={10} />
          </Link>
        </div>
      </div>
    </div>
  )
}
