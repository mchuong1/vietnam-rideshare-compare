import type { VehicleRate } from '../types'

// ─── Pricing helpers ──────────────────────────────────────────────────────────

export function calcPrice(rate: VehicleRate, km: number): number {
  return Math.round(rate.baseFare + rate.perKm * km)
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}
