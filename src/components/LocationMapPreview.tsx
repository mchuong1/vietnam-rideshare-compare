import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import '../utils/leafletIcons'

// ─── MapPanner ────────────────────────────────────────────────────────────────
// Inner component that imperatively pans the map when coords change, replacing
// the old `key`-based remount pattern so the map survives coord updates.

function MapPanner({ coords, zoom }: { coords: [number, number]; zoom: number }) {
  const map = useMap()
  const [lat, lon] = coords
  useEffect(() => {
    map.setView([lat, lon], zoom)
  }, [map, lat, lon, zoom])
  return null
}

// ─── LocationMapPreview ───────────────────────────────────────────────────────
// Shows a single map tile centred on one address coordinate.
// Pass `onDrag` to enable the pin to be dragged to a new location.

interface LocationMapPreviewProps {
  coords: [number, number]  // [lat, lon]
  height?: number
  onDrag?: (lat: number, lon: number) => void
}

export function LocationMapPreview({ coords, height = 300, onDrag }: LocationMapPreviewProps) {
  const zoom = 17
  return (
    <MapContainer
      center={coords}
      zoom={zoom}
      style={{ height, width: '100%' }}
      zoomControl={false}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Marker
        position={coords}
        draggable={!!onDrag}
        eventHandlers={{
          dragend: (e) => {
            if (!onDrag) return
            const { lat, lng } = e.target.getLatLng()
            onDrag(lat, lng)
          },
        }}
      />
      <MapPanner coords={coords} zoom={zoom} />
    </MapContainer>
  )
}
