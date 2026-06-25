'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Circle, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Lock, MapPin } from 'lucide-react'

// Fly to a new center + zoom when props change (handles locked→unlocked transition)
function MapController({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap()
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    map.flyTo([lat, lng], zoom, { duration: 0.8 })
  }, [lat, lng, zoom, map])
  return null
}

interface ListingMapProps {
  lat: number
  lng: number
  /** True once the user has unlocked the listing */
  unlocked: boolean
  locality: string
}

export default function ListingMap({ lat, lng, unlocked, locality }: ListingMapProps) {
  const radius = unlocked ? 200 : 600   // metres — smaller after unlock, still not pinpoint
  const zoom   = unlocked ? 15  : 13

  return (
    <div className="relative rounded-[14px] overflow-hidden border border-[#E5E0D5] h-56" style={{ isolation: 'isolate' }}>

      {/* ── Map ── */}
      <MapContainer
        key={`map-${unlocked}`}          // force re-mount on lock change
        center={[lat, lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
        dragging={unlocked}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={unlocked}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className={unlocked ? '' : 'grayscale opacity-70'}
        />

        {/* Area circle — never shows exact pin */}
        <Circle
          center={[lat, lng]}
          radius={radius}
          pathOptions={{
            color:       '#1B2B6B',
            fillColor:   '#1B2B6B',
            fillOpacity: unlocked ? 0.12 : 0.08,
            weight:      2,
            dashArray:   unlocked ? undefined : '6 4',
          }}
        />

        <MapController lat={lat} lng={lng} zoom={zoom} />
      </MapContainer>

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
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-[900] flex items-center gap-1.5 bg-white/95 border border-[#E5E0D5] rounded-full px-3 py-1 shadow-sm pointer-events-none whitespace-nowrap">
          <MapPin size={11} className="text-[#1B2B6B]" />
          <span className="text-[11px] text-[#4A4640] font-medium">Approx. area · exact address shared privately</span>
        </div>
      )}

      {/* ── OSM attribution (bottom-right, small) ── */}
      <div className="absolute bottom-1.5 right-2 z-[900] text-[9px] text-[#8A8480] pointer-events-none">
        © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="pointer-events-auto underline">OSM</a>
      </div>
    </div>
  )
}
