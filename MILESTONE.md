## Milestone 1: Data Ingestion & Archiving (Automation) ✅ COMPLETED

**Objective:** Establish a robust pipeline to scrape, shard, and store historical flight data as static JSON.

**Status:** ✅ Complete (2026-01-15)

### Completed Tasks

- [x] **Scraping Script:** `scripts/archive-flights.js` - Fetches all 4 categories (Arrival/Departure × Passenger/Cargo)
- [x] **Re-indexing Script:** `scripts/reindex-flights.js` - Rebuilds indexes from daily snapshots
- [x] **Data Analysis Script:** `scripts/analyze-data.js` - Comprehensive data analysis tool
- [x] **Daily Snapshots:** Saved to `public/data/daily/YYYY-MM-DD.json`
- [x] **Flight Shards:** Indexed at `public/data/indexes/flights/{flightNo}.json` (max 50 entries)
- [x] **Gate Shards:** Indexed at `public/data/indexes/gates/{gateNo}.json` (max 50 entries)
- [x] **TypeScript Interfaces:** `src/types/flight.ts` with all enums and interfaces
- [x] **Parser Utilities:** `src/lib/parser.ts` for data transformation
- [x] **API Documentation:** `docs/API.md` with comprehensive field specs
- [x] **README:** Complete project documentation

### Data Collected

| Metric              | Value                              |
| ------------------- | ---------------------------------- |
| Date Range          | 2025-10-16 to 2026-01-16 (93 days) |
| Total Flights       | 104,732                            |
| Flight Index Shards | 3,849 files                        |
| Gate Index Shards   | 89 files                           |
| Airlines            | 144 unique                         |

### Scripts Added

| Command                         | Description                    |
| ------------------------------- | ------------------------------ |
| `npm run archive`               | Archive today's flight data    |
| `npm run archive -- YYYY-MM-DD` | Archive specific date          |
| `npm run reindex`               | Rebuild indexes from snapshots |
| `npm run reindex:clean`         | Clean and rebuild all indexes  |
| `npm run analyze`               | Run data analysis              |

---

## Milestone 2: Domain Logic & Data Parsing ✅ COMPLETED

**Objective:** Define strictly typed interfaces and parsers to handle the Airport's JSON structure.

**Status:** ✅ Complete (2026-01-16)

### Completed Tasks

- [x] **TypeScript Definitions:** `src/types/flight.ts` with `FlightRecord`, `FlightStatus`, carrier types
- [x] **Const Object Pattern:** No enums (due to `erasableSyntaxOnly`), using const objects with type inference
- [x] **Data Normalizer:** `src/lib/parser.ts` - transforms raw API JSON to normalized `FlightRecord`
- [x] **API Service Layer:** `src/lib/api.ts` - unified interface for static and live data
- [x] **Resource Hooks:** `src/lib/resources.ts` - SolidJS `createResource` hooks for data fetching
- [x] **Unit Tests:** 46 tests passing for parser and component logic
- [x] **Testing Infrastructure:** Vitest + @solidjs/testing-library configured

### Test Coverage

| File                | Tests | Status |
| ------------------- | ----- | ------ |
| `src/lib/parser.ts` | 37    | ✅     |
| `FlightCard.tsx`    | 9     | ✅     |
| **Total**           | 46    | ✅     |

---

## Milestone 3: Page Structure & Data Fetching ✅ COMPLETED

**Objective:** Build complete page structure with both live and historical data access.

**Status:** ✅ Complete (2026-01-16)

### Completed Tasks

- [x] **Page Structure:** 5 pages with routing
    - `/` - Landing page (site introduction, no data fetching)
    - `/live` - Live flights (Departures/Arrivals/Cargo tabs)
    - `/past` - Historical data browser (Date picker + tabs)
    - `/flight/:no` - Flight history & on-time stats
    - `/gate/:id` - Gate usage analytics
- [x] **Data Fetching Migration:** Replaced TanStack Query with SolidJS native `createResource`
- [x] **Component Structure:**
    - `FlightTable` - Sortable flight list
    - `FlightCard` - Individual flight display
    - `SearchBar` - Filter flights by text
    - `Layout` - Navigation with Home/Live/History links
- [x] **Live Data:** Using HKIA API with 5-minute auto-refresh
- [x] **Static Data:** Using `loadDailySnapshot()` for archived data
- [x] **Cargo Integration:** Merged into Live and Past pages as a tab (not separate page)

### Pages Status

| Page           | Data Source  | Tabs                      | Status      |
| -------------- | ------------ | ------------------------- | ----------- |
| Landing        | None         | -                         | ✅ Complete |
| Live           | HKIA API     | Departures/Arrivals/Cargo | ✅ Complete |
| Past           | Static JSON  | Departures/Arrivals/Cargo | ✅ Complete |
| Flight History | Static Index | -                         | ✅ Complete |
| Gate Analytics | Static Index | -                         | ✅ Complete |

---

## Milestone 4: UX Polish & Charts 🚧 IN PROGRESS

**Objective:** Add visualizations, charts, and UI polish.

### Pending Tasks

- [ ] On-time performance charts (delay/cancel rates)
- [ ] Gate usage charts and visualizations
- [ ] Route map visualization
- [ ] Visual diff highlighting for live updates
- [ ] Mobile responsiveness improvements

---

## Milestone 5: Deployment & Production

**Objective:** Finalize and deploy to GitHub Pages.

- **Responsive UI:** Use **Tailwind CSS** to optimize the flight board for airport travelers on mobile devices.
- **Offline Mode:** Implement basic caching using `localStorage` so the last viewed flight list remains visible even if airport Wi-Fi is unstable.
- **Deployment:** Configure GitHub Pages to serve the `dist/` folder via GitHub Actions.
- **DoD:** Project is live at `https://<username>.github.io/<repo>/` with a passing performance score.

---

## Development Notes

### GitHub Actions

| Workflow | Trigger        | Status |
| -------- | -------------- | ------ |
| CI       | PR only        | Active |
| Archive  | Daily + Manual | Active |
| Deploy   | Push to main   | Active |

### TPM Summary of Technical Specs

| Category         | Requirement                                | Source |
| ---------------- | ------------------------------------------ | ------ |
| **API Method**   | REST GET                                   |        |
| **Data Format**  | JSON                                       |        |
| **Query Params** | `date`, `arrival`, `cargo`, `lang`         |        |
| **Status Field** | Includes `StatusCode` and `Status` meaning |        |
