# Cloudflare D1 Migration Plan

## Overview

This document outlines the migration plan from the current Git-based storage (JSON files in repository) to Cloudflare D1 (SQLite at the edge). This migration addresses two critical scalability issues:

1. **Repository Bloat**: Daily commits of JSON files cause `.git` folder to grow indefinitely
2. **Query Flexibility**: SQL provides better querying capabilities than file-based sharding

## Current Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  GitHub Actions │────▶│   GitHub Repo    │────▶│  GitHub Pages   │
│  (Cron Archive) │     │  (JSON Storage)  │     │  (Static Host)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │
                                ▼ (Raw URLs)
┌─────────────────┐     ┌──────────────────┐
│    Frontend     │────▶│  CF Worker Proxy │
│   (SolidJS)     │     │  (Live API Only) │
└─────────────────┘     └──────────────────┘
```

### Pain Points

| Issue | Impact | Severity |
|-------|--------|----------|
| `.git` grows ~1MB/day | Clone time increases, storage limits | Medium |
| GitHub API rate limit | 60 req/hour (unauthenticated) | **High** |
| Manual index maintenance | Schema changes require full rebuild | Low |
| No complex queries | Can't search by date range + airline | Medium |

## Proposed Architecture (D1)

```
┌─────────────────┐     ┌──────────────────┐
│  CF Worker      │────▶│   Cloudflare D1  │
│  (Cron Trigger) │     │   (SQLite Edge)  │
└─────────────────┘     └──────────────────┘
         │                       │
         │                       ▼
         │              ┌──────────────────┐
         └─────────────▶│  CF Worker API   │
                        │ (Query Endpoint) │
                        └──────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │    Frontend      │
                        │   (SolidJS)      │
                        └──────────────────┘
```

## Database Schema

### Core Tables

```sql
-- Main flights table with denormalized structure for query performance
CREATE TABLE flights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,                    -- YYYY-MM-DD
    time TEXT NOT NULL,                    -- HH:MM
    flight_no TEXT NOT NULL,               -- Primary flight number (e.g., "CX888")
    airline TEXT NOT NULL,                 -- Airline code (e.g., "CX")
    origin_dest TEXT,                      -- Airport code(s)
    status TEXT,                           -- Current status
    gate_baggage TEXT,                     -- Gate (departure) or Baggage (arrival)
    terminal TEXT,                         -- Terminal number
    is_arrival INTEGER NOT NULL,           -- 0 = departure, 1 = arrival
    is_cargo INTEGER NOT NULL,             -- 0 = passenger, 1 = cargo
    codeshares TEXT,                       -- JSON array of codeshare flight numbers
    raw_data TEXT,                         -- Full JSON for additional fields
    archived_at TEXT NOT NULL,             -- When this record was archived
    
    UNIQUE(date, time, flight_no, is_arrival)
);

-- Indexes for common queries
CREATE INDEX idx_flights_date ON flights(date);
CREATE INDEX idx_flights_flight_no ON flights(flight_no);
CREATE INDEX idx_flights_airline ON flights(airline);
CREATE INDEX idx_flights_gate ON flights(gate_baggage) WHERE is_arrival = 0;
CREATE INDEX idx_flights_date_time ON flights(date, time);

-- Gate usage view for analytics
CREATE VIEW gate_departures AS
SELECT 
    gate_baggage as gate,
    date,
    time,
    flight_no,
    airline,
    origin_dest,
    status
FROM flights 
WHERE is_arrival = 0 AND gate_baggage IS NOT NULL AND gate_baggage != '';

-- Flight history view
CREATE VIEW flight_history AS
SELECT 
    flight_no,
    date,
    time,
    origin_dest,
    status,
    gate_baggage,
    terminal,
    is_arrival,
    is_cargo
FROM flights
ORDER BY date DESC, time DESC;
```

### Migration Data Model

```typescript
// worker/src/types.ts
interface D1FlightRecord {
    id: number;
    date: string;
    time: string;
    flight_no: string;
    airline: string;
    origin_dest: string | null;
    status: string | null;
    gate_baggage: string | null;
    terminal: string | null;
    is_arrival: number;  // SQLite boolean
    is_cargo: number;
    codeshares: string | null;  // JSON string
    raw_data: string;  // Full JSON
    archived_at: string;
}
```

## Worker API Endpoints

### New Endpoints for D1

```typescript
// worker/src/index.ts additions

// GET /api/history/flight/:flightNo
// Returns last 50 occurrences of a flight
// Replaces: static indexes/flights/{flightNo}.json

// GET /api/history/gate/:gate
// Returns last 50 departures from a gate
// Replaces: static indexes/gates/{gate}.json

// GET /api/history/daily/:date
// Returns all flights for a specific date
// Replaces: static daily/{date}.json

