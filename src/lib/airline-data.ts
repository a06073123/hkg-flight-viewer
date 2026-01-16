/**
 * Airline Data Service
 *
 * Uses official HKIA airline data via Worker proxy:
 * GET /api/airlines → proxies https://www.hongkongairport.com/iwov-resources/custom/json/airline_en.json
 *
 * Provides airline names, transfer desks, check-in aisles, ground handling info
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Airline information from HKIA JSON
 */
export interface AirlineInfo {
	/** ICAO 3-letter code */
	icao3: string;

	/** IATA 2-letter code */
	iata2: string;

	/** Airline name */
	name: string;

	/** Terminal (T1 or T2) */
	terminal: string;

	/** Check-in aisles */
	aisle: string[];

	/** Transfer desk location(s) - "NA" means not available */
	transfer: string[];

	/** Ground handling agent */
	groundHandlingAgent: string[];

	/** Airline logo URL */
	icon?: string;
}

/**
 * Transfer desk mapping
 * E1 = Transfer E1 area
 * W1 = Transfer W1 area
 * NA = No transfer desk / Not applicable
 */
export const TransferDeskLocation = {
	E1: "E1",
	W1: "W1",
	NA: "N/A",
} as const;

export type TransferDeskLocation =
	(typeof TransferDeskLocation)[keyof typeof TransferDeskLocation];

// ============================================================================
// RAW TYPES FROM API
// ============================================================================

interface RawAirlineEntry {
	"icao-3": string;
	"iata-2": string;
	name: string;
	terminal: string;
	aisle: string[];
	transfer: string[];
	"ground-handling-agent": string[];
	icon?: string;
	"all-names"?: string[];
}

interface RawAirlineJson {
	airline: Record<string, RawAirlineEntry>;
}

// ============================================================================
// CACHE WITH REACTIVE SIGNAL
// ============================================================================

import { createSignal } from "solid-js";

let airlineCache: Map<string, AirlineInfo> | null = null;
let airlineCachePromise: Promise<Map<string, AirlineInfo>> | null = null;

/**
 * Reactive signal to track when airline data is loaded
 * Components can use this to re-render when data becomes available
 */
const [airlineDataVersion, setAirlineDataVersion] = createSignal(0);

/**
 * Get the current airline data version (for reactive updates)
 * Call this in a component to trigger re-render when data loads
 */
export function getAirlineDataVersion(): number {
	return airlineDataVersion();
}

// ============================================================================
// API CONFIGURATION
// ============================================================================

/**
 * Cloudflare Worker proxy URL for CORS bypass
 */
const API_BASE_URL = "https://hkg-flight-proxy.lincoln995623.workers.dev/api";

/**
 * Fetch and parse airline data from Worker proxy
 * Results are cached for the session
 */
export async function fetchAirlineData(): Promise<Map<string, AirlineInfo>> {
	// Return cached data if available
	if (airlineCache) {
		return airlineCache;
	}

	// Return existing promise if fetch is in progress
	if (airlineCachePromise) {
		return airlineCachePromise;
	}

	// Start fetching
	airlineCachePromise = (async () => {
		try {
			const response = await fetch(`${API_BASE_URL}/airlines`);
			if (!response.ok) {
				throw new Error(
					`Failed to fetch airline data: ${response.status}`,
				);
			}

			const data = (await response.json()) as RawAirlineJson;
			const airlines = new Map<string, AirlineInfo>();

			// Parse airline entries
			for (const [icao, entry] of Object.entries(data.airline || {})) {
				const info: AirlineInfo = {
					icao3: entry["icao-3"] || icao,
					iata2: entry["iata-2"] || "",
					name: entry.name || "",
					terminal: entry.terminal || "T1",
					aisle: entry.aisle || [],
					transfer: entry.transfer || ["NA"],
					groundHandlingAgent: entry["ground-handling-agent"] || [],
					icon: entry.icon,
				};

				// Index by both ICAO and IATA codes
				airlines.set(icao, info);
				if (info.iata2) {
					airlines.set(info.iata2, info);
				}
			}

			airlineCache = airlines;
			// Trigger reactive update for components using sync functions
			setAirlineDataVersion((v) => v + 1);
			return airlines;
		} catch (error) {
			console.error("Failed to fetch airline data:", error);
			// Return empty map on error
			return new Map<string, AirlineInfo>();
		}
	})();

	return airlineCachePromise;
}

