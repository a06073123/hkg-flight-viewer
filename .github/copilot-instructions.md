# HKG Flight Viewer - Copilot Instructions

## Project Overview

A serverless flight information viewer for Hong Kong International Airport (HKIA). Uses **static JSON sharding** for historical data and **Cloudflare Worker proxy** for real-time updates. Deployed on GitHub Pages with no backend.

## Tech Stack

| Layer         | Technology                                            |
| ------------- | ----------------------------------------------------- |
| Frontend      | **SolidJS** (not React!) with fine-grained reactivity |
| UI Components | **Ark UI** (headless, accessible)                     |
| Styling       | **Tailwind CSS v4**                                   |
| Data Fetching | **SolidJS `createResource`** (native async handling)  |
| Build         | **Vite** with TypeScript                              |
| Scripts       | Node.js ES Modules (not CommonJS)                     |
| API Proxy     | **Cloudflare Workers** (CORS bypass, edge caching)    |

## Critical Conventions

### TypeScript: No Enums

The project uses `erasableSyntaxOnly: true`. **Never use `enum`**. Use const objects instead:

```typescript
// ✅ Correct
export const StatusType = {
	Departed: "departed",
	Cancelled: "cancelled",
} as const;
export type StatusType = (typeof StatusType)[keyof typeof StatusType];

// ❌ Wrong - will cause compile errors
export enum StatusType {
	Departed = "departed",
}
```

### SolidJS Patterns

