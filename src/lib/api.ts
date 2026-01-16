/**
 * HKIA Flight API Service
 *
 * Handles real-time API calls (via Cloudflare Worker proxy) and static JSON loading
 *
 * Architecture:
 * - Live data: Single call to Worker proxy → returns all categories combined
 * - Historical data: Static JSON files from /data/daily/*.json
 */

import { type ArchivedFlightItem, parseArchivedFlights } from "@/lib/parser";
import type { FlightRecord } from "@/types/flight";

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Cloudflare Worker proxy URL
 * Required for CORS bypass + 403 prevention
 * Worker returns today's flights (HK time) with all categories combined.
 */
const API_BASE_URL = "https://hkg-flight-proxy.lincoln995623.workers.dev/api";

/**
 * GitHub raw URL for static data files
 * Data is stored in the repo and fetched directly from GitHub raw
 * This avoids bloating the build output with large JSON files
 */
const STATIC_DATA_BASE =
	"https://raw.githubusercontent.com/a06073123/hkg-flight-viewer/main/public/data";

export const POLLING_INTERVAL = 1 * 60 * 1000; // 1 minute (matches Worker cache TTL)

// ============================================================================
// REAL-TIME API (via Worker Proxy)
// ============================================================================

/**
 * Worker API response format
 */
interface WorkerFlightsResponse {
	date: string;
	generated: string;
	count: number;
	flights: ArchivedFlightItem[];
}

/**
 * Fetch today's flights from Worker proxy
 * Returns all categories (arrival/departure × passenger/cargo) combined
 */
export async function fetchTodayFlights(): Promise<FlightRecord[]> {
	if (!API_BASE_URL) {
		console.warn(
			"VITE_API_PROXY_URL not configured, returning empty array",
		);
		return [];
	}

	const response = await fetch(`${API_BASE_URL}/flights`);

	if (!response.ok) {
		throw new Error(`API request failed: ${response.status}`);
	}

	const data: WorkerFlightsResponse = await response.json();
	return parseArchivedFlights(data.flights);
}

/**
 * Fetch arrivals only (filters from combined data)
 */
export async function fetchArrivals(): Promise<FlightRecord[]> {
	const all = await fetchTodayFlights();
	return all.filter((f) => f.isArrival);
}

/**
 * Fetch departures only (filters from combined data)
 */
export async function fetchDepartures(): Promise<FlightRecord[]> {
	const all = await fetchTodayFlights();
	return all.filter((f) => !f.isArrival);
}

/**
 * Fetch cargo flights only (filters from combined data)
 */
export async function fetchCargoFlights(): Promise<FlightRecord[]> {
	const all = await fetchTodayFlights();
	return all.filter((f) => f.isCargo);
}

/**
 * Alias for fetchTodayFlights (backward compatibility)
 * @deprecated Use fetchTodayFlights() instead
 */
export async function fetchAllFlights(): Promise<FlightRecord[]> {
	return fetchTodayFlights();
}

// ============================================================================
// AIRLINE DATA (via Worker Proxy)
// ============================================================================

/**
 * Airline information from HKIA
 */
export interface AirlineInfo {
	"icao-3": string;
	"iata-2": string;
	name: string;
	"all-names": string[];
	terminal: string;
	aisle: string[];
	icon: string;
	"website-url": string;
	"ground-handling-agent": string[];
}

/**
 * Airlines API response
 */
export interface AirlinesResponse {
	airline: Record<string, AirlineInfo>;
	"ground-handling-agent": Record<string, { name: string; fullname: string }>;
}

/**
 * Fetch airline information from Worker proxy
 * Cached for 12 hours at edge
 */
export async function fetchAirlines(): Promise<AirlinesResponse | null> {
	if (!API_BASE_URL) {
		console.warn("VITE_API_PROXY_URL not configured");
		return null;
	}

	try {
		const response = await fetch(`${API_BASE_URL}/airlines`);

		if (!response.ok) {
			throw new Error(`API request failed: ${response.status}`);
		}

		return response.json();
	} catch (error) {
		console.error("Failed to fetch airlines:", error);
		return null;
	}
}

// ============================================================================
// STATIC JSON (Historical Data)
// ============================================================================

/**
 * Loaded daily snapshot (UI format)
 * Simplified from raw archive format
 */
