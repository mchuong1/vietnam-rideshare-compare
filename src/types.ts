// ─── Types ────────────────────────────────────────────────────────────────────

export type VehicleId = 'bike' | 'car4' | 'car7'

export interface VehicleRate {
  label: string
  baseFare: number
  perKm: number
}

export interface Service {
  name: string
  accent: string        // Tailwind bg class
  accentText: string    // Tailwind text class
  accentBorder: string  // Tailwind border class
  getBookingUrl: (from: [number, number] | null, to: [number, number] | null) => string
  vehicles: Record<VehicleId, VehicleRate>
}

export interface RouteGeometry {
  type: 'LineString'
  coordinates: [number, number][]  // [lon, lat]
}

export interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}
