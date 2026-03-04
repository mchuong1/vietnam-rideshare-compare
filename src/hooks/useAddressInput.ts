import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { NominatimResult } from '../types'
import { searchAddress } from '../utils/api'
import { BLUR_DELAY_MS } from '../constants'

// ─── useAddressInput ──────────────────────────────────────────────────────────
// Manages all state for a single address autocomplete field.

interface UseAddressInputReturn {
  text: string
  coords: [number, number] | null
  suggestions: NominatimResult[]
  focused: boolean
  handleChange: (value: string) => void
  handleSelect: (result: NominatimResult) => void
  handleFocus: () => void
  handleBlur: () => void
  reset: () => void
  setText: (value: string) => void
  setCoords: (coords: [number, number] | null) => void
  /** Atomically replace text + coords and clear suggestions/focused state. */
  setField: (text: string, coords: [number, number] | null) => void
}

export function useAddressInput(
  onCoordsChange?: () => void,
): UseAddressInputReturn {
  const [text, setText] = useState('')
  const [coords, setCoords] = useState<[number, number] | null>(null)
  const [focused, setFocused] = useState(false)
  // debouncedText drives the query key — only updates 500 ms after the user stops
  // typing, so in-flight requests for superseded keystrokes are never applied.
  const [debouncedText, setDebouncedText] = useState('')

  useEffect(() => {
    const id = setTimeout(() => setDebouncedText(text), 500)
    return () => clearTimeout(id)
  }, [text])

  const query = useQuery({
    queryKey: ['address', debouncedText],
    queryFn: ({ signal }) => searchAddress(debouncedText, signal),
    enabled: debouncedText.trim().length >= 3,
    staleTime: 60_000,
  })

  // Only surface results while the field is focused; stale cache is invisible
  // after the user picks a result or blurs away.
  const suggestions: NominatimResult[] = focused ? (query.data ?? []) : []

  function handleChange(value: string) {
    setText(value)
    setCoords(null)
    onCoordsChange?.()
  }

  function handleSelect(result: NominatimResult) {
    setText(result.display_name)
    setCoords([parseFloat(result.lat), parseFloat(result.lon)])
    setFocused(false)
    // Sync debouncedText immediately so the debounce timer doesn't fire a
    // redundant fetch after selection.
    setDebouncedText(result.display_name)
  }

  function handleFocus() {
    setFocused(true)
  }

  function handleBlur() {
    setTimeout(() => setFocused(false), BLUR_DELAY_MS)
  }

  function reset() {
    setText('')
    setCoords(null)
    setFocused(false)
    setDebouncedText('')
  }

  function setField(newText: string, newCoords: [number, number] | null) {
    setText(newText)
    setCoords(newCoords)
    setFocused(false)
    setDebouncedText(newText)
  }

  return {
    text,
    coords,
    suggestions,
    focused,
    handleChange,
    handleSelect,
    handleFocus,
    handleBlur,
    reset,
    setText,
    setCoords,
    setField,
  }
}