// GET /api/search
// Query params: q, airline, date_from, date_to, type
// New capability: complex queries not possible with JSON files
```

### Example Implementation

```typescript
// Example: Flight history endpoint
async function handleFlightHistory(
    flightNo: string,
    env: Env
): Promise<Response> {
    const result = await env.DB.prepare(`
        SELECT * FROM flights 
        WHERE flight_no = ?
        ORDER BY date DESC, time DESC
        LIMIT 50
    `).bind(flightNo).all();
    
    return jsonResponse({
        flightNo,
        count: result.results.length,
        occurrences: result.results.map(transformToFlightRecord),
    });
}

// Example: Search endpoint (new capability)
async function handleSearch(
    request: Request,
    env: Env
): Promise<Response> {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    const airline = url.searchParams.get('airline');
    const dateFrom = url.searchParams.get('date_from');
    const dateTo = url.searchParams.get('date_to');
    
    let sql = 'SELECT * FROM flights WHERE 1=1';
    const params: string[] = [];
    
    if (query) {
        sql += ' AND flight_no LIKE ?';
        params.push(`%${query}%`);
    }
    if (airline) {
        sql += ' AND airline = ?';
        params.push(airline);
    }
    if (dateFrom) {
        sql += ' AND date >= ?';
        params.push(dateFrom);
    }
    if (dateTo) {
        sql += ' AND date <= ?';
        params.push(dateTo);
    }
    
    sql += ' ORDER BY date DESC, time DESC LIMIT 100';
    
    const stmt = env.DB.prepare(sql);
    const result = await stmt.bind(...params).all();
    
    return jsonResponse({
        count: result.results.length,
        flights: result.results.map(transformToFlightRecord),
    });
}
```

## Wrangler Configuration

```toml
# worker/wrangler.toml additions

[[d1_databases]]
binding = "DB"
database_name = "hkg-flights"
database_id = "<your-database-id>"

# Cron trigger for daily archiving (replaces GitHub Actions)
[triggers]
crons = ["0 16 * * *"]  # 00:00 HKT (UTC+8) = 16:00 UTC previous day
```

## Migration Steps

### Phase 1: Setup (Low Risk)

1. **Create D1 Database**
   ```bash
   wrangler d1 create hkg-flights
   ```

2. **Apply Schema**
   ```bash
   wrangler d1 execute hkg-flights --file=./schema.sql
   ```

3. **Add D1 Binding to Worker**
   Update `wrangler.toml` with database binding

### Phase 2: Parallel Run (Medium Risk)

1. **Modify Archive Script**
   - Keep existing JSON file generation
   - Add D1 insertion in parallel
   - Compare results for validation

2. **Backfill Historical Data**
   ```bash
   node scripts/migrate-to-d1.js
   ```

3. **Add New API Endpoints**
   - `/api/v2/history/flight/:no`
   - `/api/v2/history/gate/:id`
   - Keep v1 endpoints unchanged

### Phase 3: Cutover (Requires Coordination)

1. **Update Frontend**
   - Switch from static JSON to Worker API
   - Update `src/lib/api.ts`

2. **Migrate Cron to Worker**
   - Enable Cron Triggers in `wrangler.toml`
   - Disable GitHub Actions archive workflow

3. **Deprecate JSON Files**
   - Stop committing daily JSON files
   - Keep historical files for backup

### Phase 4: Cleanup

1. **Remove JSON File Dependencies**
   - Delete archive scripts
   - Remove static file fetching from frontend

2. **Optimize Repo**
   ```bash
   git filter-branch --index-filter 'git rm -rf --cached --ignore-unmatch public/data/daily' HEAD
   git gc --prune=now --aggressive
   ```

## Cost Analysis

### Cloudflare D1 Free Tier

| Resource | Free Limit | Estimated Usage | Status |
|----------|------------|-----------------|--------|
| Storage | 5 GB | ~100 MB/year | ✅ |
| Reads | 5M rows/day | ~10K rows/day | ✅ |
| Writes | 100K rows/day | ~1.5K rows/day | ✅ |

**Conclusion**: Free tier is more than sufficient for this application.

### Comparison

| Aspect | Current (Git) | D1 |
|--------|---------------|-----|
| Storage Cost | Free (GitHub) | Free (D1 Free Tier) |
| Query Speed | Fast (CDN) | Fast (Edge) |
| Query Flexibility | Limited | Full SQL |
| Maintenance | High (Prune History) | None |
| Rate Limits | 60 req/hr (GitHub API) | None |

## Rollback Plan

If issues arise during migration:

1. **Immediate**: Revert frontend to use static JSON files
2. **Short-term**: Re-enable GitHub Actions archive workflow
3. **Long-term**: Keep JSON file generation as backup for 30 days

## Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Setup | 1 day | None |
| Phase 2: Parallel | 1 week | Validation |
| Phase 3: Cutover | 1 day | Phase 2 complete |
| Phase 4: Cleanup | 1 week | Stability confirmed |

**Total Estimated Time**: 2-3 weeks

## Next Steps

1. [ ] Create D1 database in Cloudflare Dashboard
2. [ ] Apply schema and test with sample data
3. [ ] Implement migration script (`scripts/migrate-to-d1.js`)
4. [ ] Add v2 API endpoints to Worker
5. [ ] Test parallel run for 1 week
6. [ ] Coordinate frontend cutover
