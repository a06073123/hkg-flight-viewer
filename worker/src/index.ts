/**
 * HKG Flight Viewer - Cloudflare Worker Proxy
 *
 * This Worker acts as a CORS-enabled proxy for the HKIA Flight Information API.
 * It fetches all 4 categories (arrival/departure × passenger/cargo) and combines
 * them into a single response matching the daily archive format.
 *
 * Technical Justifications:
 * 1. CORS Bypass: HKIA API doesn't provide Access-Control-Allow-Origin header
 * 2. 403 Prevention: Simulates browser-like environment with proper headers
 * 3. Combined Response: Single request for all flight data
 * 4. Edge Caching: 1 minute cache for real-time data
 */

export interface Env {
	// D1 Database binding for historical flight data
	DB: D1Database;
}

// HKIA API Configuration
const HKIA_API_BASE = "https://www.hongkongairport.com/flightinfo-rest/rest";
const HKIA_AIRLINES_URL =
	"https://www.hongkongairport.com/iwov-resources/custom/json/airline_en.json";

// Cache TTL (in seconds)
const CACHE_TTL = {
	FLIGHTS: 60, // 1 minute for live flight data
	FLIGHTS_SWR: 3600, // 1 hour stale-while-revalidate window
	AIRLINES: 12 * 60 * 60, // 12 hours for airline data (rarely changes)
	AIRLINES_SWR: 24 * 60 * 60, // 24 hours stale-while-revalidate for airlines
};

// Hong Kong timezone
const HK_TIMEZONE = "Asia/Hong_Kong";

// CORS headers
const CORS_HEADERS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
	"Access-Control-Max-Age": "86400",
};

// Flight categories to fetch
const FLIGHT_CATEGORIES = [
	{ arrival: true, cargo: false, label: "Arrival-Passenger" },
	{ arrival: true, cargo: true, label: "Arrival-Cargo" },
	{ arrival: false, cargo: false, label: "Departure-Passenger" },
	{ arrival: false, cargo: true, label: "Departure-Cargo" },
] as const;

/**
 * Flight record matching daily archive format
 */
interface FlightRecord {
	date: string;
	time: string;
	flight: Array<{ no: string; airline: string }>;
	origin_dest: string;
	status: string;
	gate_baggage: string;
	terminal: string;
	isArrival: boolean;
	isCargo: boolean;
	_raw: {
		aisle: string;
		hall: string;
	};
}

/**
 * Main request handler
 */
export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		// Handle CORS preflight
		if (request.method === "OPTIONS") {
			return new Response(null, { headers: CORS_HEADERS });
		}

		// Only allow GET requests
		if (request.method !== "GET") {
			return jsonError("Method not allowed", 405);
		}

		const url = new URL(request.url);
		const path = url.pathname;

		// Route handlers
		if (path === "/api/flights") {
			return handleFlightsRequest(request, ctx);
		}

		if (path === "/api/airlines") {
			return handleAirlinesRequest(request, ctx);
		}

		// D1 History API endpoints
		if (path.startsWith("/api/history/flight/")) {
			const flightNo = decodeURIComponent(path.replace("/api/history/flight/", "")).toUpperCase();
			return handleFlightHistoryRequest(env, flightNo, url);
		}

		if (path.startsWith("/api/history/gate/")) {
			const gate = decodeURIComponent(path.replace("/api/history/gate/", ""));
			return handleGateHistoryRequest(env, gate, url);
		}

		if (path.startsWith("/api/history/date/")) {
			const date = path.replace("/api/history/date/", "");
			return handleDateHistoryRequest(env, date);
		}

		if (path === "/api/search") {
			return handleSearchRequest(env, url);
		}

		if (path === "/api/flight-list") {
			return handleFlightListRequest(env, ctx);
		}

		if (path === "/api/stats") {
			return handleStatsRequest(env);
		}

		if (path === "/api/health") {
			return jsonResponse({
				status: "ok",
				timestamp: new Date().toISOString(),
				hkTime: getHKDateString(),
			});
		}

		if (path === "/") {
			return jsonResponse({
				name: "HKG Flight Viewer API Proxy",
				version: "3.2.0",
				endpoints: {
					"/api/flights":
						"Fetch today's flight data (HK time, all categories combined)",
					"/api/airlines":
						"Fetch airline information (check-in counters, names, etc.)",
					"/api/history/flight/:flightNo":
						"Get flight history from D1. Supports fuzzy matching: NH814, nh 814, or ANA814 all find 'NH 814'",
					"/api/history/gate/:gate":
						"Get gate departure history from D1 (e.g., /api/history/gate/23)",
					"/api/history/date/:date":
						"Get all flights for a specific date (e.g., /api/history/date/2025-12-01)",
					"/api/search":
						"Search flights by query parameters (?q=term&limit=50)",
					"/api/flight-list":
						"Get all unique flight numbers for autocomplete (1hr cache)",
					"/api/stats": "Get database statistics",
					"/api/health": "Health check endpoint",
				},
				note: "All historical data is powered by Cloudflare D1.",
			});
		}

		return jsonError("Not found", 404);
	},
};

