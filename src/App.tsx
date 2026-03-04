import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import * as Label from '@radix-ui/react-label'
import * as Separator from '@radix-ui/react-separator'
import * as Tooltip from '@radix-ui/react-tooltip'

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
  vehicles: Record<VehicleId, VehicleRate>
}

// ─── Pricing data (approximate VND rates, 2024) ────────────────────────────

const SERVICES: Record<'grab' | 'xanh', Service> = {
  grab: {
    name: 'Grab',
    accent: 'bg-[#00B14F]',
    accentText: 'text-[#00B14F]',
    accentBorder: 'border-[#00B14F]',
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
    vehicles: {
      bike: { label: 'Xanh SM Bike', baseFare: 8_000,  perKm: 3_600  },
      car4: { label: 'Xanh SM Car 4', baseFare: 25_000, perKm: 9_500  },
      car7: { label: 'Xanh SM Car 7', baseFare: 28_000, perKm: 11_500 },
    },
  },
}

const VEHICLE_TABS: { id: VehicleId; label: string }[] = [
  { id: 'bike', label: '🛵 Motorcycle' },
  { id: 'car4', label: '🚗 Car 4-seat' },
  { id: 'car7', label: '🚐 Car 7-seat' },
]

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

// ─── PriceCard ────────────────────────────────────────────────────────────────

interface PriceCardProps {
  service: Service
  rate: VehicleRate
  distanceKm: number
  isCheaper: boolean
}

function PriceCard({ service, rate, distanceKm, isCheaper }: PriceCardProps) {
  const total = distanceKm > 0 ? calcPrice(rate, distanceKm) : null

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
          ✓ Best Price
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
          <span>Base fare</span>
          <span className="font-semibold text-gray-800">{formatVND(rate.baseFare)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Per km</span>
          <span className="font-semibold text-gray-800">{formatVND(rate.perKm)}</span>
        </div>

        {total !== null && (
          <>
            <Separator.Root className="bg-gray-100 h-px my-1" />
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-gray-600 font-medium">
                Est. total&nbsp;
                <span className="text-gray-400 font-normal">({distanceKm} km)</span>
              </span>
              <span className={`text-2xl font-extrabold ${service.accentText}`}>
                {formatVND(total)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [distance, setDistance] = useState<string>('')
  const [vehicleId, setVehicleId] = useState<VehicleId>('bike')

  const km = parseFloat(distance) || 0

  const grabTotal = km > 0 ? calcPrice(SERVICES.grab.vehicles[vehicleId], km) : null
  const xanhTotal = km > 0 ? calcPrice(SERVICES.xanh.vehicles[vehicleId], km) : null

  const grabCheaper = grabTotal !== null && xanhTotal !== null && grabTotal < xanhTotal
  const xanhCheaper = grabTotal !== null && xanhTotal !== null && xanhTotal < grabTotal

  let savingsMsg: string | null = null
  if (grabTotal !== null && xanhTotal !== null) {
    if (grabTotal < xanhTotal) {
      savingsMsg = `Grab saves you ${formatVND(xanhTotal - grabTotal)} compared to Xanh SM.`
    } else if (xanhTotal < grabTotal) {
      savingsMsg = `Xanh SM saves you ${formatVND(grabTotal - xanhTotal)} compared to Grab.`
    } else {
      savingsMsg = 'Both services offer the same price for this trip.'
    }
  }

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-6 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            🛺 Vietnam Rideshare Compare
          </h1>
          <p className="mt-1 text-gray-500 text-sm">
            Instantly compare <span className="font-semibold text-[#00B14F]">Grab</span> vs{' '}
            <span className="font-semibold text-[#006DB3]">Xanh SM</span> prices
          </p>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
          {/* Input card */}
          <section className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-5">
            {/* Distance input */}
            <div className="flex flex-col gap-1.5">
              <Label.Root
                htmlFor="distance"
                className="text-sm font-semibold text-gray-700"
              >
                Trip distance (km)
              </Label.Root>
              <input
                id="distance"
                type="number"
                min="0.1"
                step="0.1"
                placeholder="e.g. 5"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base outline-none transition-colors focus:border-[#00B14F]"
              />
            </div>

            {/* Vehicle type tabs */}
            <div className="flex flex-col gap-1.5">
              <Label.Root className="text-sm font-semibold text-gray-700">
                Vehicle type
              </Label.Root>
              <Tabs.Root
                value={vehicleId}
                onValueChange={(v) => setVehicleId(v as VehicleId)}
              >
                <Tabs.List className="flex gap-2 flex-wrap">
                  {VEHICLE_TABS.map((tab) => (
                    <Tabs.Trigger
                      key={tab.id}
                      value={tab.id}
                      className={`flex-1 min-w-[120px] rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer
                        data-[state=inactive]:border-gray-200 data-[state=inactive]:bg-gray-50 data-[state=inactive]:text-gray-600
                        data-[state=active]:border-[#00B14F] data-[state=active]:bg-[#00B14F] data-[state=active]:text-white`}
                    >
                      {tab.label}
                    </Tabs.Trigger>
                  ))}
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
            />
            <PriceCard
              service={SERVICES.xanh}
              rate={SERVICES.xanh.vehicles[vehicleId]}
              distanceKm={km}
              isCheaper={xanhCheaper}
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
                <span className="cursor-help underline decoration-dotted">ⓘ Disclaimer</span>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="max-w-xs rounded-xl bg-gray-900 px-3 py-2 text-xs text-white shadow-xl"
                  sideOffset={6}
                >
                  Prices are estimates based on approximate 2024 base rates and may vary by
                  time, traffic, surge pricing, and promotions. Always check the official app
                  for the exact fare before booking.
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
            — Prices are estimates. Check the app for the exact fare.
          </p>
        </main>
      </div>
    </Tooltip.Provider>
  )
}
