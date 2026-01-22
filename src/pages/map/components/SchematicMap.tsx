/**
 * Schematic Airport Map Component
 *
 * A cleaner, more readable airport map using a schematic/diagram approach
 * instead of trying to match exact geographic positions.
 *
 * Design principles:
 * 1. Clear terminal structure with labeled areas
 * 2. Gates grouped by area with consistent spacing
 * 3. Small markers with hover tooltips for details
 * 4. Connection lines showing APM and Sky Bridge
 *
 * Layout (top to bottom, left to right):
 * - Left: Midfield Concourse (D gates)
 * - Center: Main Terminal (Y-shape with N/S/W aprons)
 * - Right-top: Satellite Concourse (R gates)
 */

import type { FlightRecord } from "@/types/flight";
import { GateStatus } from "@/types/map";
import { createMemo, For } from "solid-js";
import type { GateDisplayData } from "../utils/gate-utils";
import { GateMarker } from "./GateMarker";

export interface SchematicMapProps {
	gateFlightMap: Map<string, FlightRecord>;
	onGateClick: (gateNumber: string, flight?: FlightRecord) => void;
}

// ============================================================================
// SCHEMATIC GATE DEFINITIONS
// Redesigned coordinates for clear, non-overlapping layout
// Using a virtual grid: 0-100 for both X and Y
// ============================================================================

interface SchematicGate {
	id: string;
	gateNumber: string;
	x: number; // 0-100 percentage
	y: number; // 0-100 percentage
	area: "midfield" | "north" | "south" | "west" | "satellite";
}

// Midfield Concourse - Left side (D201-D219)
const MIDFIELD_GATES: SchematicGate[] = [
	// Left column (even) - D202 to D218 (9 gates)
	{ id: "D202", gateNumber: "202", x: 4, y: 10, area: "midfield" },
	{ id: "D204", gateNumber: "204", x: 4, y: 20, area: "midfield" },
	{ id: "D206", gateNumber: "206", x: 4, y: 30, area: "midfield" },
	{ id: "D208", gateNumber: "208", x: 4, y: 40, area: "midfield" },
	{ id: "D210", gateNumber: "210", x: 4, y: 50, area: "midfield" },
	{ id: "D212", gateNumber: "212", x: 4, y: 60, area: "midfield" },
	{ id: "D214", gateNumber: "214", x: 4, y: 70, area: "midfield" },
	{ id: "D216", gateNumber: "216", x: 4, y: 80, area: "midfield" },
	{ id: "D218", gateNumber: "218", x: 4, y: 90, area: "midfield" },
	// Right column (odd) - D201 to D219 (10 gates)
	{ id: "D201", gateNumber: "201", x: 11, y: 5, area: "midfield" },
	{ id: "D203", gateNumber: "203", x: 11, y: 15, area: "midfield" },
	{ id: "D205", gateNumber: "205", x: 11, y: 25, area: "midfield" },
	{ id: "D207", gateNumber: "207", x: 11, y: 35, area: "midfield" },
	{ id: "D209", gateNumber: "209", x: 11, y: 45, area: "midfield" },
	{ id: "D211", gateNumber: "211", x: 11, y: 55, area: "midfield" },
	{ id: "D213", gateNumber: "213", x: 11, y: 65, area: "midfield" },
	{ id: "D215", gateNumber: "215", x: 11, y: 75, area: "midfield" },
	{ id: "D217", gateNumber: "217", x: 11, y: 85, area: "midfield" },
	{ id: "D219", gateNumber: "219", x: 11, y: 95, area: "midfield" },
];

