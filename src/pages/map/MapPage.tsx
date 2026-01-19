/**
 * Map Page
 *
 * Virtual airport map showing all passenger gates with real-time flight status.
 * Layout: Midfield Concourse at top, then Main Building (North/South/West aprons).
 *
 * Features:
 * - Gate markers with flight numbers and status colors
 * - Click on gate to show popup with live and historical data
 * - Grouped by terminal area for easy navigation
 */

import { createLiveAllFlightsResource } from "@/lib/resources";
import type { FlightRecord } from "@/types/flight";
import { GateStatus } from "@/types/map";
import { DoorOpen, Map, Plane, RefreshCw } from "lucide-solid";
import { createMemo, createSignal, For, Show } from "solid-js";
import { GateCard, GatePopup } from "./components";
import {
    getGateDisplayData,
    getGatesForArea,
    type GateDisplayData,
} from "./utils/gate-utils";

/** Gate status color classes */
const STATUS_COLORS = {
	[GateStatus.Boarding]: "bg-yellow-400 animate-pulse",
	[GateStatus.Scheduled]: "bg-blue-500",
	[GateStatus.Idle]: "bg-gray-300",
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

	// Get gates for each area with flight data
	const midfieldGates = createMemo(() =>
		getGateDisplayData(getGatesForArea("midfield"), gateFlightMap())
	);
	const northGates = createMemo(() =>
		getGateDisplayData(getGatesForArea("north"), gateFlightMap())
	);
	const southGates = createMemo(() =>
		getGateDisplayData(getGatesForArea("south"), gateFlightMap())
	);
	const westGates = createMemo(() =>
		getGateDisplayData(getGatesForArea("west"), gateFlightMap())
	);
	const satelliteGates = createMemo(() =>
		getGateDisplayData(getGatesForArea("satellite"), gateFlightMap())
	);

	// Stats
	const stats = createMemo(() => {
		const allGates = [
			...midfieldGates(),
			...northGates(),
			...southGates(),
			...westGates(),
			...satelliteGates(),
		];
		const occupied = allGates.filter((g) => g.status !== GateStatus.Idle).length;
		return {
			total: allGates.length,
			occupied,
			boarding: allGates.filter((g) => g.status === GateStatus.Boarding).length,
		};
	});

	const handleGateClick = (gate: GateDisplayData) => {
		setSelectedGate(gate);
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
						香港國際機場登機閘口地圖
					</p>
				</div>

				{/* Stats & Refresh */}
				<div class="flex items-center gap-3">
					<div class="flex items-center gap-4 text-sm">
						<div class="flex items-center gap-1.5">
							<DoorOpen class="h-4 w-4 text-gray-500" />
							<span class="text-gray-600">{stats().total} Gates</span>
						</div>
						<div class="flex items-center gap-1.5">
							<Plane class="h-4 w-4 text-blue-500" />
							<span class="text-gray-600">{stats().occupied} Active</span>
						</div>
						<div class="flex items-center gap-1.5">
							<span class={`h-3 w-3 rounded-full ${STATUS_COLORS[GateStatus.Boarding]}`} />
							<span class="text-gray-600">{stats().boarding} Boarding</span>
						</div>
					</div>
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
				<span class="text-xs font-medium text-gray-500 uppercase">Status:</span>
				<div class="flex items-center gap-1.5">
					<span class={`h-3 w-3 rounded-full ${STATUS_COLORS[GateStatus.Boarding]}`} />
					<span class="text-sm text-gray-600">Boarding</span>
				</div>
				<div class="flex items-center gap-1.5">
					<span class={`h-3 w-3 rounded-full ${STATUS_COLORS[GateStatus.Scheduled]}`} />
					<span class="text-sm text-gray-600">Scheduled</span>
				</div>
				<div class="flex items-center gap-1.5">
					<span class={`h-3 w-3 rounded-full ${STATUS_COLORS[GateStatus.Idle]}`} />
					<span class="text-sm text-gray-600">Idle</span>
				</div>
			</div>

			{/* Loading State */}
			<Show when={liveFlights.loading && !liveFlights()}>
				<div class="rounded-lg bg-white py-12 text-center text-gray-500 shadow">
					Loading flight data...
				</div>
			</Show>

			{/* Gate Areas */}
			<Show when={!liveFlights.loading || liveFlights()}>
				{/* T1 Midfield Concourse - Top */}
				<GateAreaSection
					title="T1 Midfield Concourse"
					subtitle="中場客運廊 • APM Connection"
					gates={midfieldGates()}
					onGateClick={handleGateClick}
					color="purple"
				/>

				{/* T1 Main Building */}
				<div class="space-y-4">
					<h2 class="text-lg font-semibold text-[#1A1A1B]">
						T1 Main Building
						<span class="ml-2 text-sm font-normal text-gray-500">
							主航廈大樓
						</span>
					</h2>

					<div class="grid gap-4 lg:grid-cols-2">
						{/* North Apron */}
						<GateAreaSection
							title="North Apron"
							subtitle="北面停機坪 • Gates N5-N70"
							gates={northGates()}
							onGateClick={handleGateClick}
							color="blue"
							compact
						/>

						{/* South Apron */}
						<GateAreaSection
							title="South Apron"
							subtitle="南面停機坪 • Gates S1-S47"
							gates={southGates()}
							onGateClick={handleGateClick}
							color="green"
							compact
						/>
					</div>

					<div class="grid gap-4 lg:grid-cols-2">
						{/* West Apron */}
						<GateAreaSection
							title="West Apron"
							subtitle="西面停機坪 • Gates W40-W71"
							gates={westGates()}
							onGateClick={handleGateClick}
							color="orange"
							compact
						/>

						{/* Satellite Concourse */}
						<GateAreaSection
							title="Satellite Concourse"
							subtitle="衛星客運廊 • Sky Bridge"
							gates={satelliteGates()}
							onGateClick={handleGateClick}
							color="teal"
							compact
						/>
					</div>
				</div>
			</Show>

			{/* Gate Popup */}
			<Show when={selectedGate()}>
				{(gate) => (
					<GatePopup
						gate={gate()}
						onClose={handleClosePopup}
					/>
				)}
			</Show>
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
		<div
			class={`rounded-xl border-2 p-4 ${areaColors[props.color]}`}
		>
			<div class="mb-3 flex items-center justify-between">
				<div>
					<h3 class={`font-semibold ${headerColors[props.color]}`}>
						{props.title}
					</h3>
					<p class="text-xs text-gray-500">{props.subtitle}</p>
				</div>
				<span class="text-sm text-gray-400">
					{props.gates.length} gates
				</span>
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
						<GateCard
							gate={gate}
							onClick={() => props.onGateClick(gate)}
						/>
					)}
				</For>
			</div>
		</div>
	);
}
