import { useState, useEffect } from 'react'

// ─── useGeolocation ───────────────────────────────────────────────────────────
// Requests the user's current position once on mount.

type GeolocationStatus = 'idle' | 'loading' | 'success' | 'error'

interface UseGeolocationReturn {
  status: GeolocationStatus
  coords: [number, number] | null
}

export function useGeolocation(): UseGeolocationReturn {
  const [status, setStatus] = useState<GeolocationStatus>('idle')
  const [coords, setCoords] = useState<[number, number] | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('error')
      return
    }

    setStatus('loading')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords([position.coords.latitude, position.coords.longitude])
        setStatus('success')
      },
      () => {
        setStatus('error')
      },
      { timeout: 10_000 },
    )
  }, [])

  return { status, coords }
}
