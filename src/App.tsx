import { useState, useEffect, useRef } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import * as Label from '@radix-ui/react-label'
import * as Separator from '@radix-ui/react-separator'
import * as Tooltip from '@radix-ui/react-tooltip'
import { type Lang, type Translation, translations } from './i18n'

// ─── Types ────────────────────────────────────────────────────────────────────

type VehicleId = 'bike' | 'car4' | 'car7'

interface VehicleRate {
  label: string
  baseFare: number
  perKm: number
}

interface Service {
  name: string
  accent: string        // Tailwind bg class
  accentText: string    // Tailwind text class
  accentBorder: string  // Tailwind border class
  getBookingUrl: (from: [number, number] | null, to: [number, number] | null) => string
  vehicles: Record<VehicleId, VehicleRate>
}

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

// ─── Pricing data (approximate VND rates, 2024) ────────────────────────────

const SERVICES: Record<'grab' | 'xanh', Service> = {
  grab: {
    name: 'Grab',
    accent: 'bg-[#00B14F]',
    accentText: 'text-[#00B14F]',
    accentBorder: 'border-[#00B14F]',
    getBookingUrl: (from, to) => {
      if (from && to) {
        return `grab://open?screenType=BOOKING&startLat=${encodeURIComponent(from[0])}&startLng=${encodeURIComponent(from[1])}&endLat=${encodeURIComponent(to[0])}&endLng=${encodeURIComponent(to[1])}`
      }
      return 'https://www.grab.com/vn/transport/'
    },
    vehicles: {
      bike: { label: 'GrabBike', baseFare: 8_000,  perKm: 3_800  },
      car4: { label: 'GrabCar 4', baseFare: 27_000, perKm: 10_500 },
      car7: { label: 'GrabCar 7', baseFare: 30_000, perKm: 12_000 },
    },
  },
  xanh: {
    name: 'Xanh SM',
    accent: 'bg-[#006DB3]',
    accentText: 'text-[#006DB3]',
    accentBorder: 'border-[#006DB3]',
    getBookingUrl: () => {
      const ua = navigator.userAgent
      if (/android/i.test(ua)) {
        const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.gsm.customer'
        return `intent://#Intent;package=com.gsm.customer;S.browser_fallback_url=${encodeURIComponent(playStoreUrl)};end`
      }
      if (/iPad|iPhone|iPod/.test(ua)) {
        return 'https://apps.apple.com/app/id6446425595'
      }
      return 'https://xanhsm.com/'
    },
    vehicles: {
      bike: { label: 'Xanh SM Bike', baseFare: 8_000,  perKm: 3_600  },
      car4: { label: 'Xanh SM Car 4', baseFare: 25_000, perKm: 9_500  },
      car7: { label: 'Xanh SM Car 7', baseFare: 28_000, perKm: 11_500 },
    },
  },
}

const VEHICLE_IDS: VehicleId[] = ['bike', 'car4', 'car7']

// ─── Address API helpers ──────────────────────────────────────────────────────

