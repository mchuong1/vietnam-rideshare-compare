// ─── Translations ──────────────────────────────────────────────────────────────

export type Lang = 'en' | 'vi'

export type Translation = {
  appTitle: string
  appSubtitle: string
  appSubtitleAnd: string
  appSubtitlePrices: string
  langToggle: string
  langToggleLabel: string
  pickupLabel: string
  pickupPlaceholder: string
  destinationLabel: string
  destinationPlaceholder: string
  swapAriaLabel: string
  calculating: string
  routeError: string
  routeDistance: string
  vehicleType: string
  vehicleBike: string
  vehicleCar4: string
  vehicleCar7: string
  baseFare: string
  perKm: string
  estTotal: string
  bestPrice: string
  savingsGrab: (amount: string) => string
  savingsXanh: (amount: string) => string
  savingsTie: string
  disclaimerTrigger: string
  disclaimerTooltip: string
  disclaimerFooter: string
  bookNow: string
}

export const translations = {
  en: {
    appTitle: '🛺 Vietnam Rideshare Compare',
    appSubtitle: 'Instantly compare',
    appSubtitleAnd: 'vs',
    appSubtitlePrices: 'prices',
    langToggle: 'VI',
    langToggleLabel: 'Switch to Vietnamese',
    pickupLabel: 'Pickup location',
    pickupPlaceholder: 'Enter pickup address…',
    destinationLabel: 'Destination',
    destinationPlaceholder: 'Enter destination address…',
    swapAriaLabel: 'Swap pickup and destination',
    calculating: '⏳ Calculating route…',
    routeError: 'Could not calculate route. Please check the addresses.',
    routeDistance: 'Route distance',
    vehicleType: 'Vehicle type',
    vehicleBike: '🛵 Motorcycle',
    vehicleCar4: '🚗 Car 4-seat',
    vehicleCar7: '🚐 Car 7-seat',
    baseFare: 'Base fare',
    perKm: 'Per km',
    estTotal: 'Est. total',
    bestPrice: '✓ Best Price',
    savingsGrab: (amount: string) => `Grab saves you ${amount} compared to Xanh SM.`,
    savingsXanh: (amount: string) => `Xanh SM saves you ${amount} compared to Grab.`,
    savingsTie: 'Both services offer the same price for this trip.',
    disclaimerTrigger: 'ⓘ Disclaimer',
    disclaimerTooltip:
      'Prices are estimates based on approximate 2024 base rates and may vary by time, traffic, surge pricing, and promotions. Always check the official app for the exact fare before booking.',
    disclaimerFooter: '— Prices are estimates. Check the app for the exact fare.',
    bookNow: 'Book Now →',
  },
  vi: {
    appTitle: '🛺 So Sánh Giá Xe Việt Nam',
    appSubtitle: 'So sánh ngay',
    appSubtitleAnd: 'và',
    appSubtitlePrices: 'giá cước',
    langToggle: 'EN',
    langToggleLabel: 'Chuyển sang tiếng Anh',
    pickupLabel: 'Điểm đón',
    pickupPlaceholder: 'Nhập địa chỉ đón…',
    destinationLabel: 'Điểm đến',
    destinationPlaceholder: 'Nhập địa chỉ đến…',
    swapAriaLabel: 'Hoán đổi điểm đón và điểm đến',
    calculating: '⏳ Đang tính tuyến đường…',
    routeError: 'Không thể tính tuyến đường. Vui lòng kiểm tra địa chỉ.',
    routeDistance: 'Khoảng cách tuyến đường',
    vehicleType: 'Loại xe',
    vehicleBike: '🛵 Xe máy',
    vehicleCar4: '🚗 Xe 4 chỗ',
    vehicleCar7: '🚐 Xe 7 chỗ',
    baseFare: 'Giá mở cửa',
    perKm: 'Mỗi km',
    estTotal: 'Tổng ước tính',
    bestPrice: '✓ Giá Tốt Nhất',
    savingsGrab: (amount: string) => `Grab tiết kiệm cho bạn ${amount} so với Xanh SM.`,
    savingsXanh: (amount: string) => `Xanh SM tiết kiệm cho bạn ${amount} so với Grab.`,
    savingsTie: 'Cả hai dịch vụ cùng giá cho chuyến đi này.',
    disclaimerTrigger: 'ⓘ Lưu ý',
    disclaimerTooltip:
      'Giá là ước tính dựa trên mức giá cơ bản năm 2024 và có thể thay đổi theo thời gian, giao thông, giá tăng vọt và khuyến mãi. Luôn kiểm tra ứng dụng chính thức để biết giá chính xác trước khi đặt xe.',
    disclaimerFooter: '— Giá chỉ là ước tính. Kiểm tra ứng dụng để biết giá chính xác.',
    bookNow: 'Đặt ngay →',
  },
} as const satisfies Record<Lang, Translation>