- Use `createSignal`, `createResource`, `createMemo` - NOT React hooks
- JSX requires `jsxImportSource: "solid-js"` (already configured)
- Use `createResource` for data fetching (see https://docs.solidjs.com/guides/fetching-data)
- Use `Suspense` for loading states with async data

```typescript
// ✅ Correct - SolidJS createResource pattern
import { createResource, Suspense, Show } from "solid-js";

const [data] = createResource(source, fetcher);
// data() - accessor to get value
// data.loading - boolean for loading state
// data.error - error if any

<Suspense fallback={<Loading />}>
  <Show when={data()}>{(d) => <Display data={d()} />}</Show>
</Suspense>
```

## Page Structure

| Route         | Page          | Description                        |
| ------------- | ------------- | ---------------------------------- |
| `/`           | LandingPage   | Site introduction, no data loading |
| `/live`       | LivePage      | Real-time flights (API)            |
| `/past`       | PastPage      | Historical data browser (static)   |
| `/flight/:no` | FlightHistory | Per-flight history from index      |
| `/gate/:id`   | GateAnalytics | Per-gate usage from index          |

## Data Architecture

### Static Data Strategy

Historical data is stored in `public/data/` but **NOT included in the build**.
The frontend fetches data directly from GitHub Raw URLs:
```
https://raw.githubusercontent.com/a06073123/hkg-flight-viewer/main/public/data/...
```

This approach:
- Keeps build output small (~1MB instead of 100MB+)
- Data updates via GitHub Actions without rebuilding frontend
- Free CDN caching from GitHub's infrastructure

### Sharding Strategy (public/data/)

```
public/data/
├── daily/YYYY-MM-DD.json     # Full daily snapshot (~1,100 flights)
└── indexes/
    ├── flights/CX888.json    # Last 50 occurrences per flight number
    └── gates/23.json         # Last 50 departures per gate
```

### HKIA API Constraints

- **Valid date range:** D-91 to D+14 from current date
- **Four categories:** Must query all combinations of `arrival=[true,false]` × `cargo=[true,false]`
- **Rate limit:** Add 1-second delay between API calls

## Cloudflare Worker Proxy

The project uses a Cloudflare Worker proxy (`worker/`) to bypass CORS and 403 issues:

| Endpoint        | Cache TTL | Description                                   |
| --------------- | --------- | --------------------------------------------- |
| `/api/flights`  | 1 minute  | Today's flights (all 4 categories combined)   |
| `/api/airlines` | 12 hours  | Airline info (check-in counters, names, etc.) |
| `/api/health`   | -         | Health check                                  |

**Worker URL:** `https://hkg-flight-proxy.lincoln995623.workers.dev`

## Key Files

| File                         | Purpose                                            |
| ---------------------------- | -------------------------------------------------- |
| `src/types/flight.ts`        | All TypeScript interfaces and const enums          |
| `src/lib/parser.ts`          | Raw API → normalized `FlightRecord` transformation |
| `src/lib/resources.ts`       | SolidJS createResource hooks                       |
| `src/lib/api.ts`             | API service layer (fetch functions)                |
| `src/lib/date-utils.ts`      | HKT timezone date utilities                        |
| `worker/src/index.ts`        | Cloudflare Worker proxy                            |
| `scripts/archive-flights.js` | Daily archiver (GitHub Actions)                    |
| `scripts/archive-rolling.js` | Rolling archive for delayed flights                |
| `scripts/reindex-flights.js` | Rebuild indexes from daily snapshots               |
| `docs/API.md`                | Complete HKIA API documentation                    |
| `docs/AIRPORT-LAYOUT.md`     | HKIA terminal & gate layout reference (for M5)     |

## NPM Scripts

```bash
npm run dev          # Start Vite dev server
npm run archive      # Archive today's flight data
npm run archive -- 2026-01-15  # Archive specific date
npm run archive:rolling        # Rolling archive past 6 days (covers +5 day delays)
npm run archive:rolling 7      # Rolling archive past 7 days
npm run reindex:clean # Rebuild all indexes from scratch
npm run analyze      # Run data analysis on collected data

# Archive with Worker proxy (for today's data only)
USE_PROXY=true npm run archive
```

## Archive Strategy: Rolling Re-Archive

Cargo flights can be delayed by up to **+5 days** (based on data analysis). To ensure final departure status is captured:

1. **Daily cron** archives D-1 through D-6 (not just D-1)
2. **Each re-archive** overwrites previous snapshot with updated status
3. **Result**: Even +5 day delays get final "Dep" status instead of stale "Est"

### Day Offset Distribution (from data analysis)

| Offset  | Count  | Description                                                        |
| ------- | ------ | ------------------------------------------------------------------ |
| -1 day  | 0.32%  | Normal early arrivals (midnight flights arriving before scheduled) |
| +1 day  | 2.31%  | Common next-day delays                                             |
| +2 days | 0.17%  | Significant delays                                                 |
| +3 days | 0.05%  | Severe delays                                                      |
| +4 days | 0.01%  | Extreme delays                                                     |
| +5 days | <0.01% | Maximum observed (cargo flights)                                   |

```
Day 1 (01/16): Archives 01/15 → status: "Est at 13:45 (20/01)"
Day 2-5: Re-archives 01/15 → status still "Est"
Day 6 (01/21): Re-archives 01/15 → status: "Dep 13:50 (20/01)" ✅
```

## Flight Data Model

The `flight` array in API responses:

- **First entry** = Operating carrier (actual airline flying the aircraft)
- **Subsequent entries** = Codeshare partners

The `origin`/`destination` arrays:

- **Single entry** = Direct flight
- **Multiple entries** = Via/transit routing (e.g., `["DXB", "BKK"]` = Dubai→Bangkok→HKG)

## Status Patterns

Parse status strings with regex (see `src/lib/parser.ts`):

- `Dep HH:MM` / `Dep HH:MM (DD/MM/YYYY)`
- `At gate HH:MM`
- `Cancelled`, `Delayed`, `Boarding`, `Final Call`, `Gate Closed`

## Testing

Using **Vitest** with **@solidjs/testing-library**. Run tests:

```bash
npm run test          # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage report
```

Test files are co-located with source files using `.test.ts` / `.test.tsx` suffix.

## Component Structure

Feature-based organization with folder structure for larger components:

```
src/components/
├── flights/                    # Feature: Flight display
│   ├── FlightCard/             # Complex component with sub-components
│   │   ├── FlightCard.tsx      # Main component
│   │   ├── FlightCard.test.tsx # Component tests
│   │   ├── FlightStatus.tsx    # Sub-component
│   │   └── index.ts            # Barrel export
│   ├── FlightList/
│   │   ├── FlightList.tsx
│   │   ├── FlightListItem.tsx
│   │   └── index.ts
│   └── index.ts                # Feature barrel export
├── search/                     # Feature: Search functionality
│   ├── SearchBar.tsx           # Simple component (no folder needed)
│   ├── SearchFilters/
│   │   └── ...
│   └── index.ts
├── common/                     # Shared/reusable components
│   ├── Button.tsx
│   ├── Card.tsx
│   └── index.ts
└── index.ts                    # Main barrel export
```

### Component Naming Conventions

- **PascalCase** for component files and folders
- **Barrel exports** (`index.ts`) for clean imports
- **Co-located tests** with `.test.tsx` suffix
- **Sub-components** in same folder, not nested deeper

## GitHub Actions

| Workflow                        | Trigger         | Purpose                 |
| ------------------------------- | --------------- | ----------------------- |
| `.github/workflows/ci.yml`      | PR to main      | Type check, test, build |
| `.github/workflows/deploy.yml`  | Push to main    | Deploy to GitHub Pages  |
| `.github/workflows/archive.yml` | Daily 00:00 HKT | Archive flight data     |

## Current Progress

See `MILESTONE.md` for project status:

- ✅ M1: Data Ingestion & Archiving
- ✅ M2: Domain Logic & Data Parsing
- ✅ M3: Page Structure & Data Fetching
- 🚧 M4: UI/UX Refactor & Performance Optimization (Performance & Mobile)
- ⏳ M5: HKIA Virtual Map & Spatial Visualization (Virtual Map)

## M4 Technical Specifications

### Virtual List Performance Formula

When handling historical data (e.g., 1,125 flights per day), rendering cost:

$$Total\_Nodes = Records \times Nodes\_per\_Record$$

With 20 nodes per record → 20,000+ DOM nodes. Virtual scrolling limits this to:

$$Visible\_Nodes = (Viewport\_Height / Item\_Height) + Buffer$$

### Mobile Breakpoints

| Breakpoint | Width  | Layout          |
| ---------- | ------ | --------------- |
| `xs`       | 480px  | Stacked cards   |
| `sm`       | 640px  | Stacked cards   |
| `md`       | 768px  | Table rows      |
| `lg`       | 1024px | Full table      |

## M5 Technical Specifications

### Gate Marker Data Structure

```typescript
// src/types/map.ts
interface GateMarker {
  id: string;       // "Gate 41"
  x: number;        // SVG coordinate
  y: number;
  currentFlight?: string;
  status: "boarding" | "scheduled" | "idle";
}
```

### Gate Status Colors

| Color  | Status                              |
| ------ | ----------------------------------- |
| 🔵 Blue | Scheduled / Preparing               |
| 🟡 Yellow (blinking) | Boarding / Final Call |
| ⚫ Gray | Idle                                |

