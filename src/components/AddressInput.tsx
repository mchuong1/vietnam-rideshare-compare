import * as Label from '@radix-ui/react-label'
import type { NominatimResult } from '../types'

// ─── AddressInput ─────────────────────────────────────────────────────────────

export interface AddressInputProps {
  id: string
  label: string
  marker: string
  markerColor: string
  placeholder: string
  value: string
  suggestions: NominatimResult[]
  showSuggestions: boolean
  onChange: (text: string) => void
  onSelect: (result: NominatimResult) => void
  onFocus: () => void
  onBlur: () => void
  isLocating?: boolean
  locationError?: boolean
  locationErrorMsg?: string
}

export function AddressInput({
  id, label, marker, markerColor, placeholder, value,
  suggestions, showSuggestions, onChange, onSelect, onFocus, onBlur,
  isLocating = false, locationError = false, locationErrorMsg,
}: AddressInputProps) {
  return (
    <div className="relative flex flex-col gap-1.5">
      <Label.Root htmlFor={id} className="text-sm font-semibold text-gray-700">
        {label}
      </Label.Root>
      <div className="relative flex items-center">
        <span
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white pointer-events-none ${markerColor}`}
        >
          {isLocating ? '⌛' : marker}
        </span>
        <input
          id={id}
          type="text"
          placeholder={isLocating ? placeholder : placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          autoComplete="off"
          disabled={isLocating}
          className={`w-full rounded-xl border-2 pl-10 pr-4 py-3 text-base outline-none transition-colors focus:border-[#00B14F] ${
            isLocating ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' : 'border-gray-200'
          }`}
        />
      </div>
      {locationError && locationErrorMsg && (
        <p className="text-xs text-red-500">{locationErrorMsg}</p>
      )}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 right-0 z-20 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-h-64 overflow-y-auto">
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              className="border-b border-gray-100 last:border-0"
            >
              <button
                type="button"
                onMouseDown={() => onSelect(s)}
                onClick={() => onSelect(s)}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <span className="mr-1.5 opacity-60">📍</span>
                {s.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
