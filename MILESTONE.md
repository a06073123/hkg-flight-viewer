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

## Milestone 2: Domain Logic & Data Parsing 🚧 IN PROGRESS

**Objective:** Define strictly typed interfaces and parsers to handle the Airport's JSON structure.

- **TypeScript Definitions:** Define `FlightRecord` interfaces in `src/types/` based on official item descriptions (Origin, Baggage, Hall, Terminal, Stand, Time, Status).
- **Data Normalizer:** Create a utility to unify different flight types (Passenger/Cargo) into a consistent UI-friendly object.
- **Diffing Engine:** Build a comparison utility that identifies changes in `Status`, `Gate`, or `Time` between two data snapshots.
- **DoD:** A suite of unit tests verifying that raw JSON strings are correctly transformed into valid JS/TS objects.

---

## Milestone 3: Real-time Dashboard (Core Frontend)

**Objective:** Develop the main flight board with live updates and Ark UI components.

- **Ark UI Implementation:** Build the "Arrivals/Departures" switch using the **Ark UI Tabs** component for accessible, unstyled interaction.
- **Real-time Fetching:** Integrate **TanStack Solid Query** to query the live API every 5 minutes using `refetchInterval`.
- **Visual Highlights:** Use SolidJS's fine-grained reactivity to trigger Tailwind animations (e.g., `animate-pulse`) only on specific cells when the Diffing Engine detects a change (e.g., a status change from "Scheduled" to "Delayed").
- **DoD:** A functional dashboard showing today's flights with automatic background refreshing.

---

## Milestone 4: Historical Search & Static Indexing Integration

**Objective:** Enable deep history lookup without a backend database.

- **Search Interface:** Implement a high-performance search bar using **Ark UI Combobox** or standard inputs.
- **On-Demand Index Loading:** When a user searches for "CX406", the app fetches `/data/indexes/flights/CX406.json` directly from GitHub Pages.
- **Gate Analysis View:** Allow users to view the last 30 flights that used a specific gate (e.g., Gate 44) by loading the gate shard.
- **DoD:** Users can instantly view the history of any flight number or gate recorded in the system.

---

## Milestone 5: UX Polish & Deployment

**Objective:** Finalize the mobile-first experience and deploy to GitHub Pages.

- **Responsive UI:** Use **Tailwind CSS** to optimize the flight board for airport travelers on mobile devices.
- **Offline Mode:** Implement basic caching using `localStorage` so the last viewed flight list remains visible even if airport Wi-Fi is unstable.
- **Deployment:** Configure GitHub Pages to serve the `dist/` folder via GitHub Actions.
- **DoD:** Project is live at `https://<username>.github.io/<repo>/` with a passing performance score.

---

### TPM Summary of Technical Specs

| Category         | Requirement                                | Source |
| ---------------- | ------------------------------------------ | ------ |
| **API Method**   | REST GET                                   |        |
| **Data Format**  | JSON                                       |        |
| **Query Params** | `date`, `arrival`, `cargo`, `lang`         |        |
| **Status Field** | Includes `StatusCode` and `Status` meaning |        |
