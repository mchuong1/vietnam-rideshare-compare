import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import '../utils/leafletIcons'

// ─── LocationMapPreview ───────────────────────────────────────────────────────
// Shows a single map tile centred on one address coordinate.
// `key` should be set by the parent to `coords.join(',')` so the MapContainer
// remounts whenever the coordinate changes (MapContainer's center is not
// reactive after initial render).

interface LocationMapPreviewProps {
  coords: [number, number]  // [lat, lon]
  height?: number
}

export function LocationMapPreview({ coords, height = 300 }: LocationMapPreviewProps) {
  return (
    <MapContainer
      key={coords.join(',')}
      center={coords}
      zoom={15}
      style={{ height, width: '100%' }}
      zoomControl={false}
      attributionControl={false}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Marker position={coords} />
    </MapContainer>
  )
}
