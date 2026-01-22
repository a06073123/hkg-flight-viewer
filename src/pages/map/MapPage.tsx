/**
 * Map Page
 *
 * Virtual airport map showing HKIA Terminal 1 in actual Y-shape layout.
 * Gate markers positioned using real coordinates from map-coords.ts.
 *
 * Features:
 * - SVG-based map with actual terminal structure
 * - Gate markers with flight numbers and status colors
 * - Click on gate to show popup with live and historical data
 */

import { createLiveAllFlightsResource } from "@/lib/resources";
import type { FlightRecord } from "@/types/flight";
import { GateStatus } from "@/types/map";
import { DoorOpen, Map, Plane, RefreshCw } from "lucide-solid";
import { createMemo, createSignal, Show } from "solid-js";
import { GatePopup, SchematicMap } from "./components";
import { type GateDisplayData } from "./utils/gate-utils";

/** Legend color classes */
const LEGEND_COLORS = {
	boarding: "bg-emerald-500",
	scheduled: "bg-[#003580]",
	idle: "bg-gray-300",
} as const;

export default function MapPage() {
	// Load live flight data
	const [liveFlights, { refetch }] = createLiveAllFlightsResource();

	// Selected gate for popup
	const [selectedGate, setSelectedGate] = createSignal<GateDisplayData | null>(
		null
	);

	// Build gate-to-flight mapping from live data
	const gateFlightMap = createMemo(() => {
		const flights = liveFlights();
		if (!flights) return new globalThis.Map<string, FlightRecord>();

		const map = new globalThis.Map<string, FlightRecord>();
		// Only departures have gate assignments
		for (const flight of flights) {
			if (!flight.isArrival && flight.gate) {
				// Use gate number as key (e.g., "5", "23", "201")
				map.set(flight.gate, flight);
			}
		}
		return map;
	});

	// Total gate count (all bridge gates)
	const TOTAL_GATES = 76;

	// Stats computed from gateFlightMap
	const stats = createMemo(() => {
		const flightMap = gateFlightMap();
		let boarding = 0;

		for (const flight of flightMap.values()) {
			const status = flight.status.raw.toLowerCase();
			if (
				status.includes("boarding") ||
				status.includes("final call") ||
				status.includes("gate closed")
			) {
				boarding++;
			}
		}

		return {
			total: TOTAL_GATES,
			occupied: flightMap.size,
			boarding,
		};
	});

	// Handle gate click from SVG map
	const handleSvgGateClick = (gateNumber: string, flight?: FlightRecord) => {
		// Build simplified GateDisplayData for popup
		const gateData: GateDisplayData = {
			id: gateNumber,
			gateNumber,
			area: "north", // Default, popup will show correct info from flight
			flight,
			status: flight ? getStatusFromFlight(flight) : GateStatus.Idle,
			flightNumber: flight
				? `${flight.operatingCarrier.iataCode}${flight.operatingCarrier.flightNumber}`
				: undefined,
			destination: flight?.primaryAirport,
		};
		setSelectedGate(gateData);
	};

	const handleClosePopup = () => {
		setSelectedGate(null);
	};

	return (
		<div class="space-y-4 sm:space-y-6">
			{/* Header */}
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 class="flex items-center gap-2 text-xl font-bold text-[#1A1A1B] sm:text-2xl">
						<Map class="h-6 w-6 text-[#003580] sm:h-7 sm:w-7" />
						HKIA Virtual Map
					</h1>
					<p class="mt-1 text-sm text-gray-500">
						香港國際機場 T1 登機閘口地圖
					</p>
				</div>

				{/* Stats & Controls */}
				<div class="flex flex-wrap items-center gap-3">
					{/* Stats */}
					<div class="flex items-center gap-4 text-sm">
						<div class="flex items-center gap-1.5">
							<DoorOpen class="h-4 w-4 text-gray-500" />
							<span class="text-gray-600">{stats().total} Gates</span>
						</div>
						<div class="flex items-center gap-1.5">
							<Plane class="h-4 w-4 text-[#003580]" />
							<span class="text-gray-600">{stats().occupied} Active</span>
						</div>
						<div class="flex items-center gap-1.5">
							<span class={`h-3 w-3 rounded-full ${LEGEND_COLORS.boarding}`} />
							<span class="text-gray-600">{stats().boarding} Boarding</span>
						</div>
					</div>

					{/* Refresh */}
					<button
						type="button"
						onClick={() => refetch()}
						class="flex items-center gap-1.5 rounded-lg bg-[#003580] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#002560]"
						disabled={liveFlights.loading}
					>
						<RefreshCw
							class="h-4 w-4"
							classList={{ "animate-spin": liveFlights.loading }}
						/>
						Refresh
					</button>
				</div>
			</div>

			{/* Loading State */}
			<Show when={liveFlights.loading && !liveFlights()}>
				<div class="rounded-lg bg-white py-12 text-center text-gray-500 shadow">
					Loading flight data...
				</div>
			</Show>

			{/* Map View */}
			<Show when={!liveFlights.loading || liveFlights()}>
				<SchematicMap
					gateFlightMap={gateFlightMap()}
					onGateClick={handleSvgGateClick}
				/>
			</Show>

			{/* Gate Popup */}
			<Show when={selectedGate()}>
				{(gate) => <GatePopup gate={gate()} onClose={handleClosePopup} />}
			</Show>
		</div>
	);
}

/** Helper to determine status from flight */
function getStatusFromFlight(flight: FlightRecord): GateStatus {
	const status = flight.status.raw.toLowerCase();
	if (
		status.includes("boarding") ||
		status.includes("final call") ||
		status.includes("gate closed")
	) {
		return GateStatus.Boarding;
	}
	if (
		status.includes("scheduled") ||
		status.includes("delayed") ||
		status.includes("at gate") ||
		status.includes("est")
	) {
		return GateStatus.Scheduled;
	}
	return GateStatus.Idle;
}
