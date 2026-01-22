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
 * Also provides D1 database access for historical data.
 */
const API_BASE_URL = "https://hkg-flight-proxy.lincoln995623.workers.dev/api";

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
// D1 API (Historical Data via Worker)
// ============================================================================

/**
 * D1 API flight record format
 */
interface D1FlightRecord {
	date: string;
	time: string;
	flightNo: string;
	airline: string;
	originDest: string;
	status: string;
	gateBaggage: string;
	terminal: string;
	isArrival: boolean;
	isCargo: boolean;
	codeshares: string[] | null;
}

/**
 * D1 flight history response
 */
interface D1FlightHistoryResponse {
	flightNo: string;
	count: number;
	flights: D1FlightRecord[];
}

/**
 * D1 gate history response
 */
interface D1GateHistoryResponse {
	gate: string;
	count: number;
	departures: D1FlightRecord[];
}

/**
 * Convert D1 API record to ArchivedFlightItem format for parsing
 */
function convertD1FlightToArchived(d1: D1FlightRecord): ArchivedFlightItem {
	// Build flight array with primary flight and codeshares
	const flights: Array<{ no: string; airline: string }> = [
		{ no: d1.flightNo, airline: d1.airline },
	];

	if (d1.codeshares) {
		for (const cs of d1.codeshares) {
			// Extract airline code from codeshare (e.g., "GF 4062" -> "GF")
			const airlineCode = cs.split(" ")[0] || "";
			flights.push({ no: cs, airline: airlineCode });
		}
	}

	return {
		date: d1.date,
		time: d1.time,
		flight: flights,
		origin_dest: d1.originDest ? d1.originDest.split(",").map(s => s.trim()) : [],
		status: d1.status,
		gate_baggage: d1.gateBaggage,
		terminal: d1.terminal,
		isArrival: d1.isArrival,
		isCargo: d1.isCargo,
		_raw: { aisle: "", hall: "" },
	};
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
 * Flight history index (loaded from D1 API)
 */
export interface FlightIndex {
	flightNo: string;
	updatedAt: string;
	occurrences: FlightRecord[];
}

/**
 * Gate usage index (loaded from D1 API)
 */
export interface GateIndex {
	gate: string;
	updatedAt: string;
	departures: FlightRecord[];
}

/**
 * Load daily snapshot from D1 API and parse into FlightRecord format
 */
export async function loadDailySnapshot(
	date: string,
): Promise<LoadedDailySnapshot | null> {
	try {
		const response = await fetch(`${API_BASE_URL}/history/date/${date}`);
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
 * Load flight history index from D1 API
 */
export async function loadFlightIndex(
	flightNo: string,
): Promise<FlightIndex | null> {
	try {
		// D1 API stores flight numbers with spaces (e.g., "CX 888")
		// We need to preserve the format for URL encoding
		const encoded = encodeURIComponent(flightNo);
		const response = await fetch(
			`${API_BASE_URL}/history/flight/${encoded}?limit=100`,
		);
		if (!response.ok) return null;

		const data: D1FlightHistoryResponse = await response.json();
		return {
			flightNo: data.flightNo,
			updatedAt: new Date().toISOString(),
			occurrences: data.flights.map(convertD1FlightToArchived).flatMap(f => parseArchivedFlights([f])),
		};
	} catch (error) {
		console.error("Failed to load flight history from D1:", error);
		return null;
	}
}

/**
 * Load gate usage index from D1 API
 */
export async function loadGateIndex(gate: string): Promise<GateIndex | null> {
	try {
		const response = await fetch(
			`${API_BASE_URL}/history/gate/${encodeURIComponent(gate)}?limit=100`,
		);
		if (!response.ok) return null;

		const data: D1GateHistoryResponse = await response.json();
		return {
			gate: data.gate,
			updatedAt: new Date().toISOString(),
			departures: data.departures.map(convertD1FlightToArchived).flatMap(f => parseArchivedFlights([f])),
		};
	} catch (error) {
		console.error("Failed to load gate history from D1:", error);
		return null;
	}
}

// ============================================================================
// FLIGHT LIST INDEX
// ============================================================================

/**
 * Flight list entry for search autocomplete
 */
export interface FlightListEntry {
	/** Flight number with spaces (e.g., "CX 888") - matches D1 format */
	flightNo: string;
	/** Airline code (e.g., "CX") */
	airline: string;
}

/**
 * Raw D1 flight list response
 */
interface D1FlightListResponse {
	count: number;
	generatedAt: string;
	flights: Array<{
		no: string;
		airline: string;
	}>;
}

/**
 * Load flight numbers list from D1 API
 * Uses the Worker's /api/flight-list endpoint for search autocomplete
 *
 * @returns Array of flight number entries
 */
export async function loadFlightNumbersList(): Promise<FlightListEntry[]> {
	try {
		const response = await fetch(`${API_BASE_URL}/flight-list`);

		if (!response.ok) {
			console.warn("Failed to load flight list from D1 API");
			return [];
		}

		const data: D1FlightListResponse = await response.json();
		return (data.flights || []).map((f) => ({
			flightNo: f.no,
			airline: f.airline,
		}));
	} catch (error) {
		console.error("Failed to load flight numbers list:", error);
		return [];
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
