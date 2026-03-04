import type { NominatimResult } from '../types'

// ─── Address & Route API helpers ──────────────────────────────────────────────

export async function searchAddress(query: string): Promise<NominatimResult[]> {
  if (query.trim().length < 3) return []
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&countrycodes=vn&limit=5`,
      { headers: { 'Accept-Language': 'vi,en' } },
    )
    return await res.json() as NominatimResult[]
  } catch {
    return []
  }
}

export async function fetchRouteDistanceKm(
  from: [number, number],
  to: [number, number],
): Promise<number | null> {
  try {
    // OSRM expects [longitude, latitude]
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=false`
    const res = await fetch(url)
    const data = await res.json() as { code: string; routes?: { distance: number }[] }
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      return Math.round(data.routes[0].distance / 100) / 10 // meters → km, 1 dp
    }
    return null
  } catch {
    return null
  }
}
