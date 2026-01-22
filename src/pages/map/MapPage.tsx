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
import { DoorOpen, Grid3X3, Map, Plane, RefreshCw } from "lucide-solid";
import { createMemo, createSignal, For, Show } from "solid-js";
import { AirportMap, GateCard, GatePopup } from "./components";
import {
	getGateDisplayData,
	getGatesForArea,
	type GateDisplayData,
} from "./utils/gate-utils";

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

	// View mode toggle (map vs grid)
	const [viewMode, setViewMode] = createSignal<"map" | "grid">("map");

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

	// Get gates for each area with flight data (for grid view)
	const allGatesDisplayData = createMemo(() => {
		const midfield = getGateDisplayData(
			getGatesForArea("midfield"),
			gateFlightMap()
		);
		const north = getGateDisplayData(
			getGatesForArea("north"),
			gateFlightMap()
		);
		const south = getGateDisplayData(
			getGatesForArea("south"),
			gateFlightMap()
		);
		const west = getGateDisplayData(getGatesForArea("west"), gateFlightMap());
		const satellite = getGateDisplayData(
			getGatesForArea("satellite"),
			gateFlightMap()
		);

		return { midfield, north, south, west, satellite };
	});

	// Stats
	const stats = createMemo(() => {
		const data = allGatesDisplayData();
		const allGates = [
			...data.midfield,
			...data.north,
			...data.south,
			...data.west,
			...data.satellite,
		];
		const occupied = allGates.filter(
			(g) => g.status !== GateStatus.Idle
		).length;
		return {
			total: allGates.length,
			occupied,
			boarding: allGates.filter((g) => g.status === GateStatus.Boarding)
				.length,
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

					{/* View Toggle */}
					<div class="flex rounded-lg border border-gray-200 bg-white p-0.5">
						<button
							type="button"
							onClick={() => setViewMode("map")}
							class={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
								viewMode() === "map"
									? "bg-[#003580] text-white"
									: "text-gray-600 hover:bg-gray-100"
							}`}
						>
							<Map class="h-4 w-4" />
							Map
						</button>
						<button
							type="button"
							onClick={() => setViewMode("grid")}
							class={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
								viewMode() === "grid"
									? "bg-[#003580] text-white"
									: "text-gray-600 hover:bg-gray-100"
							}`}
						>
							<Grid3X3 class="h-4 w-4" />
							Grid
						</button>
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

			{/* Legend */}
			<div class="flex flex-wrap items-center gap-4 rounded-lg bg-white p-3 shadow-sm sm:gap-6">
				<span class="text-xs font-medium uppercase text-gray-500">
					Status:
				</span>
				<div class="flex items-center gap-1.5">
					<span class={`h-3 w-3 rounded-full ${LEGEND_COLORS.boarding}`} />
					<span class="text-sm text-gray-600">Boarding</span>
				</div>
				<div class="flex items-center gap-1.5">
					<span class={`h-3 w-3 rounded-full ${LEGEND_COLORS.scheduled}`} />
					<span class="text-sm text-gray-600">Scheduled</span>
				</div>
				<div class="flex items-center gap-1.5">
					<span class={`h-3 w-3 rounded-full ${LEGEND_COLORS.idle}`} />
					<span class="text-sm text-gray-600">Idle</span>
				</div>
				<span class="mx-2 text-gray-300">|</span>
				<div class="flex items-center gap-1.5">
					<span class="h-3 w-3 rounded-full bg-yellow-400 ring-1 ring-yellow-500" />
					<span class="text-sm text-gray-600">Jet Bridge</span>
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
				<Show
					when={viewMode() === "map"}
					fallback={
						<GridView
							data={allGatesDisplayData()}
							onGateClick={setSelectedGate}
						/>
					}
				>
					<AirportMap
						gateFlightMap={gateFlightMap()}
						onGateClick={handleSvgGateClick}
					/>
				</Show>
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

/** Grid View Component (original layout) */
interface GridViewProps {
	data: {
		midfield: GateDisplayData[];
		north: GateDisplayData[];
		south: GateDisplayData[];
		west: GateDisplayData[];
		satellite: GateDisplayData[];
	};
	onGateClick: (gate: GateDisplayData) => void;
}

function GridView(props: GridViewProps) {
	return (
		<div class="space-y-4">
			{/* Midfield */}
			<GateAreaSection
				title="T1 Midfield Concourse"
				subtitle="中場客運廊 • APM Connection"
				gates={props.data.midfield}
				onGateClick={props.onGateClick}
				color="purple"
			/>

			{/* Main Building */}
			<div class="space-y-4">
				<h2 class="text-lg font-semibold text-[#1A1A1B]">
					T1 Main Building
					<span class="ml-2 text-sm font-normal text-gray-500">
						主航廈大樓
					</span>
				</h2>

				<div class="grid gap-4 lg:grid-cols-2">
					<GateAreaSection
						title="North Apron"
						subtitle="北面停機坪"
						gates={props.data.north}
						onGateClick={props.onGateClick}
						color="blue"
						compact
					/>
					<GateAreaSection
						title="South Apron"
						subtitle="南面停機坪"
						gates={props.data.south}
						onGateClick={props.onGateClick}
						color="green"
						compact
					/>
				</div>

				<div class="grid gap-4 lg:grid-cols-2">
					<GateAreaSection
						title="West Apron"
						subtitle="西面停機坪"
						gates={props.data.west}
						onGateClick={props.onGateClick}
						color="orange"
						compact
					/>
					<GateAreaSection
						title="Satellite Concourse"
						subtitle="衛星客運廊 • Sky Bridge"
						gates={props.data.satellite}
						onGateClick={props.onGateClick}
						color="teal"
						compact
					/>
				</div>
			</div>
		</div>
	);
}

/** Gate area section component */
interface GateAreaSectionProps {
	title: string;
	subtitle: string;
	gates: GateDisplayData[];
	onGateClick: (gate: GateDisplayData) => void;
	color: "purple" | "blue" | "green" | "orange" | "teal";
	compact?: boolean;
}

const areaColors = {
	purple: "border-purple-200 bg-purple-50/50",
	blue: "border-blue-200 bg-blue-50/50",
	green: "border-emerald-200 bg-emerald-50/50",
	orange: "border-orange-200 bg-orange-50/50",
	teal: "border-teal-200 bg-teal-50/50",
};

const headerColors = {
	purple: "text-purple-700",
	blue: "text-blue-700",
	green: "text-emerald-700",
	orange: "text-orange-700",
	teal: "text-teal-700",
};

function GateAreaSection(props: GateAreaSectionProps) {
	return (
		<div class={`rounded-xl border-2 p-4 ${areaColors[props.color]}`}>
			<div class="mb-3 flex items-center justify-between">
				<div>
					<h3 class={`font-semibold ${headerColors[props.color]}`}>
						{props.title}
					</h3>
					<p class="text-xs text-gray-500">{props.subtitle}</p>
				</div>
				<span class="text-sm text-gray-400">{props.gates.length} gates</span>
			</div>

			<div
				class={`grid gap-2 ${
					props.compact
						? "grid-cols-4 xs:grid-cols-5 sm:grid-cols-6 md:grid-cols-8"
						: "grid-cols-5 xs:grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12"
				}`}
			>
				<For each={props.gates}>
					{(gate) => (
						<GateCard gate={gate} onClick={() => props.onGateClick(gate)} />
					)}
				</For>
			</div>
		</div>
	);
}
