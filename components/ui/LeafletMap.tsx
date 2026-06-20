'use client'

import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function MapClickHandler({ onPinSelect }: { onPinSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPinSelect(e.latlng.lat, e.latlng.lng)
    },
  })

  return null
}

export default function LeafletMap({
  latitude,
  longitude,
  onPinSelect,
}: {
  latitude: number
  longitude: number
  onPinSelect: (lat: number, lng: number) => void
}) {
  return (
    <MapContainer center={[latitude, longitude]} zoom={14} style={{ height: '220px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]} icon={icon}>
        <Popup>Click anywhere on the map to place the exact pin.</Popup>
      </Marker>
      <MapClickHandler onPinSelect={onPinSelect} />
    </MapContainer>
  )
}
