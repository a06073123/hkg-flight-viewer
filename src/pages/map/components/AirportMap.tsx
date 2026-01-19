/**
 * Airport Map Component (Bridge Gates Only)
 *
 * Renders HKIA Terminal 1 layout with only bridge-boarding gates.
 * Remote stands (bus boarding) are excluded - will be handled separately.
 *
 * Bridge Gates: 57 total
 * - N Series: 20 gates (N5-N70 frontal)
 * - S Series: 16 gates (S1-S47 frontal)
 * - W Series: 12 gates (W40-W71 frontal)
 * - R Series: 9 gates (R13-R21 satellite)
 *
 * Excluded Remote Stands:
 * - N141-N145 (5 gates)
 * - S101-S111 (11 gates)
 * - W121-W126 (6 gates)
 * - D201-D319 (38 gates) - Midfield uses APM, not direct bridge
 *
 * ViewBox: 836 283 830 652 (optimized for bridge gates only)
 */

import type { FlightRecord } from "@/types/flight";
import type { ApronArea } from "@/types/map";
import { GateStatus } from "@/types/map";
import { createMemo, For } from "solid-js";
import type { GateDisplayData } from "../utils/gate-utils";
import { GateCard } from "./GateCard";

export interface AirportMapProps {
	gateFlightMap: Map<string, FlightRecord>;
	onGateClick: (gateNumber: string, flight?: FlightRecord) => void;
}

// ============================================================================
// CONFIGURATION (based on bridge_gates_map.svg viewBox)
// ============================================================================

// SVG viewBox: "836 283 830 652" - optimized for bridge gates only
const VIEWBOX_X = 836;
const VIEWBOX_Y = 283;
const MAP_WIDTH = 830;
const MAP_HEIGHT = 652;

// Aspect ratio for CSS (width / height)
const ASPECT_RATIO = MAP_WIDTH / MAP_HEIGHT; // ~1.273

// Gate size as percentage of container width
const GATE_WIDTH_PERCENT = 5; // 5% of container width (larger due to smaller map)
const GATE_HEIGHT_PERCENT = GATE_WIDTH_PERCENT * ASPECT_RATIO;

// ============================================================================
// BRIDGE GATE COORDINATES (from bridge_gates_map.svg)
// Frontal stands only - passengers can walk directly via bridge
// ============================================================================

type GateArea = "north" | "south" | "west" | "satellite";

interface GateDefinition {
	id: string;
	x: number;
	y: number;
	area: GateArea;
}

// N Series - North Apron Frontal (20 gates)
const N_GATES: GateDefinition[] = [
	{ id: "N5", x: 1608, y: 512, area: "north" },
	{ id: "N6", x: 1641, y: 458, area: "north" },
	{ id: "N7", x: 1641, y: 409, area: "north" },
	{ id: "N8", x: 1640, y: 358, area: "north" },
	{ id: "N9", x: 1641, y: 307, area: "north" },
	{ id: "N10", x: 1573, y: 534, area: "north" },
	{ id: "N12", x: 1537, y: 555, area: "north" },
	{ id: "N24", x: 1489, y: 555, area: "north" },
	{ id: "N26", x: 1441, y: 556, area: "north" },
	{ id: "N28", x: 1389, y: 556, area: "north" },
	{ id: "N30", x: 1335, y: 556, area: "north" },
	{ id: "N32", x: 1284, y: 556, area: "north" },
	{ id: "N34", x: 1233, y: 555, area: "north" },
	{ id: "N36", x: 1179, y: 518, area: "north" },
	{ id: "N60", x: 1134, y: 477, area: "north" },
	{ id: "N62", x: 1092, y: 432, area: "north" },
	{ id: "N64", x: 1048, y: 392, area: "north" },
	{ id: "N66", x: 1004, y: 350, area: "north" },
	{ id: "N68", x: 927, y: 334, area: "north" },
	{ id: "N70", x: 865, y: 336, area: "north" },
];

// S Series - South Apron Frontal (16 gates)
const S_GATES: GateDefinition[] = [
	{ id: "S1", x: 1641, y: 760, area: "south" },
	{ id: "S2", x: 1641, y: 811, area: "south" },
	{ id: "S3", x: 1640, y: 860, area: "south" },
	{ id: "S4", x: 1641, y: 911, area: "south" },
	{ id: "S11", x: 1605, y: 708, area: "south" },
	{ id: "S23", x: 1554, y: 663, area: "south" },
	{ id: "S25", x: 1499, y: 662, area: "south" },
	{ id: "S27", x: 1448, y: 663, area: "south" },
	{ id: "S29", x: 1380, y: 662, area: "south" },
	{ id: "S31", x: 1330, y: 665, area: "south" },
	{ id: "S33", x: 1279, y: 663, area: "south" },
	{ id: "S35", x: 1230, y: 664, area: "south" },
	{ id: "S41", x: 1162, y: 712, area: "south" },
	{ id: "S43", x: 1127, y: 751, area: "south" },
	{ id: "S45", x: 1089, y: 787, area: "south" },
	{ id: "S47", x: 1052, y: 828, area: "south" },
];

// W Series - West Apron Frontal (12 gates)
const W_GATES: GateDefinition[] = [
	{ id: "W40", x: 1063, y: 650, area: "west" },
	{ id: "W42", x: 1023, y: 688, area: "west" },
	{ id: "W44", x: 986, y: 723, area: "west" },
	{ id: "W46", x: 949, y: 761, area: "west" },
	{ id: "W48", x: 911, y: 799, area: "west" },
	{ id: "W50", x: 877, y: 835, area: "west" },
	{ id: "W61", x: 1070, y: 582, area: "west" },
	{ id: "W63", x: 1035, y: 546, area: "west" },
	{ id: "W65", x: 1000, y: 510, area: "west" },
	{ id: "W67", x: 962, y: 476, area: "west" },
	{ id: "W69", x: 929, y: 440, area: "west" },
	{ id: "W71", x: 892, y: 406, area: "west" },
];

