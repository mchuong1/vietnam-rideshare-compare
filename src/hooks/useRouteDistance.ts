import { useState, useEffect } from 'react'
import { fetchRouteDistanceKm } from '../utils/api'

// ─── useRouteDistance ─────────────────────────────────────────────────────────
// Fetches the driving route distance whenever both coordinates are available.

interface UseRouteDistanceReturn {
  distanceKm: number
  distanceStr: string
  routeError: boolean
  isCalculating: boolean
}

interface RouteResult {
  distance: string
  routeError: boolean
  computedFor: string | null
}

export function useRouteDistance(
  fromCoords: [number, number] | null,
  toCoords: [number, number] | null,
): UseRouteDistanceReturn {
  const [{ distance, routeError, computedFor }, setResult] = useState<RouteResult>({
    distance: '',
    routeError: false,
    computedFor: null,
  })

  useEffect(() => {
    if (!fromCoords || !toCoords) return

    const key = JSON.stringify([fromCoords, toCoords])
    let cancelled = false

    fetchRouteDistanceKm(fromCoords, toCoords).then((km) => {
      if (!cancelled) {
        setResult(
          km !== null
            ? { distance: String(km), routeError: false, computedFor: key }
            : { distance: '', routeError: true, computedFor: key },
        )
      }
    })
    return () => { cancelled = true }
  }, [fromCoords, toCoords])

  const coordKey = fromCoords && toCoords ? JSON.stringify([fromCoords, toCoords]) : null
  const isStale = coordKey !== computedFor
  const isCalculating = fromCoords !== null && toCoords !== null && isStale
  const distanceStr = isStale ? '' : distance
  const hasRouteError = !isStale && routeError
  const distanceKm = parseFloat(distanceStr) || 0

  return { distanceKm, distanceStr, routeError: hasRouteError, isCalculating }
}
