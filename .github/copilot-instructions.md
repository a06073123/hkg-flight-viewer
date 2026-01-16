# HKG Flight Viewer - Copilot Instructions

## Project Overview

A serverless flight information viewer for Hong Kong International Airport (HKIA). Uses **static JSON sharding** for historical data and direct API calls for real-time updates. Deployed on GitHub Pages with no backend.

## Tech Stack

| Layer         | Technology                                            |
| ------------- | ----------------------------------------------------- |
| Frontend      | **SolidJS** (not React!) with fine-grained reactivity |
| UI Components | **Ark UI** (headless, accessible)                     |
| Styling       | **Tailwind CSS v4**                                   |
| Data Fetching | **SolidJS `createResource`** (native async handling)  |
| Build         | **Vite** with TypeScript                              |
| Scripts       | Node.js ES Modules (not CommonJS)                     |

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

## Key Files

| File                         | Purpose                                            |
| ---------------------------- | -------------------------------------------------- |
| `src/types/flight.ts`        | All TypeScript interfaces and const enums          |
| `src/lib/parser.ts`          | Raw API → normalized `FlightRecord` transformation |
| `src/lib/resources.ts`       | SolidJS createResource hooks                       |
| `src/lib/api.ts`             | API service layer (fetch functions)                |
| `scripts/archive-flights.js` | Daily archiver (GitHub Actions)                    |
| `scripts/reindex-flights.js` | Rebuild indexes from daily snapshots               |
| `docs/API.md`                | Complete HKIA API documentation                    |

## NPM Scripts

```bash
npm run dev          # Start Vite dev server
npm run archive      # Archive today's flight data
npm run archive -- 2026-01-15  # Archive specific date
npm run reindex:clean # Rebuild all indexes from scratch
npm run analyze      # Run data analysis on collected data
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
- 🚧 M4: UX Polish & Charts
- ⏳ M5: Deployment & Production
