import { useState, useRef } from 'react'
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
}

export function useAddressInput(
  onCoordsChange?: () => void,
): UseAddressInputReturn {
  const [text, setText] = useState('')
  const [coords, setCoords] = useState<[number, number] | null>(null)
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [focused, setFocused] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(value: string) {
    setText(value)
    setCoords(null)
    onCoordsChange?.()
    if (timer.current) clearTimeout(timer.current)
    if (value.trim().length >= 3) {
      timer.current = setTimeout(() => {
        searchAddress(value).then(setSuggestions)
      }, 500)
    } else {
      setSuggestions([])
    }
  }

  function handleSelect(result: NominatimResult) {
    setText(result.display_name)
    setCoords([parseFloat(result.lat), parseFloat(result.lon)])
    setSuggestions([])
    setFocused(false)
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
    setSuggestions([])
    setFocused(false)
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
  }
}
