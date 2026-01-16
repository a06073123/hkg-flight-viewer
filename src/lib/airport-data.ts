/**
 * Airport Data Service
 *
 * Provides airport code to name mapping using airport-codes dataset
 * Data source: https://github.com/datasets/airport-codes
 * (Updated nightly from OurAirports.com)
 *
 * Use `npm run fetch:airports` to update the data
 */

// ============================================================================
// TYPES
// ============================================================================

export interface AirportInfo {
	/** Airport name */
	name: string;
	/** City/Municipality name */
	city: string | null;
	/** ISO country code */
	country: string | null;
	/** ICAO 4-letter code */
	icao: string | null;
	/** Airport type (large_airport, medium_airport, small_airport) */
	type?: string | null;
	/** Continent code */
	continent?: string | null;
}

// ============================================================================
// CACHE
// ============================================================================

let airportCache: Record<string, AirportInfo> | null = null;
let cachePromise: Promise<Record<string, AirportInfo>> | null = null;

// ============================================================================
// DATA LOADING
// ============================================================================

/**
 * Fetch airport data from airports.json
 */
async function fetchAirportData(): Promise<Record<string, AirportInfo>> {
	if (airportCache) {
		return airportCache;
	}

	if (cachePromise) {
		return cachePromise;
	}

	cachePromise = (async () => {
		try {
			const response = await fetch("/data/airports/airports.json");
			if (!response.ok) {
				console.warn("Failed to load airport data, using fallback");
				return {};
			}
			const data = (await response.json()) as Record<string, AirportInfo>;
			airportCache = data;
			return data;
		} catch (error) {
			console.error("Error loading airport data:", error);
			return {};
		}
	})();

	return cachePromise;
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get airport info by IATA code (async)
 */
export async function getAirportInfoAsync(
	code: string,
): Promise<AirportInfo | null> {
	const airports = await fetchAirportData();
	return airports[code.toUpperCase()] || null;
}

/**
 * Get airport name by IATA code (async)
 * Returns the airport name, or city name if available
 */
export async function getAirportNameAsync(code: string): Promise<string> {
	const info = await getAirportInfoAsync(code);
	if (!info) return code;

	// Use city if available, otherwise airport name
	return info.city || info.name || code;
}

/**
 * Format airport display (async)
 * Returns: "City Name" or code if not found
 */
export async function formatAirportAsync(code: string): Promise<string> {
	return getAirportNameAsync(code);
}

// ============================================================================
// SYNCHRONOUS API (for components that can't use async)
// Uses pre-loaded cache, returns fallback if not loaded yet
// ============================================================================

/**
 * Get airport name by IATA code (sync)
 * Uses cached data - call initAirportData() first for best results
 */
export function getAirportName(code: string): string {
	if (!airportCache) {
		// Trigger async load for next time
		fetchAirportData();
		return code;
	}

	const info = airportCache[code.toUpperCase()];
	if (!info) return code;

	return info.city || info.name || code;
}

/**
 * Get full airport info (sync)
 */
export function getAirportInfo(code: string): AirportInfo | null {
	if (!airportCache) {
		fetchAirportData();
		return null;
	}
	return airportCache[code.toUpperCase()] || null;
}

/**
 * Initialize airport data cache
 * Call this early in app startup for sync functions to work
 */
export async function initAirportData(): Promise<void> {
	await fetchAirportData();
}

/**
 * Check if airport data is loaded
 */
export function isAirportDataLoaded(): boolean {
	return airportCache !== null;
}
