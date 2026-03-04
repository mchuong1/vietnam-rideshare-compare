import * as Separator from '@radix-ui/react-separator'
import type { Service, VehicleRate } from '../types'
import type { Translation } from '../i18n'
import { calcPrice, formatVND } from '../utils/pricing'

// ─── PriceCard ────────────────────────────────────────────────────────────────

export interface PriceCardProps {
  service: Service
  rate: VehicleRate
  distanceKm: number
  isCheaper: boolean
  t: Translation
  fromCoords: [number, number] | null
  toCoords: [number, number] | null
}

export function PriceCard({ service, rate, distanceKm, isCheaper, t, fromCoords, toCoords }: PriceCardProps) {
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
