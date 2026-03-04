import { useQuery } from '@tanstack/react-query'
import { fetchRouteDistanceKm } from '../utils/api'

// ─── useRouteDistance ─────────────────────────────────────────────────────────
// Fetches the driving route distance whenever both coordinates are available.

interface UseRouteDistanceReturn {
  distanceKm: number
  distanceStr: string
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
    queryFn: ({ signal }) => fetchRouteDistanceKm(fromCoords!, toCoords!, signal),
    enabled,
    staleTime: 5 * 60_000,
  })

  const isCalculating = enabled && query.isPending
  const distanceKm = typeof query.data === 'number' ? query.data : 0
  const distanceStr = typeof query.data === 'number' ? String(query.data) : ''
  const routeError = enabled && !query.isPending && (query.isError || query.data === null)

  return { distanceKm, distanceStr, routeError, isCalculating }
}