// North Apron - Top right of main terminal
// N5-N9: vertical column on right edge
// N10-N36: horizontal row in middle
// N60-N70: diagonal upper arm
const NORTH_GATES: SchematicGate[] = [
	// N5-N9 vertical column (right edge, 5 gates, Y: 5-40)
	{ id: "N9", gateNumber: "9", x: 97, y: 17, area: "north" },
	{ id: "N8", gateNumber: "8", x: 97, y: 24, area: "north" },
	{ id: "N7", gateNumber: "7", x: 97, y: 31, area: "north" },
	{ id: "N6", gateNumber: "6", x: 97, y: 38, area: "north" },
	{ id: "N5", gateNumber: "5", x: 97, y: 45, area: "north" },
	// N10-N36 horizontal row (9 gates, X: 50-92)
	{ id: "N10", gateNumber: "10", x: 92, y: 50, area: "north" },
	{ id: "N12", gateNumber: "12", x: 86, y: 50, area: "north" },
	{ id: "N24", gateNumber: "24", x: 80, y: 50, area: "north" },
	{ id: "N26", gateNumber: "26", x: 74, y: 50, area: "north" },
	{ id: "N28", gateNumber: "28", x: 68, y: 50, area: "north" },
	{ id: "N30", gateNumber: "30", x: 62, y: 50, area: "north" },
	{ id: "N32", gateNumber: "32", x: 56, y: 50, area: "north" },
	{ id: "N34", gateNumber: "34", x: 50, y: 50, area: "north" },
	{ id: "N36", gateNumber: "36", x: 44, y: 50, area: "north" },
	// N60-N70 diagonal (6 gates, going up-left)
	{ id: "N60", gateNumber: "60", x: 42, y: 44, area: "north" },
	{ id: "N62", gateNumber: "62", x: 38, y: 38, area: "north" },
	{ id: "N64", gateNumber: "64", x: 34, y: 32, area: "north" },
	{ id: "N66", gateNumber: "66", x: 30, y: 26, area: "north" },
	{ id: "N68", gateNumber: "68", x: 26, y: 20, area: "north" },
	{ id: "N70", gateNumber: "70", x: 22, y: 14, area: "north" },
];

// South Apron - Bottom right of main terminal
// S1-S4: vertical column on right edge (below N5-N9)
// S11-S35: horizontal row (below N10-N36)
// S41-S47: diagonal lower arm
const SOUTH_GATES: SchematicGate[] = [
	// S1-S4 vertical column (right edge, 4 gates)
	{ id: "S1", gateNumber: "1", x: 97, y: 65, area: "south" },
	{ id: "S2", gateNumber: "2", x: 97, y: 72, area: "south" },
	{ id: "S3", gateNumber: "3", x: 97, y: 79, area: "south" },
	{ id: "S4", gateNumber: "4", x: 97, y: 86, area: "south" },
	// S11-S35 horizontal row (8 gates, X: 50-92)
	{ id: "S11", gateNumber: "11", x: 92, y: 60, area: "south" },
	{ id: "S23", gateNumber: "23", x: 86, y: 60, area: "south" },
	{ id: "S25", gateNumber: "25", x: 80, y: 60, area: "south" },
	{ id: "S27", gateNumber: "27", x: 74, y: 60, area: "south" },
	{ id: "S29", gateNumber: "29", x: 68, y: 60, area: "south" },
	{ id: "S31", gateNumber: "31", x: 62, y: 60, area: "south" },
	{ id: "S33", gateNumber: "33", x: 56, y: 60, area: "south" },
	{ id: "S35", gateNumber: "35", x: 50, y: 60, area: "south" },
	// S41-S47 diagonal (4 gates, going down-left)
	{ id: "S41", gateNumber: "41", x: 48, y: 66, area: "south" },
	{ id: "S43", gateNumber: "43", x: 44, y: 72, area: "south" },
	{ id: "S45", gateNumber: "45", x: 40, y: 78, area: "south" },
	{ id: "S47", gateNumber: "47", x: 36, y: 84, area: "south" },
];

// West Apron - Y-shape center stem
// W61-W71: upper diagonal (between N60-70)
// W40-W50: lower diagonal (between S41-47)
const WEST_GATES: SchematicGate[] = [
	// W61-W71 (upper diagonal, 6 gates)
	{ id: "W71", gateNumber: "71", x: 18, y: 14, area: "west" },
	{ id: "W69", gateNumber: "69", x: 22, y: 20, area: "west" },
	{ id: "W67", gateNumber: "67", x: 26, y: 26, area: "west" },
	{ id: "W65", gateNumber: "65", x: 30, y: 32, area: "west" },
	{ id: "W63", gateNumber: "63", x: 34, y: 38, area: "west" },
	{ id: "W61", gateNumber: "61", x: 38, y: 44, area: "west" },
	// W40-W50 (lower diagonal, 6 gates)
	{ id: "W40", gateNumber: "40", x: 44, y: 56, area: "west" },
	{ id: "W42", gateNumber: "42", x: 40, y: 62, area: "west" },
	{ id: "W44", gateNumber: "44", x: 36, y: 68, area: "west" },
	{ id: "W46", gateNumber: "46", x: 32, y: 74, area: "west" },
	{ id: "W48", gateNumber: "48", x: 28, y: 80, area: "west" },
	{ id: "W50", gateNumber: "50", x: 24, y: 86, area: "west" },
];