async function searchAddress(query: string): Promise<NominatimResult[]> {
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

async function fetchRouteDistanceKm(
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcPrice(rate: VehicleRate, km: number): number {
  return Math.round(rate.baseFare + rate.perKm * km)
}

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

// ─── AddressInput ─────────────────────────────────────────────────────────────

// Delay before hiding the suggestion dropdown on blur, giving onMouseDown on a
// suggestion enough time to fire before the list is unmounted.
const BLUR_DELAY_MS = 150

interface AddressInputProps {
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
}

function AddressInput({
  id, label, marker, markerColor, placeholder, value,
  suggestions, showSuggestions, onChange, onSelect, onFocus, onBlur,
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
          {marker}
        </span>
        <input
          id={id}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          autoComplete="off"
          className="w-full rounded-xl border-2 border-gray-200 pl-10 pr-4 py-3 text-base outline-none transition-colors focus:border-[#00B14F]"
        />
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 right-0 z-20 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-h-64 overflow-y-auto">
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              onMouseDown={() => onSelect(s)}
              className="px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
            >
              <span className="mr-1.5 opacity-60">📍</span>
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── PriceCard ────────────────────────────────────────────────────────────────

interface PriceCardProps {
  service: Service
  rate: VehicleRate
  distanceKm: number
  isCheaper: boolean
  t: Translation
  fromCoords: [number, number] | null
  toCoords: [number, number] | null
}

function PriceCard({ service, rate, distanceKm, isCheaper, t, fromCoords, toCoords }: PriceCardProps) {
  const total = distanceKm > 0 ? calcPrice(rate, distanceKm) : null
  const bookingUrl = service.getBookingUrl(fromCoords, toCoords)

  return (
    <div
      className={`relative flex flex-col rounded-2xl overflow-hidden bg-white shadow-md border-2 transition-all duration-200 ${
        isCheaper
          ? `${service.accentBorder} shadow-lg`
          : 'border-transparent'
      }`}
    >
      {/* Best price badge */}
      {isCheaper && (
        <span
          className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-0.5 rounded-full bg-white border ${service.accentBorder} ${service.accentText}`}
        >
          {t.bestPrice}
        </span>
      )}

      {/* Header */}
      <div className={`${service.accent} px-5 py-4 flex items-center gap-3`}>
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl font-black text-white">
          {service.name.charAt(0)}
        </div>
        <div>
          <p className="text-white font-bold text-lg leading-tight">{service.name}</p>
          <p className="text-white/80 text-xs">{rate.label}</p>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 flex flex-col gap-2.5 flex-1">
        <div className="flex justify-between text-sm text-gray-500">
          <span>{t.baseFare}</span>
          <span className="font-semibold text-gray-800">{formatVND(rate.baseFare)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>{t.perKm}</span>
          <span className="font-semibold text-gray-800">{formatVND(rate.perKm)}</span>
        </div>

        {total !== null && (
          <>
            <Separator.Root className="bg-gray-100 h-px my-1" />
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-gray-600 font-medium">
                {t.estTotal}&nbsp;
                <span className="text-gray-400 font-normal">({distanceKm} km)</span>
              </span>
              <span className={`text-2xl font-extrabold ${service.accentText}`}>
                {formatVND(total)}
              </span>
            </div>
          </>
        )}

        {/* Book Now button */}
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-auto pt-3 block w-full rounded-xl py-2.5 text-center text-sm font-bold transition-all duration-150 ${
            isCheaper
              ? `${service.accent} text-white shadow-sm hover:opacity-90`
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t.bookNow}
        </a>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [lang, setLang] = useState<Lang>('en')
  const t = translations[lang]

  const [fromText, setFromText] = useState('')
  const [toText, setToText] = useState('')
  const [fromCoords, setFromCoords] = useState<[number, number] | null>(null)
  const [toCoords, setToCoords] = useState<[number, number] | null>(null)
  const [fromSuggestions, setFromSuggestions] = useState<NominatimResult[]>([])
  const [toSuggestions, setToSuggestions] = useState<NominatimResult[]>([])
  const [fromFocused, setFromFocused] = useState(false)
  const [toFocused, setToFocused] = useState(false)
  const [distance, setDistance] = useState('')
  const [routeError, setRouteError] = useState(false)
  const [vehicleId, setVehicleId] = useState<VehicleId>('bike')

  // Derived: true while both coords are known but we haven't received the route
  // result yet. Expressed as derived state so the effect body only ever calls
  // setState inside async callbacks (satisfies react-hooks/set-state-in-effect).
  const isCalculating = fromCoords !== null && toCoords !== null && distance === '' && !routeError

  const fromTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const toTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleFromChange(text: string) {
    setFromText(text)
    setFromCoords(null)
    setDistance('')
    setRouteError(false)
    if (fromTimer.current) clearTimeout(fromTimer.current)
    if (text.trim().length >= 3) {
      fromTimer.current = setTimeout(() => {
        searchAddress(text).then(setFromSuggestions)
      }, 500)
    } else {
      setFromSuggestions([])
    }
  }

  function handleToChange(text: string) {
    setToText(text)
    setToCoords(null)
    setDistance('')
    setRouteError(false)
    if (toTimer.current) clearTimeout(toTimer.current)
    if (text.trim().length >= 3) {
      toTimer.current = setTimeout(() => {
        searchAddress(text).then(setToSuggestions)
      }, 500)
    } else {
      setToSuggestions([])
    }
  }

  function handleFromSelect(result: NominatimResult) {
    setFromText(result.display_name)
    setFromCoords([parseFloat(result.lat), parseFloat(result.lon)])
    setFromSuggestions([])
    setFromFocused(false)
    setDistance('')
    setRouteError(false)
  }

  function handleToSelect(result: NominatimResult) {
    setToText(result.display_name)
    setToCoords([parseFloat(result.lat), parseFloat(result.lon)])
    setToSuggestions([])
    setToFocused(false)
    setDistance('')
    setRouteError(false)
  }

  function handleSwap() {
    const tmpText = fromText
    const tmpCoords = fromCoords
    setFromText(toText)
    setFromCoords(toCoords)
    setToText(tmpText)
    setToCoords(tmpCoords)
    setFromSuggestions([])
    setToSuggestions([])
    setDistance('')
    setRouteError(false)
  }

  useEffect(() => {
    if (!fromCoords || !toCoords) return
    let cancelled = false
    fetchRouteDistanceKm(fromCoords, toCoords).then((km) => {
      if (!cancelled) {
        if (km !== null) {
          setDistance(String(km))
        } else {
          setRouteError(true)
        }
      }
    })
    return () => { cancelled = true }
  }, [fromCoords, toCoords])

  const km = parseFloat(distance) || 0

  const grabTotal = km > 0 ? calcPrice(SERVICES.grab.vehicles[vehicleId], km) : null
  const xanhTotal = km > 0 ? calcPrice(SERVICES.xanh.vehicles[vehicleId], km) : null

  const grabCheaper = grabTotal !== null && xanhTotal !== null && grabTotal < xanhTotal
  const xanhCheaper = grabTotal !== null && xanhTotal !== null && xanhTotal < grabTotal

  let savingsMsg: string | null = null
  if (grabTotal !== null && xanhTotal !== null) {
    if (grabTotal < xanhTotal) {
      savingsMsg = t.savingsGrab(formatVND(xanhTotal - grabTotal))
    } else if (xanhTotal < grabTotal) {
      savingsMsg = t.savingsXanh(formatVND(grabTotal - xanhTotal))
    } else {
      savingsMsg = t.savingsTie
    }
  }

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-6 text-center relative">
          <button
            type="button"
            onClick={() => setLang((l) => (l === 'en' ? 'vi' : 'en'))}
            aria-label={t.langToggleLabel}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg border-2 border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-600 hover:border-[#00B14F] hover:text-[#00B14F] transition-colors cursor-pointer"
          >
            {t.langToggle}
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {t.appTitle}
          </h1>
          <p className="mt-1 text-gray-500 text-sm">
            {t.appSubtitle}{' '}
            <span className="font-semibold text-[#00B14F]">Grab</span>{' '}
            {t.appSubtitleAnd}{' '}
            <span className="font-semibold text-[#006DB3]">Xanh SM</span>{' '}
            {t.appSubtitlePrices}
          </p>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
          {/* Input card */}
          <section className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-5">
            {/* Address inputs */}
            <div className="flex flex-col gap-3">
              <AddressInput
                id="from"
                label={t.pickupLabel}
                marker="A"
                markerColor="bg-[#00B14F]"
                placeholder={t.pickupPlaceholder}
                value={fromText}
                suggestions={fromSuggestions}
                showSuggestions={fromFocused}
                onChange={handleFromChange}
                onSelect={handleFromSelect}
                onFocus={() => setFromFocused(true)}
                onBlur={() => { setTimeout(() => setFromFocused(false), BLUR_DELAY_MS) }}
              />

              {/* Swap button */}
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-dashed border-gray-200" />
                <button
                  type="button"
                  onClick={handleSwap}
                  aria-label={t.swapAriaLabel}
                  className="text-gray-400 hover:text-[#00B14F] text-lg transition-colors p-1 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  ⇅
                </button>
                <div className="flex-1 border-t border-dashed border-gray-200" />
              </div>

              <AddressInput
                id="to"
                label={t.destinationLabel}
                marker="B"
                markerColor="bg-[#006DB3]"
                placeholder={t.destinationPlaceholder}
                value={toText}
                suggestions={toSuggestions}
                showSuggestions={toFocused}
                onChange={handleToChange}
                onSelect={handleToSelect}
                onFocus={() => setToFocused(true)}
                onBlur={() => { setTimeout(() => setToFocused(false), BLUR_DELAY_MS) }}
              />

              {/* Route status */}
              {isCalculating && (
                <p className="text-sm text-gray-500 text-center">{t.calculating}</p>
              )}
              {routeError && (
                <p className="text-sm text-red-500 text-center">{t.routeError}</p>
              )}
              {!isCalculating && !routeError && distance && (
                <div className="flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5">
                  <span className="text-base">🗺️</span>
                  <span className="text-sm text-gray-500">{t.routeDistance}</span>
                  <span className="ml-auto font-bold text-gray-800">{distance} km</span>
                </div>
              )}
            </div>

            {/* Vehicle type tabs */}
            <div className="flex flex-col gap-1.5">
              <Label.Root className="text-sm font-semibold text-gray-700">
                {t.vehicleType}
              </Label.Root>
              <Tabs.Root
                value={vehicleId}
                onValueChange={(v) => setVehicleId(v as VehicleId)}
              >
                <Tabs.List className="flex gap-2 flex-wrap">
                  {VEHICLE_IDS.map((id) => {
                    const vehicleLabels: Record<VehicleId, string> = { bike: t.vehicleBike, car4: t.vehicleCar4, car7: t.vehicleCar7 }
                    return (
                      <Tabs.Trigger
                        key={id}
                        value={id}
                        className={`flex-1 min-w-[120px] rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer
                          data-[state=inactive]:border-gray-200 data-[state=inactive]:bg-gray-50 data-[state=inactive]:text-gray-600
                          data-[state=active]:border-[#00B14F] data-[state=active]:bg-[#00B14F] data-[state=active]:text-white`}
                      >
                        {vehicleLabels[id]}
                      </Tabs.Trigger>
                    )
                  })}
                </Tabs.List>
              </Tabs.Root>
            </div>
          </section>

          {/* Price cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PriceCard
              service={SERVICES.grab}
              rate={SERVICES.grab.vehicles[vehicleId]}
              distanceKm={km}
              isCheaper={grabCheaper}
              t={t}
              fromCoords={fromCoords}
              toCoords={toCoords}
            />
            <PriceCard
              service={SERVICES.xanh}
              rate={SERVICES.xanh.vehicles[vehicleId]}
              distanceKm={km}
              isCheaper={xanhCheaper}
              t={t}
              fromCoords={fromCoords}
              toCoords={toCoords}
            />
          </section>

          {/* Savings banner */}
          {savingsMsg && (
            <div className="rounded-xl border-l-4 border-[#00B14F] bg-green-50 px-5 py-3 text-sm font-semibold text-green-900">
              {savingsMsg}
            </div>
          )}

          {/* Disclaimer */}
          <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 text-center leading-relaxed">
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="cursor-help underline decoration-dotted">{t.disclaimerTrigger}</span>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="max-w-xs rounded-xl bg-gray-900 px-3 py-2 text-xs text-white shadow-xl"
                  sideOffset={6}
                >
                  {t.disclaimerTooltip}
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
            {t.disclaimerFooter}
          </p>
        </main>
      </div>
    </Tooltip.Provider>
  )
}
