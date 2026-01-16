/**
 * HKIA Flight API Service
 *
 * Handles real-time API calls and static JSON loading
 */

import {
	type ArchivedFlightItem,
	parseApiResponse,
	parseArchivedFlights,
} from "@/lib/parser";
import type { FlightRecord, RawApiResponse } from "@/types/flight";

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = "https://www.hongkongairport.com/flightinfo-rest/rest";
const STATIC_DATA_BASE = "/data";

export const POLLING_INTERVAL = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// REAL-TIME API
// ============================================================================

interface FetchFlightsOptions {
	date: string; // YYYY-MM-DD
	lang?: string;
	arrival: boolean;
	cargo: boolean;
}

/**
 * Fetch flights from HKIA API
 */
export async function fetchFlightsFromApi(
	options: FetchFlightsOptions,
): Promise<FlightRecord[]> {
	const { date, lang = "en", arrival, cargo } = options;

	const url = new URL(`${API_BASE_URL}/flights`);
	url.searchParams.set("date", date);
	url.searchParams.set("lang", lang);
	url.searchParams.set("arrival", String(arrival));
	url.searchParams.set("cargo", String(cargo));

	const response = await fetch(url.toString());

	if (!response.ok) {
		throw new Error(`API request failed: ${response.status}`);
	}

	const data: RawApiResponse = await response.json();
	return parseApiResponse(data, arrival, cargo);
}

/**
 * Fetch all flight categories for a given date
 */
export async function fetchAllFlights(
	date: string,
	lang = "en",
): Promise<FlightRecord[]> {
	const categories: Array<{ arrival: boolean; cargo: boolean }> = [
		{ arrival: true, cargo: false },
		{ arrival: false, cargo: false },
		{ arrival: true, cargo: true },
		{ arrival: false, cargo: true },
	];

	const results = await Promise.all(
		categories.map((cat) => fetchFlightsFromApi({ date, lang, ...cat })),
	);

	return results.flat();
}

/**
 * Fetch arrivals only (passenger + cargo)
 */
export async function fetchArrivals(
	date: string,
	lang = "en",
): Promise<FlightRecord[]> {
	const [passenger, cargo] = await Promise.all([
		fetchFlightsFromApi({ date, lang, arrival: true, cargo: false }),
		fetchFlightsFromApi({ date, lang, arrival: true, cargo: true }),
	]);
	return [...passenger, ...cargo];
}

/**
 * Fetch departures only (passenger + cargo)
 */
export async function fetchDepartures(
	date: string,
	lang = "en",
): Promise<FlightRecord[]> {
	const [passenger, cargo] = await Promise.all([
		fetchFlightsFromApi({ date, lang, arrival: false, cargo: false }),
		fetchFlightsFromApi({ date, lang, arrival: false, cargo: true }),
	]);
	return [...passenger, ...cargo];
}

/**
 * Fetch cargo flights only (arrivals + departures)
 */
export async function fetchCargoFlights(
	date: string,
	lang = "en",
): Promise<FlightRecord[]> {
	const [arrivals, departures] = await Promise.all([
		fetchFlightsFromApi({ date, lang, arrival: true, cargo: true }),
		fetchFlightsFromApi({ date, lang, arrival: false, cargo: true }),
	]);
	return [...arrivals, ...departures];
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