// Satellite Concourse - Top center (R13-R21)
// Arranged in 3 columns, spread out more
const SATELLITE_GATES: SchematicGate[] = [
	// Left column (R19-R21)
	{ id: "R21", gateNumber: "21", x: 58, y: 5, area: "satellite" },
	{ id: "R20", gateNumber: "20", x: 58, y: 15, area: "satellite" },
	{ id: "R19", gateNumber: "19", x: 58, y: 25, area: "satellite" },
	// Middle row (R16-R18)
	{ id: "R18", gateNumber: "18", x: 70, y: 35, area: "satellite" },
	{ id: "R17", gateNumber: "17", x: 64, y: 35, area: "satellite" },
	{ id: "R16", gateNumber: "16", x: 58, y: 35, area: "satellite" },
	// Right column (R13-R15)
	{ id: "R15", gateNumber: "15", x: 76, y: 5, area: "satellite" },
	{ id: "R14", gateNumber: "14", x: 76, y: 15, area: "satellite" },
	{ id: "R13", gateNumber: "13", x: 76, y: 25, area: "satellite" },
];

// All gates combined
const ALL_SCHEMATIC_GATES: SchematicGate[] = [
	...MIDFIELD_GATES,
	...NORTH_GATES,
	...SOUTH_GATES,
	...WEST_GATES,
	...SATELLITE_GATES,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SchematicMap(props: SchematicMapProps) {
	const gatesWithStatus = createMemo(() => {
		return ALL_SCHEMATIC_GATES.map((gate): GateDisplayData & { x: number; y: number } => {
			const flight = props.gateFlightMap.get(gate.gateNumber);
			return {
				id: gate.id,
				gateNumber: gate.gateNumber,
				area: gate.area,
				flight,
				status: getGateStatus(flight),
				flightNumber: flight ? formatFlightNumber(flight) : undefined,
				destination: flight?.primaryAirport,
				x: gate.x,
				y: gate.y,
			};
		});
	});

	return (
		<div class="w-full overflow-hidden rounded-xl bg-linear-to-br from-slate-50 to-slate-100 shadow-inner">
			{/* Map Container - Larger size */}
			<div
				class="relative mx-auto w-full"
				style={{
					"aspect-ratio": "16 / 10",
					"max-height": "80vh",
				}}
			>
				{/* Gate Markers Layer */}
				<div class="absolute inset-0">
					<For each={gatesWithStatus()}>
						{(gate) => (
							<div
								class="absolute"
								style={{
									left: `${gate.x}%`,
									top: `${gate.y}%`,
									transform: "translate(-50%, -50%)",
								}}
							>
								<GateMarker
									gate={gate}
									onClick={() => props.onGateClick(gate.gateNumber, gate.flight)}
								/>
							</div>
						)}
					</For>
				</div>
			</div>

			{/* Bottom Legend */}
			<div class="border-t border-slate-200 bg-white/80 px-4 py-3">
				<div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
					<div class="flex items-center gap-4">
						<span class="font-medium text-slate-600">Status:</span>
						<div class="flex items-center gap-1.5">
							<span class="h-3 w-3 rounded bg-emerald-500" />
							<span class="text-slate-600">Boarding</span>
						</div>
						<div class="flex items-center gap-1.5">
							<span class="h-3 w-3 rounded bg-[#003580]" />
							<span class="text-slate-600">Scheduled</span>
						</div>
						<div class="flex items-center gap-1.5">
							<span class="h-3 w-3 rounded bg-gray-300" />
							<span class="text-slate-600">Idle</span>
						</div>
					</div>
					<span class="text-slate-300">|</span>
					<span class="text-slate-500">
						76 Bridge Gates • Click gate for details
					</span>
				</div>
			</div>
		</div>
	);
}
