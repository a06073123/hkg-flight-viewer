/**
 * Gate Utilities
 *
 * Helper functions for mapping gate/stand data with flight information.
 */

import {
    type StandInfo,
    getStandsByArea,
} from "@/lib/map-coords";
import type { FlightRecord } from "@/types/flight";
import type { ApronArea, GateStatus } from "@/types/map";
import { GateStatus as GateStatusEnum } from "@/types/map";

/**
 * Gate display data combining stand info with flight data
 */
export interface GateDisplayData {
	/** Stand ID (e.g., "N5", "D201") */
	id: string;
	/** Gate number for display */
	gateNumber: string;
	/** Apron area */
	area: ApronArea;
	/** Maximum aircraft size */
	size: "F" | "E" | "C";
	/** Current flight (if any) */
	flight?: FlightRecord;
	/** Current status */
	status: GateStatus;
	/** Flight number display */
	flightNumber?: string;
}

/**
 * Get all gates for an area
 */
export function getGatesForArea(area: ApronArea): readonly StandInfo[] {
	return getStandsByArea(area);
}

/**
 * Determine gate status from flight data
 */
function getGateStatus(flight: FlightRecord | undefined): GateStatus {
	if (!flight) return GateStatusEnum.Idle;

	const status = flight.status.raw.toLowerCase();

	// Boarding, Final Call, Gate Closed = Boarding state
	if (
		status.includes("boarding") ||
		status.includes("final call") ||
		status.includes("gate closed")
	) {
		return GateStatusEnum.Boarding;
	}

	// Scheduled, Delayed, At Gate = Scheduled state
	if (
		status.includes("scheduled") ||
		status.includes("delayed") ||
		status.includes("at gate") ||
		status.includes("est")
	) {
		return GateStatusEnum.Scheduled;
	}

	// Departed, Cancelled = Idle
	if (status.includes("dep") || status.includes("cancelled")) {
		return GateStatusEnum.Idle;
	}

	// Default to scheduled if there's a flight
	return GateStatusEnum.Scheduled;
}

/**
 * Combine stand info with flight data for display
 */
export function getGateDisplayData(
	stands: readonly StandInfo[],
	gateFlightMap: Map<string, FlightRecord>
): GateDisplayData[] {
	// Group by gate number to avoid duplicates (L/R splits)
	const gateGroups = new Map<string, StandInfo[]>();

	for (const stand of stands) {
		const existing = gateGroups.get(stand.gateNumber) ?? [];
		existing.push(stand);
		gateGroups.set(stand.gateNumber, existing);
	}

	// Convert to display data
	const result: GateDisplayData[] = [];

	for (const [gateNumber, standsInGroup] of gateGroups) {
		// Use first stand as representative (they share the same gate number)
		const stand = standsInGroup[0];
		const flight = gateFlightMap.get(gateNumber);

		result.push({
			id: stand.id,
			gateNumber,
			area: stand.area,
			size: stand.size,
			flight,
			status: getGateStatus(flight),
			flightNumber: flight?.operatingCarrier
				? `${flight.operatingCarrier.airline}${flight.operatingCarrier.flightNumber}`
				: undefined,
		});
	}

	// Sort by gate number numerically
	result.sort((a, b) => {
		const numA = parseInt(a.gateNumber, 10);
		const numB = parseInt(b.gateNumber, 10);
		return numA - numB;
	});

	return result;
}
