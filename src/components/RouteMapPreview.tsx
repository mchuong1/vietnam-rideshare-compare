import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { RouteGeometry } from '../types'
import '../utils/leafletIcons'

// ─── FitBounds ────────────────────────────────────────────────────────────────
// Inner component that fits the map viewport to the route bounds on mount and
// whenever the from/to coords change.

function FitBounds({ from, to }: { from: [number, number]; to: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    const bounds = L.latLngBounds([from, to])
    map.fitBounds(bounds, { padding: [40, 40] })
  }, [map, from, to])
  return null
}

// ─── RouteMapPreview ──────────────────────────────────────────────────────────
// Shows a map with pickup + dropoff markers and the driving route polyline.
// OSRM returns GeoJSON coordinates as [lon, lat]; Leaflet expects [lat, lon].

interface RouteMapPreviewProps {
  from: [number, number]       // [lat, lon]
  to: [number, number]         // [lat, lon]
  geometry: RouteGeometry      // OSRM GeoJSON LineString ([lon, lat] pairs)
  height?: number
}

export function RouteMapPreview({ from, to, geometry, height = 300 }: RouteMapPreviewProps) {
  // Flip [lon, lat] → [lat, lon] for Leaflet
  const polylinePositions: [number, number][] = geometry.coordinates.map(
    ([lon, lat]) => [lat, lon],
  )

  // Compute initial bounds for MapContainer (used only on first render)
  const initialBounds = L.latLngBounds([from, to])

  return (
    <MapContainer
      key={`${from.join(',')}-${to.join(',')}`}
      bounds={initialBounds}
      boundsOptions={{ padding: [40, 40] }}
      style={{ height, width: '100%' }}
      zoomControl={false}
      attributionControl={false}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Marker position={from} />
      <Marker position={to} />
      <Polyline positions={polylinePositions} color="#00B14F" weight={4} opacity={0.85} />
      <FitBounds from={from} to={to} />
    </MapContainer>
  )
}