/**
 * Get current date in Hong Kong timezone as YYYY-MM-DD
 */
function getHKDateString(): string {
	return new Date().toLocaleDateString("sv-SE", { timeZone: HK_TIMEZONE });
}

/**
 * Handle flight data requests - returns today's combined data only
 */
async function handleFlightsRequest(
	request: Request,
	ctx: ExecutionContext,
): Promise<Response> {
	const todayHK = getHKDateString();

	// Create a unique cache key for today's combined data
	const cacheKey = new Request(
		`https://hkg-flight-cache/combined/${todayHK}`,
		{ method: "GET" },
	);
	const cache = caches.default;

	// Check cache first
	let response = await cache.match(cacheKey);

	if (response) {
		// Return cached response with cache indicator
		// CORS headers already present from when response was cached
		const headers = new Headers(response.headers);
		headers.set("X-Cache", "HIT");
		return new Response(response.body, {
			status: response.status,
			headers,
		});
	}

	// Fetch all 4 categories in parallel
	try {
		const allFlights = await fetchAllCategories(todayHK);

		// Create response
		const responseData = {
			date: todayHK,
			generated: new Date().toISOString(),
			count: allFlights.length,
			flights: allFlights,
		};

		response = new Response(JSON.stringify(responseData), {
			headers: {
				"Content-Type": "application/json",
				// stale-while-revalidate: Users get stale cache instantly while Worker fetches fresh data in background
				"Cache-Control": `public, max-age=${CACHE_TTL.FLIGHTS}, stale-while-revalidate=${CACHE_TTL.FLIGHTS_SWR}`,
				...CORS_HEADERS,
				"X-Cache": "MISS",
			},
		});

		// Store in cache (non-blocking)
		ctx.waitUntil(cache.put(cacheKey, response.clone()));

		return response;
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Unknown error";
		return jsonError(`Failed to fetch flight data: ${message}`, 502);
	}
}

/**
 * Handle airline data requests - returns airline information with 12h cache
 */
async function handleAirlinesRequest(
	request: Request,
	ctx: ExecutionContext,
): Promise<Response> {
	// Create a unique cache key for airline data
	const cacheKey = new Request("https://hkg-flight-cache/airlines", {
		method: "GET",
	});
	const cache = caches.default;

	// Check cache first
	let response = await cache.match(cacheKey);

	if (response) {
		// Return cached response with cache indicator
		// CORS headers already present from when response was cached
		const headers = new Headers(response.headers);
		headers.set("X-Cache", "HIT");
		return new Response(response.body, {
			status: response.status,
			headers,
		});
	}

	// Fetch from HKIA
	try {
		const apiResponse = await fetch(HKIA_AIRLINES_URL, {
			method: "GET",
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
				Accept: "application/json",
				"Accept-Language": "en-US,en;q=0.9",
				Referer: "https://www.hongkongairport.com/",
			},
		});

		if (!apiResponse.ok) {
			throw new Error(`HKIA API returned ${apiResponse.status}`);
		}

		const data = await apiResponse.json();

		response = new Response(JSON.stringify(data), {
			headers: {
				"Content-Type": "application/json",
				// stale-while-revalidate: Return stale data instantly, refresh in background
				"Cache-Control": `public, max-age=${CACHE_TTL.AIRLINES}, stale-while-revalidate=${CACHE_TTL.AIRLINES_SWR}`,
				...CORS_HEADERS,
				"X-Cache": "MISS",
			},
		});

		// Store in cache (non-blocking)
		ctx.waitUntil(cache.put(cacheKey, response.clone()));

		return response;
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Unknown error";
		return jsonError(`Failed to fetch airline data: ${message}`, 502);
	}
}

/**
 * Fetch all 4 flight categories and combine them
 */
async function fetchAllCategories(date: string): Promise<FlightRecord[]> {
	const fetchPromises = FLIGHT_CATEGORIES.map((cat) =>
		fetchFlightCategory(date, cat.arrival, cat.cargo),
	);

	const results = await Promise.all(fetchPromises);

	// Combine all flights
	const allFlights: FlightRecord[] = [];
	for (let i = 0; i < FLIGHT_CATEGORIES.length; i++) {
		const category = FLIGHT_CATEGORIES[i];
		const flights = extractFlights(
			results[i],
			category.arrival,
			category.cargo,
		);
		allFlights.push(...flights);
	}

	return allFlights;
}

