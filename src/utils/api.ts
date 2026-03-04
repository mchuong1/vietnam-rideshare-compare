import type { NominatimResult, RouteGeometry } from '../types'

// ─── Address & Route API helpers ──────────────────────────────────────────────

export async function reverseGeocode(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<NominatimResult | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&countrycodes=vn`,
      { headers: { 'Accept-Language': 'vi,en' }, signal },
    )
    if (!res.ok) return null
    const data = await res.json() as NominatimResult & { error?: string }
    if (data.error) return null
    return data
  } catch {
    return null
  }
}

export async function searchAddress(query: string, signal?: AbortSignal): Promise<NominatimResult[]> {
  if (query.trim().length < 3) return []
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&countrycodes=vn&limit=5`,
      { headers: { 'Accept-Language': 'vi,en' }, signal },
    )
    if (!res.ok) return [];
    return await res.json() as NominatimResult[]
  } catch {
    return []
  }
}

export interface RouteResult {
  distanceKm: number | null
  geometry: RouteGeometry | null
}

export async function fetchRoute(
  from: [number, number],
  to: [number, number],
  signal?: AbortSignal,
): Promise<RouteResult> {
  try {
    // OSRM expects [longitude, latitude]
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`
    const res = await fetch(url, { signal })
    if (!res.ok) return { distanceKm: null, geometry: null }
    const data = await res.json() as {
      code: string
      routes?: { distance: number; geometry: RouteGeometry }[]
    }
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0]
      return {
        distanceKm: Math.round(route.distance / 100) / 10, // meters → km, 1 dp
        geometry: route.geometry,
      }
    }
    return { distanceKm: null, geometry: null }
  } catch {
    return { distanceKm: null, geometry: null }
  }
}
