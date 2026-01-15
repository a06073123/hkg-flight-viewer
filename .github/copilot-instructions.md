# HKG Flight Viewer - Copilot Instructions

## Project Overview

A serverless flight information viewer for Hong Kong International Airport (HKIA). Uses **static JSON sharding** for historical data and direct API calls for real-time updates. Deployed on GitHub Pages with no backend.

## Tech Stack

| Layer         | Technology                                            |
| ------------- | ----------------------------------------------------- |
| Frontend      | **SolidJS** (not React!) with fine-grained reactivity |
| UI Components | **Ark UI** (headless, accessible)                     |
| Styling       | **Tailwind CSS v4**                                   |
| Data Fetching | **TanStack Solid Query**                              |
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

- Use `createSignal`, `createResource`, not React hooks
- JSX requires `jsxImportSource: "solid-js"` (already configured)
- Prefer `@tanstack/solid-query` for data fetching

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

## Current Progress

See `MILESTONE.md` for project status:

- ✅ M1: Data Ingestion & Archiving
- 🚧 M2: Domain Logic & Data Parsing
- ⏳ M3-M5: Frontend development