/**
 * Fetch a single flight category from HKIA API
 */
async function fetchFlightCategory(
	date: string,
	arrival: boolean,
	cargo: boolean,
): Promise<unknown> {
	const apiUrl = new URL(`${HKIA_API_BASE}/flights/past`);
	apiUrl.searchParams.set("date", date);
	apiUrl.searchParams.set("lang", "en");
	apiUrl.searchParams.set("arrival", String(arrival));
	apiUrl.searchParams.set("cargo", String(cargo));

	const response = await fetch(apiUrl.toString(), {
		method: "GET",
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			Accept: "application/json",
			"Accept-Language": "en-US,en;q=0.9",
			Referer: "https://www.hongkongairport.com/",
			Origin: "https://www.hongkongairport.com",
		},
	});

	if (!response.ok) {
		throw new Error(`HKIA API returned ${response.status}`);
	}

	return response.json();
}

/**
 * Extract flights from API response (matches archive-flights.js logic)
 */
function extractFlights(
	apiResponse: unknown,
	isArrival: boolean,
	isCargo: boolean,
): FlightRecord[] {
	const flights: FlightRecord[] = [];

	if (!apiResponse || !Array.isArray(apiResponse)) {
		return flights;
	}

	for (const dateGroup of apiResponse) {
		const date = dateGroup.date;
		const flightList = dateGroup.list || [];

		for (const flight of flightList) {
			const flightNos = (flight.flight || []).map(
				(f: { no: string; airline: string }) => ({
					no: f.no,
					airline: f.airline,
				}),
			);

			const record: FlightRecord = {
				date: date,
				time: flight.time || "",
				flight: flightNos,
				origin_dest: isArrival
					? flight.origin || ""
					: flight.destination || "",
				status: flight.status || "",
				gate_baggage: isArrival
					? flight.baggage || ""
					: flight.gate || "",
				terminal: flight.terminal || "",
				isArrival: isArrival,
				isCargo: isCargo,
				_raw: {
					aisle: flight.aisle || "",
					hall: flight.hall || "",
				},
			};

			flights.push(record);
		}
	}

	return flights;
}

/**
 * Create JSON response with CORS headers
 */
function jsonResponse(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			"Content-Type": "application/json",
			...CORS_HEADERS,
		},
	});
}

/**
 * Create error response
 */
function jsonError(message: string, status: number): Response {
	return jsonResponse({ error: message, status }, status);
}

// ============================================================================
// D1 History API Handlers
// ============================================================================

// In-memory cache for airline mappings (loaded from D1)
let airlineMappingCache: Record<string, string> | null = null;
let airlineCacheTime = 0;
const AIRLINE_CACHE_TTL = 3600000; // 1 hour in ms

/**
 * Get airline ICAO to IATA code mapping from D1
 * Caches results for 1 hour
 * Returns: { ICAO_CODE: IATA_CODE, ... } e.g., { "UPS": "5X", "CPA": "CX" }
 */
async function getAirlineMapping(env: Env): Promise<Record<string, string>> {
	const now = Date.now();
	
	// Return cached mapping if still valid
	if (airlineMappingCache && (now - airlineCacheTime) < AIRLINE_CACHE_TTL) {
		return airlineMappingCache;
	}
	
	try {
		const result = await env.DB.prepare(`
			SELECT icao_code, iata_code FROM airlines
		`).all();
		
		const mapping: Record<string, string> = {};
		for (const row of result.results) {
			mapping[row.icao_code as string] = row.iata_code as string;
		}
		
		airlineMappingCache = mapping;
		airlineCacheTime = now;
		return mapping;
	} catch (error) {
		// Return empty mapping on error (will skip airline name resolution)
		console.error("Failed to load airline mapping:", error);
		return {};
	}
}

/**
 * Normalize flight number by removing spaces and converting to uppercase
 * Also resolves ICAO codes to IATA codes using D1 lookup
 * Examples:
 *   "NH814" → "NH 814"
 *   "nh 814" → "NH 814"  
 *   "UPS055" → "5X 055" (ICAO → IATA conversion)
 *   "CPA888" → "CX 888" (ICAO → IATA conversion)
 */
