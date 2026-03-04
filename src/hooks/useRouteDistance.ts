import { useQuery } from '@tanstack/react-query'
import { fetchRoute } from '../utils/api'
import type { RouteGeometry } from '../types'

// ─── useRouteDistance ─────────────────────────────────────────────────────────
// Fetches the driving route distance and geometry whenever both coordinates are available.

interface UseRouteDistanceReturn {
  distanceKm: number
  distanceStr: string
  routeGeometry: RouteGeometry | null
  routeError: boolean
  isCalculating: boolean
}

export function useRouteDistance(
  fromCoords: [number, number] | null,
  toCoords: [number, number] | null,
): UseRouteDistanceReturn {
  const enabled = fromCoords !== null && toCoords !== null

  const query = useQuery({
    queryKey: ['route', fromCoords, toCoords],
    queryFn: ({ signal }) => fetchRoute(fromCoords!, toCoords!, signal),
    enabled,
    staleTime: 5 * 60_000,
  })

  const isCalculating = enabled && query.isPending
  const distanceKm = query.data?.distanceKm ?? 0
  const distanceStr = query.data?.distanceKm != null ? String(query.data.distanceKm) : ''
  const routeGeometry = query.data?.geometry ?? null
  const routeError = enabled && !query.isPending && (query.isError || query.data?.distanceKm == null)

  return { distanceKm, distanceStr, routeGeometry, routeError, isCalculating }
}
