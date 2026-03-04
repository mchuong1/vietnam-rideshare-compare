import type { Service, VehicleId } from './types'

// ─── Pricing data (approximate VND rates, 2024) ────────────────────────────

export const SERVICES: Record<'grab' | 'xanh', Service> = {
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
      bike: { label: 'GrabBike',    baseFare: 8_000,  perKm: 3_800  },
      car4: { label: 'GrabCar 4',   baseFare: 27_000, perKm: 10_500 },
      car7: { label: 'GrabCar 7',   baseFare: 30_000, perKm: 12_000 },
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
      bike: { label: 'Xanh SM Bike',  baseFare: 8_000,  perKm: 3_600  },
      car4: { label: 'Xanh SM Car 4', baseFare: 25_000, perKm: 9_500  },
      car7: { label: 'Xanh SM Car 7', baseFare: 28_000, perKm: 11_500 },
    },
  },
}

export const VEHICLE_IDS: VehicleId[] = ['bike', 'car4', 'car7']

// Delay before hiding the suggestion dropdown on blur, giving onMouseDown on a
// suggestion enough time to fire before the list is unmounted.
export const BLUR_DELAY_MS = 150
