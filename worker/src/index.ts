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
	// Environment bindings (optional)
}

// HKIA API Configuration
const HKIA_API_BASE = "https://www.hongkongairport.com/flightinfo-rest/rest";
const HKIA_AIRLINES_URL =
	"https://www.hongkongairport.com/iwov-resources/custom/json/airline_en.json";

// Cache TTL (in seconds)
const CACHE_TTL = {
	FLIGHTS: 60, // 1 minute for live flight data
	AIRLINES: 12 * 60 * 60, // 12 hours for airline data (rarely changes)
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
				version: "2.1.0",
				endpoints: {
					"/api/flights":
						"Fetch today's flight data (HK time, all categories combined)",
					"/api/airlines":
						"Fetch airline information (check-in counters, names, etc.)",
					"/api/health": "Health check endpoint",
				},
				note: "Only returns current date in HK timezone. For historical data, use static archives.",
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
				"Cache-Control": `public, max-age=${CACHE_TTL.FLIGHTS}`,
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
				"Cache-Control": `public, max-age=${CACHE_TTL.AIRLINES}`,
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
