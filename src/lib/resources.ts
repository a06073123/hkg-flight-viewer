/**
 * SolidJS Resource Hooks for Flight Data
 *
 * Uses SolidJS native createResource for data fetching
 * @see https://docs.solidjs.com/guides/fetching-data
 */

import type { FlightRecord } from "@/types/flight";
import { createResource, type Accessor } from "solid-js";
import {
	fetchTodayFlights,
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
 * Fetch all live flights from Worker proxy
 * 
 * This is the primary resource for live data.
 * Components should use this and filter client-side to avoid
 * multiple API calls (the API returns all categories combined).
 */
export function createLiveAllFlightsResource() {
	const [data, { refetch, mutate }] = createResource(
		async () => {
			return fetchTodayFlights();
		},
		{ initialValue: [] as FlightRecord[] },
	);
	return [data, { refetch, mutate }] as const;
}
