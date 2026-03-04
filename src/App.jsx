import { useState } from 'react'
import './App.css'

// ─── Pricing data (approximate VND rates as of 2024) ──────────────────────────
const SERVICES = {
  grab: {
    name: 'Grab',
    color: '#00B14F',
    textColor: '#fff',
    logo: '🟢',
    vehicles: {
      bike: { label: 'GrabBike', baseFare: 8000, perKm: 3800 },
      car4: { label: 'GrabCar 4', baseFare: 27000, perKm: 10500 },
      car7: { label: 'GrabCar 7', baseFare: 30000, perKm: 12000 },
    },
  },
  xanh: {
    name: 'Xanh SM',
    color: '#006DB3',
    textColor: '#fff',
    logo: '🔵',
    vehicles: {
      bike: { label: 'Xanh SM Bike', baseFare: 8000, perKm: 3600 },
      car4: { label: 'Xanh SM Car 4', baseFare: 25000, perKm: 9500 },
      car7: { label: 'Xanh SM Car 7', baseFare: 28000, perKm: 11500 },
    },
  },
}

const VEHICLE_TYPES = [
  { id: 'bike', label: '🛵 Motorcycle (Xe máy)' },
  { id: 'car4', label: '🚗 Car 4-seat (Ô tô 4 chỗ)' },
  { id: 'car7', label: '🚐 Car 7-seat (Ô tô 7 chỗ)' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcPrice(vehicle, distanceKm) {
  return Math.round(vehicle.baseFare + vehicle.perKm * distanceKm)
}

function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function PriceCard({ service, vehicleType, distanceKm, isCheaper }) {
  const vehicle = service.vehicles[vehicleType]
  const price = distanceKm > 0 ? calcPrice(vehicle, distanceKm) : null

  return (
    <div
      className={`price-card ${isCheaper ? 'price-card--winner' : ''}`}
      style={{ '--brand': service.color }}
    >
      {isCheaper && <div className="winner-badge">✓ Best Price</div>}
      <div className="price-card__header" style={{ background: service.color }}>
        <span className="price-card__logo">{service.logo}</span>
        <div>
          <div className="price-card__service">{service.name}</div>
          <div className="price-card__vehicle">{vehicle.label}</div>
        </div>
      </div>
      <div className="price-card__body">
        <div className="price-row">
          <span>Base fare</span>
          <span>{formatVND(vehicle.baseFare)}</span>
        </div>
        <div className="price-row">
          <span>Per km</span>
          <span>{formatVND(vehicle.perKm)}</span>
        </div>
        {distanceKm > 0 && (
          <>
            <hr />
            <div className="price-row price-row--total">
              <span>Est. total ({distanceKm} km)</span>
              <span className="price-total">{formatVND(price)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function App() {
  const [distance, setDistance] = useState('')
  const [vehicleType, setVehicleType] = useState('bike')

  const distanceKm = parseFloat(distance) || 0

  const grabPrice = distanceKm > 0
    ? calcPrice(SERVICES.grab.vehicles[vehicleType], distanceKm)
    : null
  const xanhPrice = distanceKm > 0
    ? calcPrice(SERVICES.xanh.vehicles[vehicleType], distanceKm)
    : null

  const grabCheaper = grabPrice !== null && grabPrice < xanhPrice
  const xanhCheaper = xanhPrice !== null && xanhPrice < grabPrice

  let savingsMsg = null
  if (grabPrice !== null && xanhPrice !== null && grabPrice !== xanhPrice) {
    const cheaper = grabCheaper ? 'Grab' : 'Xanh SM'
    const savings = Math.abs(grabPrice - xanhPrice)
    savingsMsg = `${cheaper} saves you ${formatVND(savings)} on this trip.`
  } else if (grabPrice !== null && grabPrice === xanhPrice) {
    savingsMsg = 'Both services offer the same price for this trip.'
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🛺 Vietnam Rideshare Compare</h1>
        <p>Compare <strong>Grab</strong> vs <strong>Xanh SM</strong> prices instantly</p>
      </header>

      <main className="app-main">
        <section className="form-section">
          <div className="form-group">
            <label htmlFor="distance">Trip distance (km)</label>
            <input
              id="distance"
              type="number"
              min="0.1"
              step="0.1"
              placeholder="e.g. 5"
              value={distance}
              onChange={e => setDistance(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Vehicle type</label>
            <div className="vehicle-selector">
              {VEHICLE_TYPES.map(v => (
                <button
                  key={v.id}
                  className={`vehicle-btn ${vehicleType === v.id ? 'vehicle-btn--active' : ''}`}
                  onClick={() => setVehicleType(v.id)}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="cards-section">
          <PriceCard
            service={SERVICES.grab}
            vehicleType={vehicleType}
            distanceKm={distanceKm}
            isCheaper={grabCheaper}
          />
          <PriceCard
            service={SERVICES.xanh}
            vehicleType={vehicleType}
            distanceKm={distanceKm}
            isCheaper={xanhCheaper}
          />
        </section>

        {savingsMsg && (
          <div className="savings-banner">{savingsMsg}</div>
        )}

        <p className="disclaimer">
          * Prices are estimates based on approximate 2024 base rates and may vary
          by time, traffic, and promotions. Always check the app for the exact fare.
        </p>
      </main>
    </div>
  )
}

export default App
