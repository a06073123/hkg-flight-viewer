/**
 * SolidJS Resource Hooks for Flight Data
 *
 * Uses SolidJS native createResource for data fetching
 * @see https://docs.solidjs.com/guides/fetching-data
 */

import type { FlightRecord } from "@/types/flight";
import { createResource, type Accessor } from "solid-js";
import {
	fetchAllFlights,
	fetchArrivals,
	fetchCargoFlights,
	fetchDepartures,
	loadDailySnapshot,
	loadFlightIndex,
	loadGateIndex,
} from "./api";

// ============================================================================
// STATIC DATA RESOURCES (Historical Data)
// ============================================================================

/**
 * Load daily snapshot from static JSON
 */
export function createDailySnapshotResource(date: Accessor<string>) {
	return createResource(date, async (d) => {
		if (!d) return null;
		return loadDailySnapshot(d);
	});
}

/**
 * Load flight history from static index
 */
export function createFlightHistoryResource(flightNo: Accessor<string>) {
	return createResource(flightNo, async (no) => {
		if (!no) return null;
		return loadFlightIndex(no);
	});
}

/**
 * Load gate history from static index
 */
export function createGateHistoryResource(gate: Accessor<string>) {
	return createResource(gate, async (g) => {
		if (!g) return null;
		return loadGateIndex(g);
	});
}

// ============================================================================
// LIVE API RESOURCES (Real-time Data)
// ============================================================================

/**
 * Get today's date in YYYY-MM-DD format (Hong Kong timezone)
 */
function getTodayHKT(): string {
	const now = new Date();
	// HKT is UTC+8
	const hkt = new Date(now.getTime() + 8 * 60 * 60 * 1000);
	return hkt.toISOString().split("T")[0];
}

/**
 * Fetch live arrivals from HKIA API
 */
export function createLiveArrivalsResource() {
	const [data, { refetch, mutate }] = createResource(
		async () => {
			const date = getTodayHKT();
			return fetchArrivals(date);
		},
		{ initialValue: [] as FlightRecord[] },
	);
	return [data, { refetch, mutate }] as const;
}

/**
 * Fetch live departures from HKIA API
 */
export function createLiveDeparturesResource() {
	const [data, { refetch, mutate }] = createResource(
		async () => {
			const date = getTodayHKT();
			return fetchDepartures(date);
		},
		{ initialValue: [] as FlightRecord[] },
	);
	return [data, { refetch, mutate }] as const;
}

/**
 * Fetch live cargo flights from HKIA API
 */
export function createLiveCargoResource() {
	const [data, { refetch, mutate }] = createResource(
		async () => {
			const date = getTodayHKT();
			return fetchCargoFlights(date);
		},
		{ initialValue: [] as FlightRecord[] },
	);
	return [data, { refetch, mutate }] as const;
}

/**
 * Fetch all live flights from HKIA API
 */
export function createLiveAllFlightsResource() {
	const [data, { refetch, mutate }] = createResource(
		async () => {
			const date = getTodayHKT();
			return fetchAllFlights(date);
		},
		{ initialValue: [] as FlightRecord[] },
	);
	return [data, { refetch, mutate }] as const;
}