async function normalizeFlightNumber(input: string, env: Env): Promise<string> {
	// Remove all spaces and convert to uppercase
	const normalized = input.replace(/\s+/g, "").toUpperCase();

	// Try to match airline code + flight number pattern
	const match = normalized.match(/^([A-Z0-9]+)(\d+)$/);
	if (!match) {
		return normalized;
	}

	let airlineCode = match[1];
	const flightNum = match[2];

	// If it looks like an ICAO code (3 letters), try to resolve to IATA code
	if (airlineCode.length >= 3 && /^[A-Z]+$/.test(airlineCode)) {
		const mapping = await getAirlineMapping(env);
		const iataCode = mapping[airlineCode];
		if (iataCode) {
			airlineCode = iataCode;
		}
	}

	// Return in standard format with space: "XX 123"
	return `${airlineCode} ${flightNum}`;
}

/**
 * Handle flight history requests - returns last N occurrences of a flight number
 * Supports fuzzy matching:
 *   - "NH814" finds "NH 814"
 *   - "ANA814" finds "NH 814" (airline name to IATA conversion)
 *   - Case insensitive
 */
async function handleFlightHistoryRequest(
	env: Env,
	flightNo: string,
	url: URL,
): Promise<Response> {
	if (!flightNo || flightNo.length < 2) {
		return jsonError("Invalid flight number", 400);
	}

	const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 100);
	const normalizedFlightNo = await normalizeFlightNumber(flightNo, env);

	try {
		const result = await env.DB.prepare(`
			SELECT date, time, flight_no, airline, origin_dest, status, 
			       gate_baggage, terminal, is_arrival, is_cargo, codeshares
			FROM flights 
			WHERE flight_no = ?
			ORDER BY date DESC, time DESC
			LIMIT ?
		`)
			.bind(normalizedFlightNo, limit)
			.all();

		return jsonResponse({
			flightNo: normalizedFlightNo,
			query: flightNo,
			count: result.results.length,
			flights: result.results.map(formatFlightRow),
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Database error";
		return jsonError(message, 500);
	}
}

/**
 * Handle gate history requests - returns departures from a specific gate
 */
async function handleGateHistoryRequest(
	env: Env,
	gate: string,
	url: URL,
): Promise<Response> {
	if (!gate) {
		return jsonError("Invalid gate", 400);
	}

	const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 100);

	try {
		const result = await env.DB.prepare(`
			SELECT date, time, flight_no, airline, origin_dest, status, 
			       gate_baggage, terminal, is_arrival, is_cargo
			FROM flights 
			WHERE gate_baggage = ? AND is_arrival = 0
			ORDER BY date DESC, time DESC
			LIMIT ?
		`)
			.bind(gate, limit)
			.all();

		return jsonResponse({
			gate,
			count: result.results.length,
			departures: result.results.map(formatFlightRow),
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Database error";
		return jsonError(message, 500);
	}
}

/**
 * Handle date history requests - returns all flights for a specific date
 * Replaces the static daily/{date}.json files
 */
async function handleDateHistoryRequest(env: Env, date: string): Promise<Response> {
	// Validate date format (YYYY-MM-DD)
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		return jsonError("Invalid date format. Use YYYY-MM-DD", 400);
	}

	try {
		const result = await env.DB.prepare(`
			SELECT date, time, flight_no, airline, origin_dest, status, 
			       gate_baggage, terminal, is_arrival, is_cargo, codeshares
			FROM flights 
			WHERE date = ?
			ORDER BY time, flight_no
		`)
			.bind(date)
			.all();

		// Calculate statistics
		const flights = result.results || [];
		let arrivals = 0, departures = 0, cargo = 0, passenger = 0;
		
		for (const f of flights) {
			if (f.is_arrival === 1) arrivals++; else departures++;
			if (f.is_cargo === 1) cargo++; else passenger++;
		}

		return jsonResponse({
			date,
			generatedAt: new Date().toISOString(),
			totalFlights: flights.length,
			arrivals,
			departures,
			cargo,
			passenger,
			flights: flights.map(formatFlightRowForDaily),
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Database error";
		return jsonError(message, 500);
	}
}

/**
 * Format a database row to match the daily snapshot format
 */
function formatFlightRowForDaily(row: Record<string, unknown>): Record<string, unknown> {
	const codeshares = row.codeshares ? JSON.parse(row.codeshares as string) : [];
	// Build flight array: primary flight + codeshares
	const flights = [
		{ no: row.flight_no, airline: row.airline }
	];
	for (const cs of codeshares) {
		flights.push({ no: cs, airline: cs.replace(/\s?\d+$/, '') });
	}

	return {
		date: row.date,
		time: row.time,
		flight: flights,
		origin_dest: (row.origin_dest as string || '').split(',').map(s => s.trim()).filter(Boolean),
		status: row.status,
		gate_baggage: row.gate_baggage,
		terminal: row.terminal,
		isArrival: row.is_arrival === 1,
		isCargo: row.is_cargo === 1,
		_raw: {},
	};
}

/**
 * Handle search requests - search flights by various criteria
 */
async function handleSearchRequest(env: Env, url: URL): Promise<Response> {
	const query = url.searchParams.get("q")?.toUpperCase();
	const date = url.searchParams.get("date");
	const airline = url.searchParams.get("airline")?.toUpperCase();
	const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 100);

	if (!query && !date && !airline) {
		return jsonError(
			"At least one search parameter required: q, date, or airline",
			400,
		);
	}

	try {
		let sql = `
			SELECT date, time, flight_no, airline, origin_dest, status, 
			       gate_baggage, terminal, is_arrival, is_cargo
			FROM flights 
			WHERE 1=1
		`;
		const bindings: unknown[] = [];

		if (query) {
			sql += ` AND (flight_no LIKE ? OR origin_dest LIKE ?)`;
			bindings.push(`%${query}%`, `%${query}%`);
		}

		if (date) {
			sql += ` AND date = ?`;
			bindings.push(date);
		}

		if (airline) {
			sql += ` AND airline = ?`;
			bindings.push(airline);
		}

		sql += ` ORDER BY date DESC, time DESC LIMIT ?`;
		bindings.push(limit);

		const result = await env.DB.prepare(sql).bind(...bindings).all();

		return jsonResponse({
			query: { q: query, date, airline },
			count: result.results.length,
			flights: result.results.map(formatFlightRow),
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Database error";
		return jsonError(message, 500);
	}
}

/**
 * Handle stats requests - returns database statistics
 */
async function handleStatsRequest(env: Env): Promise<Response> {
	try {
		const [totalResult, dateRangeResult, airlinesResult] = await Promise.all([
			env.DB.prepare("SELECT COUNT(*) as total FROM flights").first(),
			env.DB.prepare(
				"SELECT MIN(date) as oldest, MAX(date) as newest FROM flights",
			).first(),
			env.DB.prepare(
				"SELECT COUNT(DISTINCT airline) as airlines FROM flights",
			).first(),
		]);

		return jsonResponse({
			totalFlights: (totalResult as { total: number })?.total || 0,
			dateRange: {
				oldest: (dateRangeResult as { oldest: string })?.oldest || null,
				newest: (dateRangeResult as { newest: string })?.newest || null,
			},
			uniqueAirlines: (airlinesResult as { airlines: number })?.airlines || 0,
			generatedAt: new Date().toISOString(),
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Database error";
		return jsonError(message, 500);
	}
}

/**
 * Handle flight list requests - returns all unique flight numbers for autocomplete
 * Cached for 1 hour since this data changes infrequently
 */
async function handleFlightListRequest(env: Env, ctx: ExecutionContext): Promise<Response> {
	// Create a unique cache key
	const cacheKey = new Request("https://hkg-flight-cache/flight-list", { method: "GET" });
	const cache = caches.default;

	// Check cache first
	let response = await cache.match(cacheKey);
	if (response) {
		const headers = new Headers(response.headers);
		headers.set("X-Cache", "HIT");
		return new Response(response.body, { status: response.status, headers });
	}

	try {
		// Query distinct flight numbers with their airline codes
		const result = await env.DB.prepare(`
			SELECT DISTINCT flight_no, airline
			FROM flights
			ORDER BY airline, flight_no
		`).all();

		const flights = (result.results || []).map((row: Record<string, unknown>) => ({
			no: row.flight_no as string,
			airline: row.airline as string,
		}));

		const responseData = {
			count: flights.length,
			generatedAt: new Date().toISOString(),
			flights,
		};

		response = new Response(JSON.stringify(responseData), {
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
				...CORS_HEADERS,
				"X-Cache": "MISS",
			},
		});

		// Store in cache (non-blocking)
		ctx.waitUntil(cache.put(cacheKey, response.clone()));

		return response;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Database error";
		return jsonError(message, 500);
	}
}

/**
 * Format a database row to API response format
 */
function formatFlightRow(row: Record<string, unknown>): Record<string, unknown> {
	return {
		date: row.date,
		time: row.time,
		flightNo: row.flight_no,
		airline: row.airline,
		originDest: row.origin_dest,
		status: row.status,
		gateBaggage: row.gate_baggage,
		terminal: row.terminal,
		isArrival: row.is_arrival === 1,
		isCargo: row.is_cargo === 1,
		codeshares: row.codeshares ? JSON.parse(row.codeshares as string) : null,
	};
}
