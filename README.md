# HKG Flight Viewer

> 🛫 A high-performance, mobile-optimized flight information viewer for Hong Kong International Airport (HKIA)

[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-blue)](https://github.com)
[![SolidJS](https://img.shields.io/badge/SolidJS-1.9-blue?logo=solid)](https://solidjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1-blue?logo=tailwindcss)](https://tailwindcss.com)

---

## ✨ Features

- **📱 Mobile-First Design** - Optimized for travelers at the airport
- **⚡ Real-time Updates** - Auto-refresh every 5 minutes with visual change indicators
- **📊 Historical Data** - Access up to 91 days of flight history
- **🔍 Smart Search** - Search by flight number, airline, or destination
- **🚪 Gate Analytics** - View flight history for any gate
- **📦 Serverless Architecture** - Deployed on GitHub Pages, no backend required

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Actions                            │
│                    (Daily CRON at 00:30 HKT)                    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    archive-flights.js                            │
│                                                                 │
│  1. Fetch from HKIA API (4 categories)                          │
│  2. Save daily snapshot                                         │
│  3. Update flight index shards                                  │
│  4. Update gate index shards                                    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     public/data/                                 │
│                                                                 │
│  ├── daily/                                                     │
│  │   ├── 2025-10-16.json    ← Full daily snapshot               │
│  │   ├── 2025-10-17.json                                        │
│  │   └── ...                                                    │
│  │                                                              │
│  └── indexes/                                                   │
│      ├── flights/                                               │
│      │   ├── CX888.json     ← Last 50 occurrences of CX888     │
│      │   └── ...                                                │
│      └── gates/                                                 │
│          ├── 23.json        ← Last 50 flights from Gate 23     │
│          └── ...                                                │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SolidJS Frontend                              │
│                                                                 │
│  • Real-time: TanStack Solid Query → HKIA API                   │
│  • Historical: Static fetch → /data/indexes/*.json              │
│  • UI: Ark UI (Headless) + Tailwind CSS                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/hkg-flight-viewer.git
cd hkg-flight-viewer

# Install dependencies
npm install

# Start development server
npm run dev
```

### Data Archiving

```bash
# Archive today's flight data
npm run archive

# Archive a specific date
npm run archive -- 2026-01-15

# Rebuild all indexes from daily snapshots
npm run reindex

# Clean rebuild (removes existing indexes first)
npm run reindex:clean

# Analyze all collected data
npm run analyze
```

---

## 📁 Project Structure

```
hkg-flight-viewer/
├── scripts/
│   ├── archive-flights.js    # Daily data archiver (GitHub Actions)
│   ├── reindex-flights.js    # Rebuild indexes from snapshots
│   └── analyze-data.js       # Data analysis tool
│
├── public/
│   └── data/
│       ├── daily/            # Full daily snapshots
│       │   └── YYYY-MM-DD.json
│       └── indexes/
│           ├── flights/      # Per-flight history (max 50 entries)
│           │   └── {flightNo}.json
│           └── gates/        # Per-gate history (max 50 entries)
│               └── {gateNo}.json
│
├── src/
│   ├── types/
│   │   └── flight.ts         # TypeScript interfaces & enums
│   ├── lib/
│   │   └── parser.ts         # Data parsing utilities
│   ├── api/                  # TanStack Solid Query hooks
│   ├── components/           # UI components (Ark UI + Tailwind)
│   ├── App.tsx               # Main application
│   └── index.tsx             # Entry point
│
├── docs/
│   ├── API.md                # HKIA API documentation
│   └── data-analysis.json    # Analysis results
│
└── MILESTONE.md              # Project milestones
```

---

## 🛠️ Tech Stack

| Category          | Technology                                                          |
| ----------------- | ------------------------------------------------------------------- |
| **Framework**     | [SolidJS](https://solidjs.com) - Fine-grained reactivity            |
| **Build Tool**    | [Vite](https://vite.dev) - Fast HMR & builds                        |
| **UI Components** | [Ark UI](https://ark-ui.com) - Headless, accessible                 |
| **Styling**       | [Tailwind CSS](https://tailwindcss.com) - Utility-first             |
| **Data Fetching** | [TanStack Solid Query](https://tanstack.com/query) - Caching & sync |
| **Icons**         | [Lucide](https://lucide.dev) - Beautiful icons                      |
| **Language**      | [TypeScript](https://typescriptlang.org) - Type safety              |

---

## 📊 Data Statistics

Based on analysis of 93 days (2025-10-16 to 2026-01-16):

| Metric            | Value          |
| ----------------- | -------------- |
| **Total Flights** | 104,732        |
| **Daily Average** | ~1,126 flights |
| **Arrivals**      | 52,107 (49.8%) |
| **Departures**    | 52,625 (50.2%) |
| **Passenger**     | 80,264 (76.6%) |
| **Cargo**         | 24,468 (23.4%) |
| **Airlines**      | 144 unique     |

### Top Airlines

| Rank | Airline                 | Flights |
| ---- | ----------------------- | ------- |
| 1    | Cathay Pacific (CX)     | 49,895  |
| 2    | HK Express (UO)         | 11,904  |
| 3    | Hong Kong Airlines (HX) | 10,806  |
| 4    | Qatar Airways (QR)      | 9,955   |
| 5    | Finnair (AY)            | 7,181   |

---

## 📖 API Documentation

See [docs/API.md](docs/API.md) for comprehensive HKIA API documentation including:

- API endpoints and parameters
- Response structure
- Field specifications (codeshare, via routing, status codes)
- Data patterns analysis
- Error handling

### Key API Constraints

| Constraint     | Value                                   |
| -------------- | --------------------------------------- |
| **Date Range** | D-91 to D+14 from current date          |
| **Categories** | 4 (Arrival/Departure × Passenger/Cargo) |
| **Rate Limit** | Recommended 1 req/sec                   |

---

## 🔄 GitHub Actions Workflow

The project includes automated daily data archiving:

```yaml
# .github/workflows/archive.yml
name: Daily Flight Archive
on:
    schedule:
        - cron: "30 16 * * *" # 00:30 HKT (16:30 UTC)
    workflow_dispatch:

jobs:
    archive:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-node@v4
            - run: npm ci
            - run: npm run archive
            - uses: stefanzweifel/git-auto-commit-action@v5
              with:
                  commit_message: "chore: archive flight data for $(date -u +%Y-%m-%d)"
```

---

## 📜 Available Scripts

| Command                         | Description                          |
| ------------------------------- | ------------------------------------ |
| `npm run dev`                   | Start development server             |
| `npm run build`                 | Build for production                 |
| `npm run preview`               | Preview production build             |
| `npm run archive`               | Archive today's flight data          |
| `npm run archive -- YYYY-MM-DD` | Archive specific date                |
| `npm run reindex`               | Rebuild indexes from daily snapshots |
| `npm run reindex:clean`         | Clean and rebuild all indexes        |
| `npm run analyze`               | Run comprehensive data analysis      |

---

## 🎯 Milestones

See [MILESTONE.md](MILESTONE.md) for detailed project roadmap.

| Milestone | Status         | Description                 |
| --------- | -------------- | --------------------------- |
| M1        | ✅ Complete    | Data Ingestion & Archiving  |
| M2        | 🚧 In Progress | Domain Logic & Data Parsing |
| M3        | ⏳ Planned     | Real-time Dashboard         |
| M4        | ⏳ Planned     | Historical Search           |
| M5        | ⏳ Planned     | UX Polish & Deployment      |

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [Hong Kong International Airport](https://www.hongkongairport.com) for the public flight data API
- [SolidJS](https://solidjs.com) community for the excellent framework
- [Ark UI](https://ark-ui.com) for accessible headless components

---

<p align="center">
  Made with ❤️ for travelers at HKG
</p>
