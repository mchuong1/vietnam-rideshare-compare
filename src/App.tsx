import { useState, useEffect, useRef } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import * as Label from '@radix-ui/react-label'
import * as Tooltip from '@radix-ui/react-tooltip'
import { type Lang, type Translation, translations } from './i18n'
import type { VehicleId } from './types'
import { SERVICES, VEHICLE_IDS } from './constants'
import { formatVND, calcPrice } from './utils/pricing'
import { reverseGeocode } from './utils/api'
import { useAddressInput } from './hooks/useAddressInput'
import { useGeolocation } from './hooks/useGeolocation'
import { useRouteDistance } from './hooks/useRouteDistance'
import { AddressInput } from './components/AddressInput'
import { PriceCard } from './components/PriceCard'

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [lang, setLang] = useState<Lang>('en')
  const t: Translation = translations[lang]
  const [vehicleId, setVehicleId] = useState<VehicleId>('bike')

  const from = useAddressInput()
  const to = useAddressInput()

  const geo = useGeolocation()
  const { setField: fromSetField } = from
  // Keep a ref to the latest fromText so the async callback can check it
  // without making it a reactive dependency (which would re-run the effect
  // on every keystroke).
  const fromTextRef = useRef(from.text)
  useEffect(() => { fromTextRef.current = from.text })

  useEffect(() => {
    if (geo.coords === null) return
    const [lat, lon] = geo.coords
    const controller = new AbortController()
    reverseGeocode(lat, lon, controller.signal).then((result) => {
      if (result && fromTextRef.current.trim() === '') {
        fromSetField(result.display_name, [lat, lon])
      }
    })
    return () => controller.abort()
  }, [geo.coords, fromSetField])

  const { distanceKm, distanceStr, routeError, isCalculating } = useRouteDistance(
    from.coords,
    to.coords,
  )

  function handleSwap() {
    const tmpText = from.text
    const tmpCoords = from.coords
    from.setField(to.text, to.coords)
    to.setField(tmpText, tmpCoords)
  }

  const grabTotal = distanceKm > 0 ? calcPrice(SERVICES.grab.vehicles[vehicleId], distanceKm) : null
  const xanhTotal = distanceKm > 0 ? calcPrice(SERVICES.xanh.vehicles[vehicleId], distanceKm) : null

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
                placeholder={geo.status === 'loading' ? t.locatingPlaceholder : t.pickupPlaceholder}
                value={from.text}
                suggestions={from.suggestions}
                showSuggestions={from.focused}
                onChange={from.handleChange}
                onSelect={from.handleSelect}
                onFocus={from.handleFocus}
                onBlur={from.handleBlur}
                isLocating={geo.status === 'loading'}
                locationError={geo.status === 'error'}
                locationErrorMsg={t.locationError}
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
                value={to.text}
                suggestions={to.suggestions}
                showSuggestions={to.focused}
                onChange={to.handleChange}
                onSelect={to.handleSelect}
                onFocus={to.handleFocus}
                onBlur={to.handleBlur}
              />

              {/* Route status */}
              {isCalculating && (
                <p className="text-sm text-gray-500 text-center">{t.calculating}</p>
              )}
              {routeError && (
                <p className="text-sm text-red-500 text-center">{t.routeError}</p>
              )}
              {!isCalculating && !routeError && distanceStr && (
                <div className="flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5">
                  <span className="text-base">🗺️</span>
                  <span className="text-sm text-gray-500">{t.routeDistance}</span>
                  <span className="ml-auto font-bold text-gray-800">{distanceStr} km</span>
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
                        className={`flex-1 min-w-30 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer
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
              distanceKm={distanceKm}
              isCheaper={grabCheaper}
              t={t}
              fromCoords={from.coords}
              toCoords={to.coords}
            />
            <PriceCard
              service={SERVICES.xanh}
              rate={SERVICES.xanh.vehicles[vehicleId]}
              distanceKm={distanceKm}
              isCheaper={xanhCheaper}
              t={t}
              fromCoords={from.coords}
              toCoords={to.coords}
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