// R Series - Satellite Concourse (9 gates)
const R_GATES: GateDefinition[] = [
	{ id: "R13", x: 1514, y: 339, area: "satellite" },
	{ id: "R14", x: 1513, y: 368, area: "satellite" },
	{ id: "R15", x: 1513, y: 396, area: "satellite" },
	{ id: "R16", x: 1484, y: 429, area: "satellite" },
	{ id: "R17", x: 1454, y: 429, area: "satellite" },
	{ id: "R18", x: 1424, y: 429, area: "satellite" },
	{ id: "R19", x: 1424, y: 400, area: "satellite" },
	{ id: "R20", x: 1424, y: 371, area: "satellite" },
	{ id: "R21", x: 1423, y: 341, area: "satellite" },
];

// All bridge gates combined (57 gates total)
const BRIDGE_GATES: GateDefinition[] = [
	...N_GATES,
	...S_GATES,
	...W_GATES,
	...R_GATES,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get position as percentage for CSS (relative to viewBox)
 */
function getPercentPosition(
	x: number,
	y: number
): { leftPercent: number; topPercent: number } {
	return {
		leftPercent: ((x - VIEWBOX_X) / MAP_WIDTH) * 100,
		topPercent: ((y - VIEWBOX_Y) / MAP_HEIGHT) * 100,
	};
}

/**
 * Map GateArea to ApronArea type
 */
function mapGateAreaToApronArea(area: GateArea): ApronArea {
	switch (area) {
		case "north":
			return "north";
		case "south":
			return "south";
		case "west":
			return "west";
		case "satellite":
			return "satellite";
	}
}

function getGateStatus(flight: FlightRecord | undefined): GateStatus {
	if (!flight) return GateStatus.Idle;

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

function formatFlightNumber(flight: FlightRecord): string {
	const { iataCode, flightNumber } = flight.operatingCarrier;
	return `${iataCode}${flightNumber}`;
}

function getDestination(flight: FlightRecord | undefined): string | undefined {
	if (!flight) return undefined;
	return flight.primaryAirport;
}

function extractGateNumber(gateId: string): string {
	return gateId.replace(/^[NSWR]/, "");
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AirportMap(props: AirportMapProps) {
	const gatesWithStatus = createMemo(() => {
		return BRIDGE_GATES.map(
			(gate): GateDisplayData & { leftPercent: number; topPercent: number } => {
				const gateNumber = extractGateNumber(gate.id);
				const flight = props.gateFlightMap.get(gateNumber);
				const position = getPercentPosition(gate.x, gate.y);
				return {
					id: gate.id,
					gateNumber,
					area: mapGateAreaToApronArea(gate.area),
					flight,
					status: getGateStatus(flight),
					flightNumber: flight ? formatFlightNumber(flight) : undefined,
					destination: getDestination(flight),
					leftPercent: position.leftPercent,
					topPercent: position.topPercent,
				};
			}
		);
	});

	return (
		<div class="w-full overflow-auto rounded-xl bg-slate-100 p-4">
			{/* Legend */}
			<div class="mb-4 flex flex-wrap items-center gap-4 text-sm">
				<span class="font-semibold text-slate-600">登機橋閘口:</span>
				<div class="flex items-center gap-2">
					<div class="h-4 w-4 rounded border border-slate-300 bg-slate-200" />
					<span class="text-slate-600">空閒</span>
				</div>
				<div class="flex items-center gap-2">
					<div class="h-4 w-4 rounded border-2 border-blue-700 bg-blue-600" />
					<span class="text-slate-600">預定</span>
				</div>
				<div class="flex items-center gap-2">
					<div class="h-4 w-4 animate-pulse rounded border-2 border-emerald-600 bg-emerald-500" />
					<span class="text-slate-600">登機中</span>
				</div>
			</div>

			{/* Area Legend */}
			<div class="mb-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
				<span class="rounded bg-blue-500 px-2 py-0.5 text-white">N: 北</span>
				<span class="rounded bg-emerald-500 px-2 py-0.5 text-white">S: 南</span>
				<span class="rounded bg-purple-500 px-2 py-0.5 text-white">W: 西</span>
				<span class="rounded bg-amber-500 px-2 py-0.5 text-white">
					R: 衛星廳
				</span>
			</div>

			{/* Map Container - 100% width with fixed aspect ratio */}
			<div
				class="relative w-full rounded-lg bg-slate-50 shadow-inner"
				style={{
					"aspect-ratio": `${MAP_WIDTH} / ${MAP_HEIGHT}`,
				}}
			>
				{/* Gate Markers using GateCard */}
				<For each={gatesWithStatus()}>
					{(gate) => (
						<div
							class="absolute"
							style={{
								left: `${gate.leftPercent}%`,
								top: `${gate.topPercent}%`,
								width: `${GATE_WIDTH_PERCENT}%`,
								height: `${GATE_HEIGHT_PERCENT}%`,
								transform: "translate(-50%, -50%)",
							}}
						>
							<GateCard
								gate={gate}
								onClick={() => props.onGateClick(gate.gateNumber, gate.flight)}
							/>
						</div>
					)}
				</For>
			</div>

			{/* Stats */}
			<div class="mt-3 text-center text-xs text-slate-500">
				登機橋閘口: 57 (N: 20, S: 16, W: 12, R: 9) | 遠端閘口 (巴士登機) 將另行顯示
			</div>
		</div>
	);
}
