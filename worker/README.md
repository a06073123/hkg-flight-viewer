# HKG Flight Viewer - Cloudflare Worker Proxy

A CORS-enabled proxy for the HKIA Flight Information API, designed to support the HKG Flight Viewer web application hosted on GitHub Pages.

## Why a Worker Proxy?

| Challenge         | Problem                                             | Solution                                  |
| ----------------- | --------------------------------------------------- | ----------------------------------------- |
| **CORS Blocked**  | HKIA API lacks `Access-Control-Allow-Origin` header | Worker adds proper CORS headers           |
| **403 Forbidden** | Direct script requests are rejected                 | Worker simulates browser-like environment |
| **Combined Data** | 4 separate API calls needed                         | Single call returns all categories        |
| **Edge Caching**  | Reduce load on source API                           | 1 minute cache at edge                    |

## API Endpoints

> 💡 **Tip:** Use [`api.http`](./api.http) with [REST Client extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) to test APIs directly in VS Code.

| Endpoint | Description |
| -------- | ----------- |
| `GET /api/flights` | Today's flights (all 4 categories combined) |
| `GET /api/airlines` | Airline info (check-in counters, names, etc.) |
| `GET /api/health` | Health check |
| `GET /api/history/flight/:flightNo` | Flight history (fuzzy match: NH814 → NH 814) |
| `GET /api/history/gate/:gate` | Gate departure history |
| `GET /api/history/date/:date` | All flights for a specific date |
| `GET /api/flight-list` | Unique flight numbers for autocomplete |
| `GET /api/search` | Search by query, airline, or date |
| `GET /api/stats` | D1 database statistics |

## D1 Database Schema

```sql
-- Main flights table
CREATE TABLE flights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    flight_no TEXT NOT NULL,
    airline TEXT NOT NULL,
    origin_dest TEXT,
    status TEXT,
    gate_baggage TEXT,
    terminal TEXT,
    is_arrival INTEGER NOT NULL,
    is_cargo INTEGER NOT NULL,
    codeshares TEXT,
    archived_at TEXT NOT NULL,
    UNIQUE(date, time, flight_no, is_arrival)
);

-- Airline ICAO→IATA mapping (auto-populated from raw flight data)
CREATE TABLE airlines (
    icao_code TEXT PRIMARY KEY,   -- "UPS", "CPA", "ANA"
    iata_code TEXT NOT NULL,      -- "5X", "CX", "NH"
    sample_flight TEXT,           -- "5X 055" (for debugging)
    updated_at TEXT
);
```

The `airlines` table is automatically populated during archival by extracting:
- `icao_code` from raw `flight.airline` field (e.g., "UPS")
- `iata_code` from raw `flight.no` prefix (e.g., "5X" from "5X 055")

## Cache Strategy

| Endpoint        | TTL      | Rationale                                      |
| --------------- | -------- | ---------------------------------------------- |
| `/api/flights`  | 1 minute | Balance between real-time updates and API load |
| `/api/airlines` | 12 hours | Airline data rarely changes                    |

> **Note:** For historical data, use static archives from `/data/daily/*.json`. The flights API only returns current day's data.

## Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Deploy to Cloudflare
npm run deploy

# View live logs
npm run tail
```

## Deployment

1. **Prerequisites:**
    - Cloudflare account
    - Wrangler CLI authenticated: `wrangler login`

2. **Deploy:**

    ```bash
    cd worker
    npm install
    npm run deploy
    ```

3. **Update Frontend (for fork users only):**
   After deployment, update the API URL in `src/lib/api.ts` and `src/lib/airline-data.ts`:
    ```typescript
    const API_BASE_URL = "https://your-worker.your-subdomain.workers.dev/api";
    ```

> **Note:** The main project already uses a pre-configured Worker at `https://hkg-flight-proxy.lincoln995623.workers.dev`. You only need to deploy your own if you're forking the project.

## Environment Variables

Configure in `wrangler.toml` or Cloudflare dashboard:

| Variable        | Description                  |
| --------------- | ---------------------------- |
| (none required) | Currently no env vars needed |

## Rate Limits

Cloudflare Workers Free tier:

- 100,000 requests/day
- 10ms CPU time per request

The caching strategy ensures we stay well within these limits.
