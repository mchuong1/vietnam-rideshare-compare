// ─── Leaflet default icon fix for Vite ────────────────────────────────────────
// Vite's asset pipeline breaks Leaflet's default marker icon URL resolution.
// This module patches the default icon options once, so any file that imports
// it gets correctly resolved PNG assets bundled by Vite.

import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})
