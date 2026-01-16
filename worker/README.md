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

### `GET /api/flights`

Fetch **today's** flight data (Hong Kong timezone). Returns all 4 categories combined:

- Arrivals (Passenger + Cargo)
- Departures (Passenger + Cargo)

**No parameters required** - automatically uses current HK date.

**Response:**

```json
{
  "date": "2026-01-16",
  "generated": "2026-01-16T09:26:47.000Z",
  "count": 1149,
  "flights": [...]
}
```

**Example:**

```bash
curl "https://hkg-flight-proxy.lincoln995623.workers.dev/api/flights"
```

### `GET /api/airlines`

Fetch airline information (check-in counters, names, ground handling agents, etc.).

**No parameters required.**

**Response:**

```json
{
  "airline": {
    "CPA": {
      "icao-3": "CPA",
      "iata-2": "CX",
      "name": "Cathay Pacific",
      "all-names": ["Cathay Pacific", "國泰航空", "国泰航空"],
      "terminal": "T1",
      "aisle": ["A", "B", "C", "D"],
      ...
    },
    ...
  },
  "ground-handling-agent": { ... }
}
```

**Example:**

```bash
curl "https://hkg-flight-proxy.lincoln995623.workers.dev/api/airlines"
```

### `GET /api/health`

Health check endpoint.

**Response:**

```json
{
	"status": "ok",
	"timestamp": "2026-01-16T12:00:00.000Z",
	"hkTime": "2026-01-16"
}
```

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

3. **Update Frontend:**
   After deployment, update `.env.production` with your Worker URL:
    ```bash
    VITE_API_PROXY_URL=https://hkg-flight-proxy.lincoln995623.workers.dev/api
    ```

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