/**
 * Get airline info by ICAO or IATA code
 */
export async function getAirlineInfo(
	code: string,
): Promise<AirlineInfo | undefined> {
	const airlines = await fetchAirlineData();
	return airlines.get(code.toUpperCase());
}

/**
 * Get transfer desk location for an airline
 * Returns the first valid transfer location or "N/A"
 */
export async function getTransferDesk(
	airlineCode: string,
): Promise<TransferDeskLocation> {
	const info = await getAirlineInfo(airlineCode);
	if (!info || !info.transfer || info.transfer.length === 0) {
		return TransferDeskLocation.NA;
	}

	const location = info.transfer[0];
	if (location === "NA" || location === "") {
		return TransferDeskLocation.NA;
	}

	// Return E1, W1, or the actual value
	if (location === "E1") return TransferDeskLocation.E1;
	if (location === "W1") return TransferDeskLocation.W1;

	// Some airlines have specific transfer locations like "E1"
	return location as TransferDeskLocation;
}

/**
 * Get transfer desk display text
 * Returns formatted string for UI display
 */
export function formatTransferDesk(transfer: string[]): string {
	if (!transfer || transfer.length === 0) return "—";

	const location = transfer[0];
	if (location === "NA" || location === "") return "—";

	// Format the transfer desk location
	return `Transfer ${location}`;
}

/**
 * Check if airline has transfer service
 */
export function hasTransferService(transfer: string[]): boolean {
	if (!transfer || transfer.length === 0) return false;
	const location = transfer[0];
	return location !== "NA" && location !== "";
}

// ============================================================================
// AIRLINE NAME FORMATTING
// ============================================================================

/**
 * Get airline display name from HKIA data by ICAO code
 * Returns formatted string: "Airline Name - ICAO"
 * Example: "Cathay Pacific - CPA"
 */
export async function getAirlineDisplayName(icaoCode: string): Promise<string> {
	const code = icaoCode.toUpperCase();
	const airlines = await fetchAirlineData();
	const info = airlines.get(code);

	if (info?.name) {
		return `${info.name} - ${code}`;
	}

	// Just return the code if nothing found
	return code;
}

/**
 * Get airline name only (without code)
 */
export async function getAirlineName(icaoCode: string): Promise<string> {
	const code = icaoCode.toUpperCase();
	const airlines = await fetchAirlineData();
	const info = airlines.get(code);

	if (info?.name) {
		return info.name;
	}

	return code;
}

/**
 * Get airline name synchronously (uses cached data)
 * Call initAirlineData() first for best results
 */
export function getAirlineNameSync(icaoCode: string): string {
	const code = icaoCode.toUpperCase();

	if (airlineCache) {
		const info = airlineCache.get(code);
		if (info?.name) {
			return info.name;
		}
	}

	// Trigger async load for next time
	fetchAirlineData();

	return code;
}

/**
 * Format airline display: "Airline Name - ICAO" (sync version)
 */
export function formatAirlineDisplay(icaoCode: string): string {
	const code = icaoCode.toUpperCase();
	const name = getAirlineNameSync(code);

	if (name === code) {
		return code;
	}

	return `${name} - ${code}`;
}

/**
 * Initialize airline data cache
 * Call this early in app startup
 */
export async function initAirlineData(): Promise<void> {
	await fetchAirlineData();
}

/**
 * Check if airline data is loaded
 */
export function isAirlineDataLoaded(): boolean {
	return airlineCache !== null;
}