export interface LoadedDailySnapshot {
	date: string;
	archivedAt: string;
	flights: FlightRecord[];
}

/**
 * Raw archived snapshot format from JSON files
 */
interface RawDailySnapshot {
	date: string;
	generatedAt: string;
	flights: ArchivedFlightItem[];
}

/**
 * Flight history index (loaded from static JSON)
 */
export interface FlightIndex {
	flightNo: string;
	updatedAt: string;
	occurrences: FlightRecord[];
}

/**
 * Gate usage index (loaded from static JSON)
 */
export interface GateIndex {
	gate: string;
	updatedAt: string;
	departures: FlightRecord[];
}

/**
 * Load daily snapshot from static JSON and parse into FlightRecord format
 */
export async function loadDailySnapshot(
	date: string,
): Promise<LoadedDailySnapshot | null> {
	try {
		const response = await fetch(`${STATIC_DATA_BASE}/daily/${date}.json`);
		if (!response.ok) return null;
		const raw: RawDailySnapshot = await response.json();
		return {
			date: raw.date,
			archivedAt: raw.generatedAt,
			flights: parseArchivedFlights(raw.flights),
		};
	} catch {
		return null;
	}
}

/**
 * Load flight history index
 */
export async function loadFlightIndex(
	flightNo: string,
): Promise<FlightIndex | null> {
	try {
		// Normalize flight number: "CX 888" -> "CX888"
		const normalized = flightNo.replace(/\s+/g, "");
		const response = await fetch(
			`${STATIC_DATA_BASE}/indexes/flights/${normalized}.json`,
		);
		if (!response.ok) return null;
		const rawFlights: ArchivedFlightItem[] = await response.json();
		return {
			flightNo: normalized,
			updatedAt: new Date().toISOString(),
			occurrences: parseArchivedFlights(rawFlights),
		};
	} catch {
		return null;
	}
}

/**
 * Load gate usage index
 */
export async function loadGateIndex(gate: string): Promise<GateIndex | null> {
	try {
		const response = await fetch(
			`${STATIC_DATA_BASE}/indexes/gates/${gate}.json`,
		);
		if (!response.ok) return null;
		const rawFlights: ArchivedFlightItem[] = await response.json();
		return {
			gate,
			updatedAt: new Date().toISOString(),
			departures: parseArchivedFlights(rawFlights),
		};
	} catch {
		return null;
	}
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Get today's date in YYYY-MM-DD format (HKT timezone)
 */
export function getTodayDate(): string {
	return new Date().toLocaleDateString("en-CA", {
		timeZone: "Asia/Hong_Kong",
	});
}

/**
 * Normalize string by removing spaces and converting to lowercase
 */
function normalizeForSearch(str: string): string {
	return str.replace(/\s+/g, "").toLowerCase();
}

/**
 * Filter flights by search query
 * Supports space-insensitive matching (e.g., "uo192" matches "UO 192")
 */
export function filterFlights(
	flights: FlightRecord[],
	query: string,
): FlightRecord[] {
	if (!query.trim()) return flights;

	const normalizedQuery = normalizeForSearch(query);
	const lowerQuery = query.toLowerCase().trim();

	return flights.filter((flight) => {
		// Search by flight number (space-insensitive)
		const flightNoMatch = flight.flights.some((f) => {
			const normalizedNo = normalizeForSearch(f.no);
			return normalizedNo.includes(normalizedQuery);
		});

		// Search by airport code
		const airportMatch =
			flight.primaryAirport.toLowerCase().includes(lowerQuery) ||
			flight.route.some((r) => r.toLowerCase().includes(lowerQuery));

		// Search by airline
		const airlineMatch = flight.flights.some((f) =>
			f.airline.toLowerCase().includes(lowerQuery),
		);

		return flightNoMatch || airportMatch || airlineMatch;
	});
}

/**
 * Sort flights by time
 */
export function sortFlightsByTime(
	flights: FlightRecord[],
	ascending = true,
): FlightRecord[] {
	return [...flights].sort((a, b) => {
		const timeA = a.time.replace(":", "");
		const timeB = b.time.replace(":", "");
		return ascending
			? timeA.localeCompare(timeB)
			: timeB.localeCompare(timeA);
	});
}
