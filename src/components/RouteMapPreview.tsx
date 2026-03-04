import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { RouteGeometry } from '../types'
import '../utils/leafletIcons'

// ─── FitBounds ────────────────────────────────────────────────────────────────
// Inner component that fits the map viewport to the route bounds on mount and
// whenever the from/to coords change.

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length === 0) return
    const bounds = L.latLngBounds(positions)
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 })
  }, [map, positions])
  return null
}

// ─── RouteMapPreview ──────────────────────────────────────────────────────────
// Shows a map with pickup + dropoff markers and the driving route polyline.
// OSRM returns GeoJSON coordinates as [lon, lat]; Leaflet expects [lat, lon].
// Pass `onFromDrag` / `onToDrag` to enable draggable pins.

interface RouteMapPreviewProps {
  from: [number, number]       // [lat, lon]
  to: [number, number]         // [lat, lon]
  geometry: RouteGeometry      // OSRM GeoJSON LineString ([lon, lat] pairs)
  height?: number
  onFromDrag?: (lat: number, lon: number) => void
  onToDrag?: (lat: number, lon: number) => void
}

export function RouteMapPreview({ from, to, geometry, height = 300, onFromDrag, onToDrag }: RouteMapPreviewProps) {
  // Flip [lon, lat] → [lat, lon] for Leaflet
  const polylinePositions: [number, number][] = geometry.coordinates.map(
    ([lon, lat]) => [lat, lon],
  )

  // Compute initial bounds from the full route polyline so the entire path is visible.
  // FitBounds handles subsequent changes imperatively without remounting.
  const initialBounds = L.latLngBounds(polylinePositions.length > 0 ? polylinePositions : [from, to])

  return (
    <MapContainer
      bounds={initialBounds}
      boundsOptions={{ padding: [60, 60], maxZoom: 16 }}
      style={{ height, width: '100%' }}
      zoomControl={false}
      attributionControl={false}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Marker
        position={from}
        draggable={!!onFromDrag}
        eventHandlers={{
          dragend: (e) => {
            if (!onFromDrag) return
            const { lat, lng } = e.target.getLatLng()
            onFromDrag(lat, lng)
          },
        }}
      />
      <Marker
        position={to}
        draggable={!!onToDrag}
        eventHandlers={{
          dragend: (e) => {
            if (!onToDrag) return
            const { lat, lng } = e.target.getLatLng()
            onToDrag(lat, lng)
          },
        }}
      />
      <Polyline positions={polylinePositions} color="#00B14F" weight={4} opacity={0.85} />
      <FitBounds positions={polylinePositions} />
    </MapContainer>
  )
}
