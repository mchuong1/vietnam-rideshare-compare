# GitHub Copilot Instructions

## Token Economy

- **Thinking**: every internal reasoning step must be ≤10 words.
- **No preamble**: never start with "I will now…", "Here's the answer:", "Certainly!", etc.
- **Parallel tools**: batch independent tool calls together; do not run them sequentially.
- **Stop early**: once sufficient context is gathered, act — do not keep researching.
- **Concise replies**: match response depth to task complexity; prefer 1–3 sentences for simple answers.

## Project Context

| Item | Detail |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS v4 (inline classes, no config file) |
| UI primitives | Radix UI (Tabs, Label, Separator, Tooltip) |
| Geocoding | Nominatim (OpenStreetMap), scoped to `countrycodes=vn` |
| Routing | OSRM public API (`router.project-osrm.org`) |

**Services**: Grab (brand color `#00B14F`) and Xanh SM (brand color `#006DB3`).

**Key files**:
- `src/types.ts` — domain types (`VehicleId`, `VehicleRate`, `Service`, `NominatimResult`)
- `src/constants.ts` — all pricing data (`SERVICES`) and shared constants
- `src/utils/pricing.ts` — pure functions: `calcPrice`, `formatVND`
- `src/utils/api.ts` — async fetch wrappers (address search, route distance)
- `src/i18n.ts` — simple `en`/`vi` translation map (no i18n library)
- `src/hooks/` — stateful logic (`useAddressInput`, `useRouteDistance`)
- `src/components/` — thin presentational components (`AddressInput`, `PriceCard`)

## Code Style & Conventions

- **Pure logic** → `src/utils/`; **stateful logic** → `src/hooks/`; **UI** → `src/components/`.
- Use existing types from `src/types.ts`; do not duplicate type definitions.
- New pricing constants belong in `src/constants.ts`, not inline in components.
- Extend `translations` in `src/i18n.ts` for any new user-facing strings; do not add an i18n library.
- Brand colors are hardcoded inline — do not move them to a Tailwind theme.
- Mirror existing patterns before introducing new abstractions.
